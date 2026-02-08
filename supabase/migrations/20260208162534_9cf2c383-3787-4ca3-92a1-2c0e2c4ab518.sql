
-- Create a secure view that only exposes safe profile fields for cross-user access
-- This prevents phone_number, date_of_birth, location_data, phone_number, email from being exposed
CREATE OR REPLACE VIEW public.public_user_profiles AS
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

-- Drop the overly broad "basic profile info for matching" SELECT policy
-- This policy allowed ANY authenticated user to see ALL columns of complete profiles
DROP POLICY IF EXISTS "Users can view basic profile info for matching" ON public.user_profiles;

-- The remaining "Users can view accessible profiles" policy already restricts access
-- to own profile, admin, or users with a dating_pool/curated_matches/mutual_match relationship
-- which is the correct behavior.

-- Also drop duplicate policies to clean up
DROP POLICY IF EXISTS "Users can create their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own location data" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
