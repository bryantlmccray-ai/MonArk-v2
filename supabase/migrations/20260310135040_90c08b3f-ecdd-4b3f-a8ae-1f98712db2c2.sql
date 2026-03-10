
-- Fix: Switch view back to security_invoker=true (safe)
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
    up.updated_at
FROM user_profiles up
WHERE
    COALESCE(up.discovery_privacy_mode, 'open') != 'hidden'
    AND up.is_profile_complete = true;

GRANT SELECT ON public.public_user_profiles TO authenticated;
GRANT SELECT ON public.public_user_profiles TO anon;

-- Add back a SELECT policy for matched/pool users on user_profiles
-- so the security_invoker view works for them.
-- This grants row-level access but the VIEW controls which columns are returned.
CREATE POLICY "Matched users can view profiles via view"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (
  is_profile_complete = true
  AND is_match_or_pool_member(auth.uid(), user_id)
);

COMMENT ON VIEW public.public_user_profiles IS 'Safe public view. No phone, DOB, quiz answers. Respects identity_visibility and discovery_privacy_mode.';
