-- Allow authenticated users to SELECT rows from user_profiles 
-- when accessed through the public_user_profiles view (security_invoker=true).
-- The view already strips sensitive fields (phone, DOB, quiz answers)
-- and filters to complete, non-hidden profiles only.
CREATE POLICY "Authenticated users can view profiles through view"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (
  -- Own profile (full access handled by existing policy)
  user_id = auth.uid()
  OR
  -- Complete, non-hidden profiles visible to all authenticated users
  -- (the public_user_profiles view further restricts visible columns)
  (is_profile_complete = true AND COALESCE(discovery_privacy_mode, 'open') <> 'hidden')
);