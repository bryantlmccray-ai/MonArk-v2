-- Create tables for adaptive discovery system

-- Track user's dating journey stages and transitions
CREATE TABLE public.user_journey_stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  stage TEXT NOT NULL, -- 'single', 'dating', 'exploring', 'committed', 'healing', 'growth'
  stage_start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  stage_end_date TIMESTAMP WITH TIME ZONE,
  transition_reason TEXT, -- 'new_relationship', 'breakup', 'self_focus', etc.
  stage_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Track behavioral patterns and relationship outcomes
CREATE TABLE public.relationship_outcomes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  match_user_id UUID,
  relationship_type TEXT NOT NULL, -- 'casual', 'serious', 'hookup', 'friendship'
  outcome TEXT NOT NULL, -- 'ongoing', 'ended_mutual', 'ended_user', 'ended_partner', 'ghosted'
  duration_days INTEGER,
  satisfaction_rating INTEGER, -- 1-10 scale
  what_worked JSONB, -- array of things that worked
  what_didnt_work JSONB, -- array of things that didn't work
  lessons_learned TEXT,
  would_date_similar BOOLEAN,
  outcome_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Track behavioral patterns over time
CREATE TABLE public.behavioral_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pattern_type TEXT NOT NULL, -- 'communication', 'dating_frequency', 'preference_changes'
  pattern_data JSONB NOT NULL,
  confidence_score NUMERIC DEFAULT 0.5,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Store adaptive insights and nudges
CREATE TABLE public.adaptive_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  insight_type TEXT NOT NULL, -- 'pattern_recognition', 'preference_shift', 'growth_opportunity'
  insight_title TEXT NOT NULL,
  insight_content TEXT NOT NULL,
  actionable_suggestions JSONB,
  confidence_level NUMERIC DEFAULT 0.5,
  delivered BOOLEAN DEFAULT false,
  engaged BOOLEAN DEFAULT false,
  dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_journey_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relationship_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.behavioral_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adaptive_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_journey_stages
CREATE POLICY "Users can manage their own journey stages"
ON public.user_journey_stages
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for relationship_outcomes
CREATE POLICY "Users can manage their own relationship outcomes"
ON public.relationship_outcomes
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for behavioral_patterns
CREATE POLICY "Users can view their own behavioral patterns"
ON public.behavioral_patterns
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can create behavioral patterns"
ON public.behavioral_patterns
FOR INSERT
WITH CHECK (true);

-- RLS Policies for adaptive_insights
CREATE POLICY "Users can manage their own adaptive insights"
ON public.adaptive_insights
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_user_journey_stages_user_id ON public.user_journey_stages(user_id);
CREATE INDEX idx_user_journey_stages_stage ON public.user_journey_stages(stage, stage_end_date);
CREATE INDEX idx_relationship_outcomes_user_id ON public.relationship_outcomes(user_id);
CREATE INDEX idx_behavioral_patterns_user_id ON public.behavioral_patterns(user_id, is_active);
CREATE INDEX idx_adaptive_insights_user_id ON public.adaptive_insights(user_id, delivered);

-- Function to update journey stage
CREATE OR REPLACE FUNCTION public.update_journey_stage()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_user_journey_stages_timestamp
BEFORE UPDATE ON public.user_journey_stages
FOR EACH ROW
EXECUTE FUNCTION public.update_journey_stage();

CREATE TRIGGER update_adaptive_insights_timestamp
BEFORE UPDATE ON public.adaptive_insights
FOR EACH ROW
EXECUTE FUNCTION public.update_journey_stage();