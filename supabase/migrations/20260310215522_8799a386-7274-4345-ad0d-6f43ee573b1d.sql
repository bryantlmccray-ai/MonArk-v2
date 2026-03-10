
-- Fix PRIVILEGE_ESCALATION_MUTUAL_MATCH_BYPASS
-- Problem: Users can set is_mutual = true on INSERT/UPDATE, forging mutual matches
-- Solution: Use a trigger to force is_mutual = false on user writes, 
-- only the handle_new_like trigger (SECURITY DEFINER) can set it to true

-- 1. Drop the overly permissive policies
DROP POLICY IF EXISTS "Users can create their own likes" ON public.matches;
DROP POLICY IF EXISTS "Users can create their own matches" ON public.matches;
DROP POLICY IF EXISTS "Users can update matches they created" ON public.matches;
DROP POLICY IF EXISTS "Users can update matches they're part of" ON public.matches;

-- 2. Create tighter INSERT policy that forces is_mutual = false
CREATE POLICY "Users can insert their own likes"
ON public.matches
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND is_mutual = false
);

-- 3. No user-facing UPDATE policy on matches at all
-- The handle_new_like trigger (SECURITY DEFINER) handles setting is_mutual = true
-- Users should not be able to update match rows directly

-- 4. Keep SELECT policies (consolidate to one)
DROP POLICY IF EXISTS "Users can view matches involving them" ON public.matches;
DROP POLICY IF EXISTS "Users can view their own matches" ON public.matches;

CREATE POLICY "Users can view matches involving them"
ON public.matches
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR auth.uid() = liked_user_id);
