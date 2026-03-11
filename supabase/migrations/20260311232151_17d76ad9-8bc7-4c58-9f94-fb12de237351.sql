-- Fix rate_limits RLS: Remove permissive ALL policy, replace with SELECT-only for authenticated users
-- INSERT/UPDATE/DELETE restricted to service_role only (default with no policy)

DROP POLICY IF EXISTS "Service role manages rate limits" ON public.rate_limits;

-- Allow authenticated users to only SELECT their own rate limit records
CREATE POLICY "Users can view own rate limits"
ON public.rate_limits
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- No INSERT/UPDATE/DELETE policies for authenticated role
-- Service role bypasses RLS by default, so it can still manage records