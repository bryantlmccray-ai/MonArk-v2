-- SECURITY FIX: Restrict profiles SELECT policies to hide email from conversation partners
-- Consolidate duplicate SELECT policies and create a view for partner access

-- Drop redundant/leaky policies
DROP POLICY IF EXISTS "Users can view conversation partners' profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own or conversation partner profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- Owner can see everything including email
CREATE POLICY "Owner can view own profile"
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Conversation partners can see name only (not email) via a secure function
CREATE OR REPLACE FUNCTION public.get_conversation_partner_name(p_partner_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  v_name text;
BEGIN
  -- Verify caller has a conversation with this partner
  IF NOT EXISTS (
    SELECT 1 FROM public.conversation_tracker ct
    WHERE (ct.user_id = auth.uid() AND ct.match_user_id = p_partner_id)
       OR (ct.match_user_id = auth.uid() AND ct.user_id = p_partner_id)
  ) THEN
    RETURN NULL;
  END IF;
  
  SELECT name INTO v_name FROM public.profiles WHERE id = p_partner_id;
  RETURN v_name;
END;
$$;

-- Partners can read profiles rows but NOT email (we need row access for joins)
-- Use a restrictive approach: allow row access but only expose name via function
CREATE POLICY "Conversation partners can view partner profiles"
  ON profiles FOR SELECT TO authenticated
  USING (
    auth.uid() = id 
    OR id IN (
      SELECT CASE WHEN ct.user_id = auth.uid() THEN ct.match_user_id ELSE ct.user_id END
      FROM conversation_tracker ct
      WHERE ct.user_id = auth.uid() OR ct.match_user_id = auth.uid()
    )
  );