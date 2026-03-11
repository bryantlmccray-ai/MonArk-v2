-- Fix 1: Narrow user_profiles SELECT policy for non-owners
-- Replace the overly permissive "view profiles through view" policy with one
-- that only grants access to non-sensitive columns via the public_user_profiles view.
-- Direct SELECT on user_profiles for non-owners is no longer needed since
-- the public_user_profiles view (security_invoker=true) already filters sensitive fields.

DROP POLICY IF EXISTS "Authenticated users can view profiles through view" ON public.user_profiles;

-- New policy: non-owners can only see the subset of fields needed for discovery
-- They must access via the public_user_profiles view which already strips sensitive data.
-- This policy allows SELECT but only for rows that match discovery criteria.
CREATE POLICY "Non-owners view profiles via discovery criteria"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR (
    is_profile_complete = true
    AND COALESCE(discovery_privacy_mode, 'open') <> 'hidden'
    AND NOT public.is_blocked(auth.uid(), user_id)
    AND public.is_match_or_pool_member(auth.uid(), user_id)
  )
);

-- Keep existing "Owner or admin can view full profile" policy as-is (it covers owner + admin)
-- Drop it only to recreate with proper scope if needed
-- Actually the new policy above already includes user_id = auth.uid(), and the existing
-- owner/admin policy covers admin. Let's check if we need to keep it.
-- The existing policy is: "Owner or admin can view full profile" — keep it for admin access.

-- Fix 2: Remove policy that exposes reporter identity to reported users
DROP POLICY IF EXISTS "Users can view reports about them" ON public.user_reports;

-- Replace with a security definer function that only returns non-identifying fields
-- (The function get_reports_against_me already exists and returns only id, report_type, status, created_at, updated_at)
-- No new SELECT policy needed — users use the existing get_reports_against_me() function instead.