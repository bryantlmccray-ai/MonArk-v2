
-- Fix the view to use SECURITY INVOKER (respects querying user's permissions)
DROP VIEW IF EXISTS public.public_user_profiles;

CREATE VIEW public.public_user_profiles
WITH (security_invoker = true)
AS
SELECT 
  user_id,
  bio,
  age,
  location,
  interests,
  photos,
  occupation,
  education_level,
  gender_identity,
  gender_identity_custom,
  sexual_orientation,
  sexual_orientation_custom,
  relationship_goals,
  exercise_habits,
  smoking_status,
  drinking_status,
  height_cm,
  is_profile_complete,
  age_verified,
  discovery_privacy_mode,
  identity_visibility,
  preference_to_see,
  preference_to_be_seen_by,
  date_preferences,
  created_at,
  updated_at
FROM public.user_profiles;

-- Grant select to authenticated users
GRANT SELECT ON public.public_user_profiles TO authenticated;
