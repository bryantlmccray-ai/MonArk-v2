
-- 1. Create coordinate fuzzing function (~0.5 mile / ~0.8 km grid)
-- Rounds to nearest 0.008 degrees (~890m at equator)
CREATE OR REPLACE FUNCTION public.fuzz_coordinates(precise_lat numeric, precise_lng numeric)
RETURNS TABLE(fuzzed_lat numeric, fuzzed_lng numeric)
LANGUAGE sql
IMMUTABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT 
    ROUND(precise_lat / 0.008) * 0.008 AS fuzzed_lat,
    ROUND(precise_lng / 0.008) * 0.008 AS fuzzed_lng;
$$;

COMMENT ON FUNCTION public.fuzz_coordinates IS 'Rounds GPS coordinates to ~0.5 mile grid to protect user home addresses. Use for any public-facing location display.';

-- 2. Recreate public_user_profiles view with fuzzed coordinates
DROP VIEW IF EXISTS public.public_user_profiles;

CREATE VIEW public.public_user_profiles
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
    -- Fuzzed location: only expose approximate coordinates (~0.5 mile grid)
    CASE 
      WHEN up.show_location_on_profile = true AND up.location_data IS NOT NULL 
      THEN (SELECT f.fuzzed_lat FROM public.fuzz_coordinates(
        (up.location_data->>'lat')::numeric, 
        (up.location_data->>'lng')::numeric
      ) f)
      ELSE NULL 
    END AS fuzzed_lat,
    CASE 
      WHEN up.show_location_on_profile = true AND up.location_data IS NOT NULL 
      THEN (SELECT f.fuzzed_lng FROM public.fuzz_coordinates(
        (up.location_data->>'lat')::numeric, 
        (up.location_data->>'lng')::numeric
      ) f)
      ELSE NULL 
    END AS fuzzed_lng
FROM user_profiles up
WHERE
    COALESCE(up.discovery_privacy_mode, 'open') != 'hidden'
    AND up.is_profile_complete = true;

GRANT SELECT ON public.public_user_profiles TO authenticated;
GRANT SELECT ON public.public_user_profiles TO anon;

COMMENT ON VIEW public.public_user_profiles IS 'Safe public view. No phone, DOB, quiz answers, raw GPS. Exposes only fuzzed coordinates (~0.5mi grid). Respects identity_visibility and discovery_privacy_mode.';
