
-- Create RIF profiles table to store user emotional intelligence data
CREATE TABLE public.rif_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  intent_clarity DECIMAL(3,2) DEFAULT 0.0,
  pacing_preferences DECIMAL(3,2) DEFAULT 0.0,
  emotional_readiness DECIMAL(3,2) DEFAULT 0.0,
  boundary_respect DECIMAL(3,2) DEFAULT 0.0,
  post_date_alignment DECIMAL(3,2) DEFAULT 0.0,
  profile_version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create RIF feedback table for storing user responses
CREATE TABLE public.rif_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  feedback_type TEXT NOT NULL, -- 'onboarding', 'post_date', 'check_in', 'behavioral'
  data JSONB NOT NULL, -- encrypted feedback data
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create RIF settings table for user privacy preferences
CREATE TABLE public.rif_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  rif_enabled BOOLEAN DEFAULT false,
  ai_personalization_enabled BOOLEAN DEFAULT false,
  reflection_prompts_enabled BOOLEAN DEFAULT false,
  data_sharing_consent BOOLEAN DEFAULT false,
  crisis_resources_shown BOOLEAN DEFAULT false,
  last_consent_update TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create RIF recommendations table
CREATE TABLE public.rif_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  recommendation_type TEXT NOT NULL, -- 'match_filter', 'date_suggestion', 'reflection_prompt'
  content JSONB NOT NULL,
  delivered BOOLEAN DEFAULT false,
  engaged BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all RIF tables
ALTER TABLE public.rif_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rif_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rif_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rif_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS policies for rif_profiles
CREATE POLICY "Users can view their own RIF profile" 
  ON public.rif_profiles 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own RIF profile" 
  ON public.rif_profiles 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own RIF profile" 
  ON public.rif_profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- RLS policies for rif_feedback
CREATE POLICY "Users can view their own RIF feedback" 
  ON public.rif_feedback 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own RIF feedback" 
  ON public.rif_feedback 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- RLS policies for rif_settings
CREATE POLICY "Users can view their own RIF settings" 
  ON public.rif_settings 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own RIF settings" 
  ON public.rif_settings 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own RIF settings" 
  ON public.rif_settings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- RLS policies for rif_recommendations
CREATE POLICY "Users can view their own RIF recommendations" 
  ON public.rif_recommendations 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own RIF recommendations" 
  ON public.rif_recommendations 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create function to automatically create RIF settings when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user_rif_settings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.rif_settings (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

-- Trigger to create RIF settings for new users
CREATE TRIGGER on_auth_user_created_rif_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_rif_settings();

-- Create function to update RIF profile timestamps
CREATE OR REPLACE FUNCTION public.update_rif_profile_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger to update timestamps on RIF profile updates
CREATE TRIGGER update_rif_profile_timestamp
  BEFORE UPDATE ON public.rif_profiles
  FOR EACH ROW EXECUTE PROCEDURE public.update_rif_profile_timestamp();
