
-- Create enums for gender identity and sexual orientation
CREATE TYPE public.gender_identity AS ENUM (
  'Man',
  'Woman', 
  'Nonbinary',
  'Genderfluid',
  'Agender',
  'Demigender',
  'Two-Spirit',
  'Questioning',
  'Custom'
);

CREATE TYPE public.sexual_orientation AS ENUM (
  'Straight',
  'Gay',
  'Lesbian',
  'Bisexual',
  'Pansexual',
  'Queer',
  'Asexual',
  'Demisexual',
  'Questioning',
  'Custom'
);

-- Add identity and preference columns to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN gender_identity gender_identity,
ADD COLUMN gender_identity_custom text,
ADD COLUMN sexual_orientation sexual_orientation,
ADD COLUMN sexual_orientation_custom text,
ADD COLUMN preference_to_see text[] DEFAULT '{}',
ADD COLUMN preference_to_be_seen_by text[] DEFAULT '{}',
ADD COLUMN discovery_privacy_mode text DEFAULT 'open',
ADD COLUMN identity_visibility boolean DEFAULT true,
ADD COLUMN last_preference_update timestamp with time zone DEFAULT now();

-- Create index for faster discovery filtering
CREATE INDEX idx_user_profiles_preferences ON public.user_profiles USING GIN (preference_to_see);
CREATE INDEX idx_user_profiles_gender ON public.user_profiles (gender_identity);

-- Add trigger to update preference timestamp
CREATE OR REPLACE FUNCTION public.update_preference_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.preference_to_see IS DISTINCT FROM NEW.preference_to_see OR
     OLD.preference_to_be_seen_by IS DISTINCT FROM NEW.preference_to_be_seen_by OR
     OLD.gender_identity IS DISTINCT FROM NEW.gender_identity OR
     OLD.sexual_orientation IS DISTINCT FROM NEW.sexual_orientation THEN
    NEW.last_preference_update = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_preference_timestamp
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_preference_timestamp();
