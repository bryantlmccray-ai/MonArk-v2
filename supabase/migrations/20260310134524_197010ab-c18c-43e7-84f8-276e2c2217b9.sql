
-- Drop and recreate the view with privacy filtering
DROP VIEW IF EXISTS public.public_user_profiles;

CREATE VIEW public.public_user_profiles
WITH (security_invoker = true)
AS
SELECT
    user_profiles.user_id,
    user_profiles.bio,
    user_profiles.age,
    user_profiles.location,
    user_profiles.interests,
    user_profiles.photos,
    user_profiles.occupation,
    user_profiles.education_level,
    CASE WHEN user_profiles.identity_visibility = true THEN user_profiles.gender_identity ELSE NULL END AS gender_identity,
    CASE WHEN user_profiles.identity_visibility = true THEN user_profiles.gender_identity_custom ELSE NULL END AS gender_identity_custom,
    CASE WHEN user_profiles.identity_visibility = true THEN user_profiles.sexual_orientation ELSE NULL END AS sexual_orientation,
    CASE WHEN user_profiles.identity_visibility = true THEN user_profiles.sexual_orientation_custom ELSE NULL END AS sexual_orientation_custom,
    user_profiles.relationship_goals,
    user_profiles.exercise_habits,
    user_profiles.smoking_status,
    user_profiles.drinking_status,
    user_profiles.height_cm,
    user_profiles.is_profile_complete,
    user_profiles.age_verified,
    user_profiles.date_preferences,
    user_profiles.created_at,
    user_profiles.updated_at
FROM user_profiles
WHERE
    COALESCE(user_profiles.discovery_privacy_mode, 'open') != 'hidden'
    AND user_profiles.is_profile_complete = true;

COMMENT ON VIEW public.public_user_profiles IS 'Safe public view respecting identity_visibility and discovery_privacy_mode. Excludes phone, DOB, quiz answers, and internal preference fields.';
