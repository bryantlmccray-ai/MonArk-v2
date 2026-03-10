
-- Step 1: Create a security definer function that checks if a user
-- is a match/pool member (without exposing raw table access)
CREATE OR REPLACE FUNCTION public.is_match_or_pool_member(viewer_id uuid, target_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM dating_pool dp
    WHERE dp.user_id = viewer_id AND dp.pool_user_id = target_id
  ) OR EXISTS (
    SELECT 1 FROM curated_matches cm
    WHERE cm.user_id = viewer_id AND cm.matched_user_id = target_id
  ) OR has_mutual_match(viewer_id, target_id)
$$;

-- Step 2: Drop the overly broad SELECT policy
DROP POLICY IF EXISTS "Users can view accessible profiles" ON public.user_profiles;

-- Step 3: Keep the owner-only full-access SELECT policy (already exists but let's ensure it)
-- "Users can view their own profile" already exists with (auth.uid() = user_id)

-- Step 4: Create a new restricted policy for matched/pool users
-- This policy grants SELECT but the view should be used instead.
-- We still need this for code that queries user_profiles directly for matched users,
-- but we'll create a SECURITY DEFINER function to serve safe columns only.

-- Actually, the cleanest approach: only allow owner + admin to SELECT from user_profiles directly.
-- All other access goes through public_user_profiles view.

-- Drop the duplicate owner policy too, we'll consolidate
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;

-- Create consolidated SELECT policy: only owner or admin
CREATE POLICY "Owner or admin can view full profile"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Step 5: Update public_user_profiles view to allow matched users to see safe columns
-- (The view uses security_invoker=true, so it respects RLS on user_profiles)
-- We need to change it to SECURITY DEFINER so matched users can read through it
DROP VIEW IF EXISTS public.public_user_profiles;

CREATE VIEW public.public_user_profiles
WITH (security_invoker = false)
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

-- Grant SELECT on the view to authenticated and anon roles
GRANT SELECT ON public.public_user_profiles TO authenticated;
GRANT SELECT ON public.public_user_profiles TO anon;

COMMENT ON VIEW public.public_user_profiles IS 'Safe public view. No phone, DOB, quiz answers. Respects identity_visibility and discovery_privacy_mode.';
