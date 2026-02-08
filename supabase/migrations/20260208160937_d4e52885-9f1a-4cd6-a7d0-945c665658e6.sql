
-- ============================================
-- SECURITY HARDENING: Tighten overly permissive RLS policies
-- ============================================

-- 1. Waitlist submissions: Replace WITH CHECK (true) with field validation
DROP POLICY IF EXISTS "Allow anonymous waitlist submissions" ON public.waitlist_submissions;
CREATE POLICY "Allow validated anonymous waitlist submissions"
ON public.waitlist_submissions
FOR INSERT
TO public
WITH CHECK (
  first_name IS NOT NULL AND 
  length(trim(first_name)) >= 1 AND
  length(trim(first_name)) <= 100 AND
  email IS NOT NULL AND
  length(trim(email)) >= 5 AND
  length(trim(email)) <= 255 AND
  email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
);

-- 2. Partner email submissions: Replace WITH CHECK (true) with validation
DROP POLICY IF EXISTS "Allow anonymous email submissions" ON public.partner_email_submissions;
CREATE POLICY "Allow validated anonymous email submissions"
ON public.partner_email_submissions
FOR INSERT
TO public
WITH CHECK (
  email IS NOT NULL AND
  length(trim(email)) >= 5 AND
  length(trim(email)) <= 255 AND
  email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
);

-- 3. Rate limits: Restrict to service role and authenticated users (not public anon)
-- This table should only be written to by the check_rate_limit function (SECURITY DEFINER)
DROP POLICY IF EXISTS "System can manage rate limits" ON public.rate_limits;
CREATE POLICY "Service role manages rate limits"
ON public.rate_limits
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 4. Security audit log: Restrict INSERT to authenticated users (logged via SECURITY DEFINER functions)
DROP POLICY IF EXISTS "System can insert security logs" ON public.security_audit_log;
CREATE POLICY "Authenticated users can insert own security logs"
ON public.security_audit_log
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 5. Behavioral patterns: Restrict to owner
DROP POLICY IF EXISTS "System can create behavioral patterns" ON public.behavioral_patterns;
CREATE POLICY "Users can insert own behavioral patterns"
ON public.behavioral_patterns
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 6. Notifications: Restrict INSERT to authenticated (system inserts via service role)
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "Authenticated users receive notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 7. RIF insights: Restrict to owner
DROP POLICY IF EXISTS "System can create RIF insights" ON public.rif_insights;
CREATE POLICY "Users can insert own RIF insights"
ON public.rif_insights
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 8. RIF recommendations: Restrict to owner
DROP POLICY IF EXISTS "System can create RIF recommendations" ON public.rif_recommendations;
CREATE POLICY "Users can insert own RIF recommendations"
ON public.rif_recommendations
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 9. KPI snapshots: Only admin can insert
DROP POLICY IF EXISTS "System can insert KPI snapshots" ON public.kpi_snapshots;
CREATE POLICY "Admin can insert KPI snapshots"
ON public.kpi_snapshots
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));

-- 10. Weekly options: Restrict to owner or admin
DROP POLICY IF EXISTS "System can create weekly options" ON public.weekly_options;
CREATE POLICY "Users or admins can create weekly options"
ON public.weekly_options
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));

-- 11. Conversation monitor: Restrict to participants
DROP POLICY IF EXISTS "System can manage conversation monitors" ON public.conversation_monitor;
CREATE POLICY "Participants can manage conversation monitors"
ON public.conversation_monitor
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_tracker ct 
    WHERE ct.conversation_id = conversation_monitor.conversation_id 
    AND (ct.user_id = auth.uid() OR ct.match_user_id = auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversation_tracker ct 
    WHERE ct.conversation_id = conversation_monitor.conversation_id 
    AND (ct.user_id = auth.uid() OR ct.match_user_id = auth.uid())
  )
);

-- 12. Curated matches service role insert: Restrict to admin
DROP POLICY IF EXISTS "Service role can insert curated matches" ON public.curated_matches;
CREATE POLICY "Admin can insert curated matches"
ON public.curated_matches
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));
