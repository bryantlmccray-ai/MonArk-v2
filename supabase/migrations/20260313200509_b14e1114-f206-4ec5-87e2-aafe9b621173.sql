-- SECURITY HARDENING: Fix critical RLS policy bypasses

-- 1. conversation_tracker: Remove weak INSERT policies, add mutual match requirement
DROP POLICY IF EXISTS "Users can insert conversations they're part of" ON conversation_tracker;
DROP POLICY IF EXISTS "System can insert conversation trackers" ON conversation_tracker;
CREATE POLICY "Insert conversation trackers for mutual matches only"
  ON conversation_tracker FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND has_mutual_match(auth.uid(), match_user_id) AND NOT is_blocked(auth.uid(), match_user_id));

-- Remove duplicate weak public SELECT/UPDATE on conversation_tracker
DROP POLICY IF EXISTS "Users can view conversations they're part of" ON conversation_tracker;
DROP POLICY IF EXISTS "Users can update conversations they're part of" ON conversation_tracker;

-- 2. date_proposals: Remove public INSERT that bypasses has_mutual_match
DROP POLICY IF EXISTS "Users can create proposals" ON date_proposals;
DROP POLICY IF EXISTS "Users can view proposals they created or received" ON date_proposals;
DROP POLICY IF EXISTS "Users can update proposals they created or received" ON date_proposals;
DROP POLICY IF EXISTS "Users can delete proposals they created" ON date_proposals;

-- 3. contact_shares: Remove public INSERT that bypasses has_mutual_match
DROP POLICY IF EXISTS "Users can share their own contact" ON contact_shares;

-- 4. messages: Remove public INSERT that only checks conversation_tracker (no mutual match)
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;

-- 5. curated_matches: Remove weak public UPDATE/SELECT (keep authenticated versions)
DROP POLICY IF EXISTS "Users can update their own curated matches" ON curated_matches;
DROP POLICY IF EXISTS "Users can view their own curated matches" ON curated_matches;

-- 6. vendor_profiles: Remove public SELECT exposing email/phone without auth
DROP POLICY IF EXISTS "Public read access to vendor profiles" ON vendor_profiles;

-- 7. rate_limits: Ensure only admins can modify (SELECT-only for regular users already in place)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'rate_limits' AND policyname = 'Only admins can modify rate limits') THEN
    EXECUTE 'CREATE POLICY "Only admins can modify rate limits" ON rate_limits FOR ALL TO authenticated USING (has_role(auth.uid(), ''admin''::app_role)) WITH CHECK (has_role(auth.uid(), ''admin''::app_role))';
  END IF;
END $$;