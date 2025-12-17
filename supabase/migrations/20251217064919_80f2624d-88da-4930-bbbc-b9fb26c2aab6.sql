-- User sessions table for retention tracking
CREATE TABLE public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_end TIMESTAMP WITH TIME ZONE,
  device_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own sessions
CREATE POLICY "Users can view their own sessions"
ON public.user_sessions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
ON public.user_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
ON public.user_sessions FOR UPDATE
USING (auth.uid() = user_id);

-- Admin can view all sessions
CREATE POLICY "Admins can view all sessions"
ON public.user_sessions FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Weekly options engagement tracking
CREATE TABLE public.weekly_options_engagement (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  week_start DATE NOT NULL,
  options_viewed INTEGER DEFAULT 0,
  options_tapped INTEGER DEFAULT 0,
  viewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_start)
);

-- Enable RLS
ALTER TABLE public.weekly_options_engagement ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own engagement"
ON public.weekly_options_engagement FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own engagement"
ON public.weekly_options_engagement FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own engagement"
ON public.weekly_options_engagement FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all engagement"
ON public.weekly_options_engagement FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Match to date conversion tracking
CREATE TABLE public.match_conversions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  match_user_id UUID NOT NULL,
  conversation_id TEXT NOT NULL,
  matched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  first_message_at TIMESTAMP WITH TIME ZONE,
  date_proposed_at TIMESTAMP WITH TIME ZONE,
  date_completed_at TIMESTAMP WITH TIME ZONE,
  conversion_status TEXT NOT NULL DEFAULT 'matched', -- matched, messaging, date_proposed, date_completed, expired
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.match_conversions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversions"
ON public.match_conversions FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = match_user_id);

CREATE POLICY "Users can insert their own conversions"
ON public.match_conversions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversions"
ON public.match_conversions FOR UPDATE
USING (auth.uid() = user_id OR auth.uid() = match_user_id);

CREATE POLICY "Admins can view all conversions"
ON public.match_conversions FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- MVP KPI aggregates (for dashboard)
CREATE TABLE public.kpi_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  snapshot_date DATE NOT NULL,
  total_users INTEGER DEFAULT 0,
  active_users_daily INTEGER DEFAULT 0,
  active_users_weekly INTEGER DEFAULT 0,
  active_users_monthly INTEGER DEFAULT 0,
  weekly_options_view_rate NUMERIC(5,2) DEFAULT 0,
  match_to_date_rate NUMERIC(5,2) DEFAULT 0,
  week2_retention_rate NUMERIC(5,2) DEFAULT 0,
  week4_retention_rate NUMERIC(5,2) DEFAULT 0,
  week8_retention_rate NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(snapshot_date)
);

-- Enable RLS
ALTER TABLE public.kpi_snapshots ENABLE ROW LEVEL SECURITY;

-- Only admins can view KPI snapshots
CREATE POLICY "Admins can view KPI snapshots"
ON public.kpi_snapshots FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert KPI snapshots"
ON public.kpi_snapshots FOR INSERT
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_session_start ON public.user_sessions(session_start);
CREATE INDEX idx_weekly_options_engagement_user_week ON public.weekly_options_engagement(user_id, week_start);
CREATE INDEX idx_match_conversions_user_id ON public.match_conversions(user_id);
CREATE INDEX idx_match_conversions_status ON public.match_conversions(conversion_status);
CREATE INDEX idx_kpi_snapshots_date ON public.kpi_snapshots(snapshot_date);