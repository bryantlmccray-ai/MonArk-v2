-- Add onboarding progress tracking and RIF quiz answers to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS onboarding_step integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS rif_quiz_answers jsonb DEFAULT NULL;