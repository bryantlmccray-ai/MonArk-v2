-- Create user ML preferences table for personalized compatibility weights
CREATE TABLE public.user_ml_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  interest_weight NUMERIC DEFAULT 0.3,
  rif_weight NUMERIC DEFAULT 0.4,
  behavioral_weight NUMERIC DEFAULT 0.3,
  interaction_style TEXT DEFAULT 'balanced',
  activity_preference TEXT DEFAULT 'moderate',
  confidence_level NUMERIC DEFAULT 0.5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_ml_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own ML preferences" 
ON public.user_ml_preferences 
FOR ALL 
USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_user_ml_preferences_user_id ON public.user_ml_preferences(user_id);