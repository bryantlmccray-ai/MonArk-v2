-- SECURITY FIX: Recreate public_user_profiles view with security_invoker = true
-- This ensures the view respects the caller's RLS context on user_profiles,
-- preventing unauthenticated access to all user profile data.

CREATE OR REPLACE VIEW public.public_user_profiles
WITH (security_invoker = true)
AS
SELECT 
  up.user_id,
  up.bio,
  up.age,
  up.location,
  up.interests,
  up.photos,
  up.occupation,
  up.education_level,
  CASE WHEN up.identity_visibility = true THEN up.gender_identity ELSE NULL END AS gender_identity,
  CASE WHEN up.identity_visibility = true THEN up.gender_identity_custom ELSE NULL END AS gender_identity_custom,
  CASE WHEN up.identity_visibility = true THEN up.sexual_orientation ELSE NULL END AS sexual_orientation,
  CASE WHEN up.identity_visibility = true THEN up.sexual_orientation_custom ELSE NULL END AS sexual_orientation_custom,
  up.relationship_goals,
  up.exercise_habits,
  up.smoking_status,
  up.drinking_status,
  up.height_cm,
  up.is_profile_complete,
  up.age_verified,
  up.date_preferences,
  up.created_at,
  up.updated_at,
  CASE
    WHEN up.show_location_on_profile = true AND up.location_data IS NOT NULL
    THEN (SELECT f.fuzzed_lat FROM public.fuzz_coordinates((up.location_data->>'lat')::numeric, (up.location_data->>'lng')::numeric) f)
    ELSE NULL
  END AS fuzzed_lat,
  CASE
    WHEN up.show_location_on_profile = true AND up.location_data IS NOT NULL
    THEN (SELECT f.fuzzed_lng FROM public.fuzz_coordinates((up.location_data->>'lat')::numeric, (up.location_data->>'lng')::numeric) f)
    ELSE NULL
  END AS fuzzed_lng
FROM public.user_profiles up
WHERE COALESCE(up.discovery_privacy_mode, 'open') <> 'hidden'
  AND up.is_profile_complete = true;

COMMENT ON VIEW public.public_user_profiles IS 'Safe public view with security_invoker=true. Respects caller RLS on user_profiles. No phone, DOB, quiz answers, raw GPS.';