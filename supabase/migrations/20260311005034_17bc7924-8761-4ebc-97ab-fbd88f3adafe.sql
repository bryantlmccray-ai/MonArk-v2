
-- =====================================================
-- MESSAGES: Block visibility between blocked users
-- =====================================================

-- Drop and recreate the SELECT policy for messages (authenticated)
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
CREATE POLICY "Users can view messages in their conversations"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    (sender_user_id = auth.uid() OR recipient_user_id = auth.uid())
    AND NOT public.is_blocked(auth.uid(), 
      CASE WHEN sender_user_id = auth.uid() THEN recipient_user_id ELSE sender_user_id END
    )
  );

-- Drop and recreate INSERT policy for messages (authenticated) - prevent sending to blocked
DROP POLICY IF EXISTS "Users can send messages to mutual matches only" ON public.messages;
CREATE POLICY "Users can send messages to mutual matches only"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_user_id = auth.uid()
    AND NOT public.is_blocked(auth.uid(), recipient_user_id)
    AND (
      has_mutual_match(auth.uid(), recipient_user_id)
      OR EXISTS (
        SELECT 1 FROM public.conversation_tracker ct
        WHERE ct.conversation_id = messages.conversation_id
        AND (ct.user_id = auth.uid() OR ct.match_user_id = auth.uid())
      )
    )
  );

-- Drop and recreate INSERT policy for messages (public) 
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON public.messages;
CREATE POLICY "Users can send messages in their conversations"
  ON public.messages FOR INSERT
  TO public
  WITH CHECK (
    auth.uid() = sender_user_id
    AND NOT public.is_blocked(auth.uid(), recipient_user_id)
    AND EXISTS (
      SELECT 1 FROM public.conversation_tracker
      WHERE conversation_tracker.conversation_id = messages.conversation_id
      AND (conversation_tracker.user_id = auth.uid() OR conversation_tracker.match_user_id = auth.uid())
    )
  );

-- =====================================================
-- MATCHES: Block visibility between blocked users
-- =====================================================

DROP POLICY IF EXISTS "Users can view matches involving them" ON public.matches;
CREATE POLICY "Users can view matches involving them"
  ON public.matches FOR SELECT
  TO authenticated
  USING (
    (auth.uid() = user_id OR auth.uid() = liked_user_id)
    AND NOT public.is_blocked(user_id, liked_user_id)
  );

DROP POLICY IF EXISTS "Users can insert their own likes" ON public.matches;
CREATE POLICY "Users can insert their own likes"
  ON public.matches FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND is_mutual = false
    AND NOT public.is_blocked(auth.uid(), liked_user_id)
  );

-- =====================================================
-- CURATED MATCHES: Block visibility between blocked users  
-- =====================================================

DROP POLICY IF EXISTS "Users can view their curated matches" ON public.curated_matches;
CREATE POLICY "Users can view their curated matches"
  ON public.curated_matches FOR SELECT
  TO authenticated
  USING (
    (
      user_id = auth.uid() 
      OR matched_user_id = auth.uid() 
      OR has_role(auth.uid(), 'admin'::app_role)
    )
    AND NOT public.is_blocked(user_id, matched_user_id)
  );

DROP POLICY IF EXISTS "Users can view their own curated matches" ON public.curated_matches;
CREATE POLICY "Users can view their own curated matches"
  ON public.curated_matches FOR SELECT
  TO public
  USING (
    auth.uid() = user_id
    AND NOT public.is_blocked(user_id, matched_user_id)
  );

-- =====================================================
-- DATING POOL: Block visibility between blocked users
-- =====================================================

DROP POLICY IF EXISTS "Users can view their dating pool" ON public.dating_pool;
CREATE POLICY "Users can view their dating pool"
  ON public.dating_pool FOR SELECT
  TO authenticated
  USING (
    (user_id = auth.uid() OR pool_user_id = auth.uid())
    AND NOT public.is_blocked(user_id, pool_user_id)
  );

DROP POLICY IF EXISTS "Users can view their own dating pool" ON public.dating_pool;
CREATE POLICY "Users can view their own dating pool"
  ON public.dating_pool FOR SELECT
  TO public
  USING (
    auth.uid() = user_id
    AND NOT public.is_blocked(user_id, pool_user_id)
  );

-- =====================================================
-- USER PROFILES: Block discovery of blocked users
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can view profiles through view" ON public.user_profiles;
CREATE POLICY "Authenticated users can view profiles through view"
  ON public.user_profiles FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR (
      is_profile_complete = true
      AND COALESCE(discovery_privacy_mode, 'open'::text) <> 'hidden'::text
      AND NOT public.is_blocked(auth.uid(), user_id)
    )
  );

-- =====================================================
-- DATE PROPOSALS: Block between blocked users
-- =====================================================

DROP POLICY IF EXISTS "Users can view their date proposals" ON public.date_proposals;
CREATE POLICY "Users can view their date proposals"
  ON public.date_proposals FOR SELECT
  TO authenticated
  USING (
    (creator_user_id = auth.uid() OR recipient_user_id = auth.uid())
    AND NOT public.is_blocked(creator_user_id, recipient_user_id)
  );

DROP POLICY IF EXISTS "Users can view proposals they created or received" ON public.date_proposals;
CREATE POLICY "Users can view proposals they created or received"
  ON public.date_proposals FOR SELECT
  TO public
  USING (
    (auth.uid() = creator_user_id OR auth.uid() = recipient_user_id)
    AND NOT public.is_blocked(creator_user_id, recipient_user_id)
  );

DROP POLICY IF EXISTS "Users can create date proposals for mutual matches" ON public.date_proposals;
CREATE POLICY "Users can create date proposals for mutual matches"
  ON public.date_proposals FOR INSERT
  TO authenticated
  WITH CHECK (
    creator_user_id = auth.uid()
    AND has_mutual_match(auth.uid(), recipient_user_id)
    AND NOT public.is_blocked(auth.uid(), recipient_user_id)
  );

-- =====================================================
-- CONVERSATION TRACKER: Block between blocked users
-- =====================================================

DROP POLICY IF EXISTS "Users can view their conversation trackers" ON public.conversation_tracker;
CREATE POLICY "Users can view their conversation trackers"
  ON public.conversation_tracker FOR SELECT
  TO authenticated
  USING (
    (user_id = auth.uid() OR match_user_id = auth.uid())
    AND NOT public.is_blocked(user_id, match_user_id)
  );
