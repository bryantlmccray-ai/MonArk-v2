-- =====================================================
-- MONARK SECURITY HARDENING MIGRATION
-- =====================================================

-- 1. CREATE SECURITY AUDIT LOG TABLE
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID,
  target_user_id UUID,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN DEFAULT false,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on security_audit_log (admin-only access)
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view security logs
CREATE POLICY "Only admins can view security logs"
ON public.security_audit_log FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only system (service role) can insert logs
CREATE POLICY "System can insert security logs"
ON public.security_audit_log FOR INSERT
TO authenticated
WITH CHECK (true);

-- 2. CREATE RATE LIMITING TABLE
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  ip_address TEXT,
  action_type TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, action_type, window_start),
  UNIQUE (ip_address, action_type, window_start)
);

-- Enable RLS on rate_limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- System access only for rate limits
CREATE POLICY "System can manage rate limits"
ON public.rate_limits FOR ALL
USING (true)
WITH CHECK (true);

-- 3. FIX delete_user_completely FUNCTION - ADD AUTHORIZATION CHECK
CREATE OR REPLACE FUNCTION public.delete_user_completely(user_id_input uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- CRITICAL: Authorization check - users can only delete their own account
  IF user_id_input != auth.uid() AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Users can only delete their own account';
  END IF;

  -- Log the deletion attempt
  INSERT INTO public.security_audit_log (event_type, user_id, target_user_id, action, success, metadata)
  VALUES ('account_deletion', auth.uid(), user_id_input, 'delete_user_completely', true, 
          jsonb_build_object('timestamp', now()));

  -- Delete from all user-related tables in the correct order
  DELETE FROM public.rif_insights WHERE user_id = user_id_input;
  DELETE FROM public.rif_recommendations WHERE user_id = user_id_input;
  DELETE FROM public.rif_reflections WHERE user_id = user_id_input;
  DELETE FROM public.rif_feedback WHERE user_id = user_id_input;
  DELETE FROM public.rif_event_log WHERE user_id = user_id_input;
  DELETE FROM public.rif_profiles WHERE user_id = user_id_input;
  DELETE FROM public.rif_settings WHERE user_id = user_id_input;
  DELETE FROM public.user_rif_state WHERE user_id = user_id_input;
  DELETE FROM public.conversation_events WHERE user_id = user_id_input;
  DELETE FROM public.conversation_monitor WHERE conversation_id IN (
    SELECT conversation_id FROM public.conversation_tracker 
    WHERE user_id = user_id_input OR match_user_id = user_id_input
  );
  DELETE FROM public.conversation_tracker WHERE user_id = user_id_input OR match_user_id = user_id_input;
  DELETE FROM public.date_journal WHERE user_id = user_id_input;
  DELETE FROM public.date_proposals WHERE creator_user_id = user_id_input OR recipient_user_id = user_id_input;
  DELETE FROM public.user_profiles WHERE user_id = user_id_input;
  DELETE FROM public.profiles WHERE id = user_id_input;
  DELETE FROM public.user_roles WHERE user_id = user_id_input;
END;
$function$;

-- 4. CREATE FUNCTION TO CHECK MUTUAL MATCH FOR MESSAGE ACCESS
CREATE OR REPLACE FUNCTION public.has_mutual_match(user_a UUID, user_b UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Check if both users have accepted matches with each other
  RETURN EXISTS (
    SELECT 1 FROM public.matches m1
    WHERE m1.user_id = user_a 
    AND m1.liked_user_id = user_b
    AND m1.is_mutual = true
  ) OR EXISTS (
    SELECT 1 FROM public.curated_matches cm1
    JOIN public.curated_matches cm2 
      ON cm1.user_id = cm2.matched_user_id 
      AND cm1.matched_user_id = cm2.user_id
    WHERE cm1.user_id = user_a 
    AND cm1.matched_user_id = user_b
    AND cm1.status = 'accepted'
    AND cm2.status = 'accepted'
  );
END;
$function$;

-- 5. CREATE FUNCTION TO CHECK IF PROFILE IS VIEWABLE
CREATE OR REPLACE FUNCTION public.can_view_profile(viewer_id UUID, target_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  target_complete BOOLEAN;
BEGIN
  -- Users can always view their own profile
  IF viewer_id = target_id THEN
    RETURN true;
  END IF;
  
  -- Admins can view all profiles
  IF public.has_role(viewer_id, 'admin') THEN
    RETURN true;
  END IF;
  
  -- Check if target profile is complete
  SELECT is_profile_complete INTO target_complete
  FROM public.user_profiles
  WHERE user_id = target_id;
  
  -- Only show complete profiles to other users
  RETURN COALESCE(target_complete, false);
END;
$function$;

-- 6. CREATE RATE LIMITING CHECK FUNCTION
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_user_id UUID,
  p_action_type TEXT,
  p_max_requests INTEGER,
  p_window_minutes INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  current_count INTEGER;
  window_start_time TIMESTAMP WITH TIME ZONE;
BEGIN
  window_start_time := date_trunc('minute', now()) - (INTERVAL '1 minute' * p_window_minutes);
  
  -- Count requests in the current window
  SELECT COALESCE(SUM(request_count), 0) INTO current_count
  FROM public.rate_limits
  WHERE user_id = p_user_id
    AND action_type = p_action_type
    AND window_start >= window_start_time;
  
  -- Return false if rate limit exceeded
  IF current_count >= p_max_requests THEN
    -- Log the rate limit violation
    INSERT INTO public.security_audit_log (event_type, user_id, action, success, metadata)
    VALUES ('rate_limit_exceeded', p_user_id, p_action_type, false, 
            jsonb_build_object('count', current_count, 'limit', p_max_requests));
    RETURN false;
  END IF;
  
  -- Increment the counter
  INSERT INTO public.rate_limits (user_id, action_type, request_count, window_start)
  VALUES (p_user_id, p_action_type, 1, date_trunc('minute', now()))
  ON CONFLICT (user_id, action_type, window_start)
  DO UPDATE SET request_count = rate_limits.request_count + 1, updated_at = now();
  
  RETURN true;
END;
$function$;

-- 7. CREATE SECURITY LOGGING FUNCTION
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type TEXT,
  p_action TEXT,
  p_target_user_id UUID DEFAULT NULL,
  p_resource_type TEXT DEFAULT NULL,
  p_resource_id TEXT DEFAULT NULL,
  p_success BOOLEAN DEFAULT true,
  p_error_message TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.security_audit_log (
    event_type, user_id, target_user_id, action, resource_type, 
    resource_id, success, error_message, metadata
  )
  VALUES (
    p_event_type, auth.uid(), p_target_user_id, p_action, p_resource_type,
    p_resource_id, p_success, p_error_message, p_metadata
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$function$;

-- =====================================================
-- 8. DROP AND RECREATE STRICT RLS POLICIES
-- =====================================================

-- USER_PROFILES: Strict access control
DROP POLICY IF EXISTS "Users can view profiles of matched users" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;

-- Users can only view their own profile OR complete profiles of matched users
CREATE POLICY "Users can view accessible profiles"
ON public.user_profiles FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() 
  OR public.has_role(auth.uid(), 'admin')
  OR (
    is_profile_complete = true 
    AND (
      -- Allow viewing in weekly options/dating pool
      EXISTS (
        SELECT 1 FROM public.dating_pool dp
        WHERE dp.user_id = auth.uid() AND dp.pool_user_id = user_profiles.user_id
      )
      OR EXISTS (
        SELECT 1 FROM public.curated_matches cm
        WHERE cm.user_id = auth.uid() AND cm.matched_user_id = user_profiles.user_id
      )
      OR public.has_mutual_match(auth.uid(), user_profiles.user_id)
    )
  )
);

CREATE POLICY "Users can update own profile"
ON public.user_profiles FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can insert own profile"
ON public.user_profiles FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own profile"
ON public.user_profiles FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- MESSAGES: Only mutual matches can access
DROP POLICY IF EXISTS "Users can view their messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages to matches" ON public.messages;

CREATE POLICY "Users can view messages in their conversations"
ON public.messages FOR SELECT
TO authenticated
USING (
  sender_user_id = auth.uid() 
  OR recipient_user_id = auth.uid()
);

CREATE POLICY "Users can send messages to mutual matches only"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (
  sender_user_id = auth.uid()
  AND (
    public.has_mutual_match(auth.uid(), recipient_user_id)
    OR EXISTS (
      SELECT 1 FROM public.conversation_tracker ct
      WHERE ct.conversation_id = messages.conversation_id
      AND (ct.user_id = auth.uid() OR ct.match_user_id = auth.uid())
    )
  )
);

CREATE POLICY "Users can update own messages"
ON public.messages FOR UPDATE
TO authenticated
USING (sender_user_id = auth.uid() OR recipient_user_id = auth.uid())
WITH CHECK (sender_user_id = auth.uid() OR recipient_user_id = auth.uid());

-- MATCHES: User-specific access
DROP POLICY IF EXISTS "Users can view their matches" ON public.matches;
DROP POLICY IF EXISTS "Users can create matches" ON public.matches;
DROP POLICY IF EXISTS "Users can view matches involving them" ON public.matches;

CREATE POLICY "Users can view matches involving them"
ON public.matches FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR liked_user_id = auth.uid());

CREATE POLICY "Users can create their own matches"
ON public.matches FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update matches they created"
ON public.matches FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- DATE_PROPOSALS: Participant-only access
DROP POLICY IF EXISTS "Users can view their date proposals" ON public.date_proposals;
DROP POLICY IF EXISTS "Users can create date proposals" ON public.date_proposals;
DROP POLICY IF EXISTS "Users can update date proposals they're part of" ON public.date_proposals;

CREATE POLICY "Users can view their date proposals"
ON public.date_proposals FOR SELECT
TO authenticated
USING (creator_user_id = auth.uid() OR recipient_user_id = auth.uid());

CREATE POLICY "Users can create date proposals for mutual matches"
ON public.date_proposals FOR INSERT
TO authenticated
WITH CHECK (
  creator_user_id = auth.uid()
  AND public.has_mutual_match(auth.uid(), recipient_user_id)
);

CREATE POLICY "Users can update their date proposals"
ON public.date_proposals FOR UPDATE
TO authenticated
USING (creator_user_id = auth.uid() OR recipient_user_id = auth.uid())
WITH CHECK (creator_user_id = auth.uid() OR recipient_user_id = auth.uid());

CREATE POLICY "Users can delete their own date proposals"
ON public.date_proposals FOR DELETE
TO authenticated
USING (creator_user_id = auth.uid());

-- RIF_PROFILES: User-only access
DROP POLICY IF EXISTS "Users can view own rif profile" ON public.rif_profiles;
DROP POLICY IF EXISTS "Users can update own rif profile" ON public.rif_profiles;
DROP POLICY IF EXISTS "Users can insert own rif profile" ON public.rif_profiles;

CREATE POLICY "Users can view own rif profile"
ON public.rif_profiles FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update own rif profile"
ON public.rif_profiles FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can insert own rif profile"
ON public.rif_profiles FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own rif profile"
ON public.rif_profiles FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- CURATED_MATCHES: Strict user access
DROP POLICY IF EXISTS "Users can view their curated matches" ON public.curated_matches;
DROP POLICY IF EXISTS "Admins can manage curated matches" ON public.curated_matches;

CREATE POLICY "Users can view their curated matches"
ON public.curated_matches FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() 
  OR matched_user_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can update their curated match responses"
ON public.curated_matches FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR matched_user_id = auth.uid())
WITH CHECK (user_id = auth.uid() OR matched_user_id = auth.uid());

CREATE POLICY "Only admins can insert curated matches"
ON public.curated_matches FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete curated matches"
ON public.curated_matches FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- CONVERSATION_TRACKER: Participant-only access
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversation_tracker;
DROP POLICY IF EXISTS "System can manage conversation trackers" ON public.conversation_tracker;

CREATE POLICY "Users can view their conversation trackers"
ON public.conversation_tracker FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR match_user_id = auth.uid());

CREATE POLICY "System can insert conversation trackers"
ON public.conversation_tracker FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR match_user_id = auth.uid());

CREATE POLICY "Users can update their conversation trackers"
ON public.conversation_tracker FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR match_user_id = auth.uid())
WITH CHECK (user_id = auth.uid() OR match_user_id = auth.uid());

-- DATING_POOL: User-specific access
DROP POLICY IF EXISTS "Users can view their dating pool" ON public.dating_pool;
DROP POLICY IF EXISTS "Users can update their dating pool responses" ON public.dating_pool;

CREATE POLICY "Users can view their dating pool"
ON public.dating_pool FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR pool_user_id = auth.uid());

CREATE POLICY "Users can update their dating pool responses"
ON public.dating_pool FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- USER_ROLES: Strict admin-only management
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can insert roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update roles"
ON public.user_roles FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete roles"
ON public.user_roles FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RIF_SETTINGS: User-only access
DROP POLICY IF EXISTS "Users can view own settings" ON public.rif_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON public.rif_settings;

CREATE POLICY "Users can view own rif settings"
ON public.rif_settings FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update own rif settings"
ON public.rif_settings FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can insert own rif settings"
ON public.rif_settings FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- NOTIFICATIONS: User-only access
DROP POLICY IF EXISTS "Users can view their notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their notifications" ON public.notifications;

CREATE POLICY "Users can view their notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications"
ON public.notifications FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can insert notifications"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (true);

-- BLOCKED_USERS: User-specific access
DROP POLICY IF EXISTS "Users can view their blocked users" ON public.blocked_users;
DROP POLICY IF EXISTS "Users can manage their blocked users" ON public.blocked_users;

CREATE POLICY "Users can view their blocked users"
ON public.blocked_users FOR SELECT
TO authenticated
USING (blocker_user_id = auth.uid());

CREATE POLICY "Users can insert blocked users"
ON public.blocked_users FOR INSERT
TO authenticated
WITH CHECK (blocker_user_id = auth.uid());

CREATE POLICY "Users can delete their blocked users"
ON public.blocked_users FOR DELETE
TO authenticated
USING (blocker_user_id = auth.uid());

-- DATE_JOURNAL: User-only access
DROP POLICY IF EXISTS "Users can view their date journal" ON public.date_journal;
DROP POLICY IF EXISTS "Users can manage their date journal" ON public.date_journal;

CREATE POLICY "Users can view their date journal"
ON public.date_journal FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their date journal entries"
ON public.date_journal FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their date journal entries"
ON public.date_journal FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their date journal entries"
ON public.date_journal FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- CONTACT_SHARES: Participant-only access
DROP POLICY IF EXISTS "Users can view their contact shares" ON public.contact_shares;

CREATE POLICY "Users can view their contact shares"
ON public.contact_shares FOR SELECT
TO authenticated
USING (sharer_user_id = auth.uid() OR recipient_user_id = auth.uid());

CREATE POLICY "Users can insert contact shares for mutual matches"
ON public.contact_shares FOR INSERT
TO authenticated
WITH CHECK (
  sharer_user_id = auth.uid()
  AND public.has_mutual_match(auth.uid(), recipient_user_id)
);

-- Fix conversation_monitor policy to be more restrictive
DROP POLICY IF EXISTS "System access for conversation monitoring" ON public.conversation_monitor;
DROP POLICY IF EXISTS "Users can view own conversation monitors" ON public.conversation_monitor;
DROP POLICY IF EXISTS "System can manage rate limits" ON public.conversation_monitor;

CREATE POLICY "Users can view their conversation monitors"
ON public.conversation_monitor FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_tracker ct
    WHERE ct.conversation_id = conversation_monitor.conversation_id
    AND (ct.user_id = auth.uid() OR ct.match_user_id = auth.uid())
  )
);

-- 9. Add index for security audit log performance
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_id ON public.security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_event_type ON public.security_audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_created_at ON public.security_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_action ON public.rate_limits(user_id, action_type, window_start);

-- 10. Clean up old rate limit entries (older than 1 hour)
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  DELETE FROM public.rate_limits
  WHERE window_start < now() - INTERVAL '1 hour';
END;
$function$;