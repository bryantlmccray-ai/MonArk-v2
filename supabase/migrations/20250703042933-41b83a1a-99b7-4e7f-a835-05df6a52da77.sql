-- Add lifestyle compatibility fields to user_profiles table

-- Add occupation/career field
ALTER TABLE public.user_profiles 
ADD COLUMN occupation TEXT;

-- Add education level field with predefined options
ALTER TABLE public.user_profiles 
ADD COLUMN education_level TEXT;

-- Add relationship goals field
ALTER TABLE public.user_profiles 
ADD COLUMN relationship_goals TEXT[];

-- Add exercise habits field  
ALTER TABLE public.user_profiles 
ADD COLUMN exercise_habits TEXT;

-- Add smoking status field
ALTER TABLE public.user_profiles 
ADD COLUMN smoking_status TEXT;

-- Add drinking status field
ALTER TABLE public.user_profiles 
ADD COLUMN drinking_status TEXT;

-- Add height field (in centimeters for consistency)
ALTER TABLE public.user_profiles 
ADD COLUMN height_cm INTEGER;

-- Create index for better query performance on lifestyle fields
CREATE INDEX idx_user_profiles_lifestyle ON public.user_profiles (education_level, exercise_habits, smoking_status, drinking_status);

-- Update the profile completion trigger to include new fields in completion check
CREATE OR REPLACE FUNCTION public.check_profile_completion()
RETURNS TRIGGER AS $$
BEGIN
  NEW.is_profile_complete = (
    NEW.bio IS NOT NULL AND 
    NEW.age IS NOT NULL AND
    NEW.photos IS NOT NULL AND 
    array_length(NEW.photos, 1) > 0 AND
    NEW.interests IS NOT NULL AND 
    array_length(NEW.interests, 1) > 0 AND
    NEW.gender_identity IS NOT NULL AND
    NEW.sexual_orientation IS NOT NULL AND
    NEW.occupation IS NOT NULL AND
    NEW.education_level IS NOT NULL AND
    NEW.relationship_goals IS NOT NULL AND
    array_length(NEW.relationship_goals, 1) > 0 AND
    NEW.exercise_habits IS NOT NULL AND
    NEW.smoking_status IS NOT NULL AND
    NEW.drinking_status IS NOT NULL
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the trigger
DROP TRIGGER IF EXISTS check_profile_completion_trigger ON public.user_profiles;
CREATE TRIGGER check_profile_completion_trigger
  BEFORE INSERT OR UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION check_profile_completion();