-- Weekly EQ Settings (user preferences for weekly options)
CREATE TABLE IF NOT EXISTS public.weekly_eq_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  energy_level TEXT NOT NULL DEFAULT 'moderate', -- low, moderate, high
  conversation_style TEXT NOT NULL DEFAULT 'balanced', -- quiet, balanced, talkative
  crowd_tolerance TEXT NOT NULL DEFAULT 'medium', -- intimate, medium, lively
  duration_preference INTEGER NOT NULL DEFAULT 90, -- minutes
  time_boundaries JSONB DEFAULT '{"earliest": "10:00", "latest": "22:00"}'::jsonb,
  values_priority JSONB DEFAULT '[]'::jsonb,
  radius_km INTEGER NOT NULL DEFAULT 10,
  budget_range TEXT NOT NULL DEFAULT 'moderate', -- budget, moderate, premium
  active_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Weekly Options (the 3 guaranteed options per user per week)
CREATE TABLE IF NOT EXISTS public.weekly_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  week_start TIMESTAMPTZ NOT NULL,
  option_number INTEGER NOT NULL CHECK (option_number BETWEEN 1 AND 3),
  title TEXT NOT NULL,
  vibe_line TEXT NOT NULL,
  time_window JSONB NOT NULL, -- {start: timestamp, end: timestamp}
  distance_km NUMERIC,
  eq_fit_chips JSONB NOT NULL DEFAULT '[]'::jsonb,
  care_index_score NUMERIC NOT NULL DEFAULT 0.8,
  why_this_for_you TEXT NOT NULL,
  venue_data JSONB,
  is_template BOOLEAN DEFAULT false,
  is_expired BOOLEAN DEFAULT false,
  tapped_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_start, option_number)
);

-- Itineraries (created from option taps)
CREATE TABLE IF NOT EXISTS public.itineraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  counterpart_user_id UUID,
  weekly_option_id UUID REFERENCES public.weekly_options(id),
  mode TEXT NOT NULL, -- 'discovery', 'matched', 'byo'
  title TEXT NOT NULL,
  description TEXT,
  time_window JSONB NOT NULL,
  location_data JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'proposed', -- proposed, confirmed, completed, cancelled
  safety_sharing_enabled BOOLEAN NOT NULL DEFAULT true,
  sos_visible BOOLEAN NOT NULL DEFAULT true,
  consent_nudge_shown BOOLEAN NOT NULL DEFAULT false,
  share_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- After-Action Feedback
CREATE TABLE IF NOT EXISTS public.itinerary_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id UUID NOT NULL REFERENCES public.itineraries(id),
  user_id UUID NOT NULL,
  feeling TEXT NOT NULL, -- 'great', 'neutral', 'not_a_fit'
  action_taken TEXT NOT NULL, -- 'advance', 'kind_close', 'no_action'
  next_plan_suggested JSONB,
  close_message_sent TEXT,
  eq_adjustments JSONB, -- updates for next week's settings
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Care Index Scores (quality/safety ratings for venues)
CREATE TABLE IF NOT EXISTS public.venue_care_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES public.venues(id),
  overall_score NUMERIC NOT NULL DEFAULT 0.8,
  safety_score NUMERIC NOT NULL DEFAULT 0.8,
  quality_score NUMERIC NOT NULL DEFAULT 0.8,
  accessibility_score NUMERIC NOT NULL DEFAULT 0.8,
  lgbtq_friendly_score NUMERIC NOT NULL DEFAULT 0.8,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Analytics events for behavior tracking
CREATE TABLE IF NOT EXISTS public.behavior_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL, -- option_viewed, option_tapped, itinerary_created, feedback_submitted, etc.
  event_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.weekly_eq_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itinerary_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_care_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.behavior_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for weekly_eq_settings
CREATE POLICY "Users can manage their own EQ settings"
  ON public.weekly_eq_settings
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for weekly_options
CREATE POLICY "Users can view their own weekly options"
  ON public.weekly_options
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create weekly options"
  ON public.weekly_options
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own weekly options"
  ON public.weekly_options
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for itineraries
CREATE POLICY "Users can view their own itineraries"
  ON public.itineraries
  FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = counterpart_user_id);

CREATE POLICY "Users can create their own itineraries"
  ON public.itineraries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own itineraries"
  ON public.itineraries
  FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = counterpart_user_id);

-- RLS Policies for itinerary_feedback
CREATE POLICY "Users can manage their own feedback"
  ON public.itinerary_feedback
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for venue_care_scores
CREATE POLICY "Anyone can view venue care scores"
  ON public.venue_care_scores
  FOR SELECT
  USING (true);

-- RLS Policies for behavior_analytics
CREATE POLICY "Users can create their own analytics"
  ON public.behavior_analytics
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own analytics"
  ON public.behavior_analytics
  FOR SELECT
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_weekly_options_user_week ON public.weekly_options(user_id, week_start);
CREATE INDEX IF NOT EXISTS idx_weekly_options_expired ON public.weekly_options(is_expired) WHERE is_expired = false;
CREATE INDEX IF NOT EXISTS idx_itineraries_user ON public.itineraries(user_id);
CREATE INDEX IF NOT EXISTS idx_itineraries_status ON public.itineraries(status);
CREATE INDEX IF NOT EXISTS idx_behavior_analytics_user_event ON public.behavior_analytics(user_id, event_type, created_at);