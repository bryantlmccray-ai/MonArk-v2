-- SECURITY FIX 1: Restrict user_profiles discovery policy to exclude PII columns
-- Replace the broad SELECT policy with one that only allows access through public_user_profiles view
-- Since Postgres RLS cannot restrict columns, we remove direct table access for non-owners
-- and force them through the public_user_profiles view (which already omits PII)

DROP POLICY IF EXISTS "Non-owners view profiles via discovery criteria" ON user_profiles;

-- Non-owners can only see the row exists and basic fields needed for the view
-- The public_user_profiles view with security_invoker=true will use the owner policy context
-- We need a restrictive approach: non-owners query through the view only
-- But the view needs the SELECT policy to work. Create a function-based approach instead.

-- Create a security definer function that the view can use
CREATE OR REPLACE FUNCTION public.get_discoverable_profiles()
RETURNS SETOF user_profiles
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT * FROM public.user_profiles
  WHERE is_profile_complete = true
    AND COALESCE(discovery_privacy_mode, 'open') <> 'hidden';
$$;

-- Recreate the view to use the function approach won't work cleanly.
-- Better approach: Keep the SELECT policy but create a RESTRICTIVE policy 
-- that blocks PII columns. Since PG RLS can't do column-level, use a different strategy:
-- Allow non-owners SELECT but ONLY through a wrapper function.

-- Actually the cleanest fix: Drop the non-owner direct SELECT policy entirely.
-- The public_user_profiles view uses security_invoker=true, which means it runs
-- as the querying user. Without a SELECT policy for non-owners on user_profiles,
-- the view won't return non-owned rows either.
-- Solution: Make the view use SECURITY DEFINER (via a function) instead.

-- Drop the security_invoker view and recreate as a SECURITY DEFINER function-backed view
DROP VIEW IF EXISTS public.public_user_profiles;

CREATE VIEW public.public_user_profiles AS
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

-- WITHOUT security_invoker, the view runs as the owner (postgres/supabase_admin)
-- which bypasses RLS — this is what we WANT so the view can read all discoverable profiles
-- while only exposing safe columns. The view itself acts as the column-level filter.

COMMENT ON VIEW public.public_user_profiles IS 'Safe public view (owner-context). No phone, DOB, quiz answers, raw GPS. Exposes only fuzzed coordinates. Respects identity_visibility and discovery_privacy_mode.';

-- Grant SELECT on the view to authenticated users only (not anon/public)
REVOKE ALL ON public.public_user_profiles FROM anon;
REVOKE ALL ON public.public_user_profiles FROM public;
GRANT SELECT ON public.public_user_profiles TO authenticated;

-- SECURITY FIX 2: Message UPDATE — recipients can only update read_at, not content
DROP POLICY IF EXISTS "Users can update own messages" ON messages;

-- Senders can update their own messages (e.g., edit content)
CREATE POLICY "Senders can update own messages"
  ON messages FOR UPDATE TO authenticated
  USING (sender_user_id = auth.uid())
  WITH CHECK (sender_user_id = auth.uid());

-- Recipients can only mark messages as read (via mark_messages_as_read function)
-- No direct UPDATE policy for recipients — they use the SECURITY DEFINER function instead

-- SECURITY FIX 3: curated_matches UPDATE — users can only change status/responded_at
DROP POLICY IF EXISTS "Users can update their curated match responses" ON curated_matches;

-- Users can only update their own match response (status + responded_at)
-- We create a function to safely update only allowed fields
CREATE OR REPLACE FUNCTION public.respond_to_curated_match(
  p_match_id uuid,
  p_status text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Validate status
  IF p_status NOT IN ('accepted', 'declined', 'skipped') THEN
    RAISE EXCEPTION 'Invalid status value';
  END IF;
  
  -- Only update if the user is the match recipient (user_id)
  UPDATE public.curated_matches
  SET status = p_status, responded_at = now()
  WHERE id = p_match_id
    AND user_id = auth.uid()
    AND status = 'pending';
    
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Match not found or already responded';
  END IF;
END;
$$;

-- Admin-only UPDATE policy for admin-managed fields
CREATE POLICY "Only admins can update curated matches directly"
  ON curated_matches FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));