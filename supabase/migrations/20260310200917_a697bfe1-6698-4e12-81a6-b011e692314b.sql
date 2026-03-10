
-- 1. Create dedicated extensions schema
CREATE SCHEMA IF NOT EXISTS extensions;

-- 2. Move common extensions to dedicated schema
-- (These are idempotent - safe if already there)
DROP EXTENSION IF EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA extensions;

DROP EXTENSION IF EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" SCHEMA extensions;

-- Add extensions schema to search path so existing code still works
ALTER ROLE authenticator SET search_path TO public, extensions;
ALTER ROLE anon SET search_path TO public, extensions;
ALTER ROLE authenticated SET search_path TO public, extensions;
ALTER ROLE service_role SET search_path TO public, extensions;

-- 3. Fix check_mutual_match - change search_path from 'public' to ''
CREATE OR REPLACE FUNCTION public.check_mutual_match(user_a uuid, user_b uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.curated_matches cm1
    JOIN public.curated_matches cm2 ON cm1.user_id = cm2.matched_user_id AND cm1.matched_user_id = cm2.user_id
    WHERE cm1.user_id = user_a 
    AND cm1.matched_user_id = user_b
    AND cm1.status = 'accepted'
    AND cm2.status = 'accepted'
  );
END;
$function$;

-- 4. Fix is_match_or_pool_member - change search_path from 'public' to ''
CREATE OR REPLACE FUNCTION public.is_match_or_pool_member(viewer_id uuid, target_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.dating_pool dp
    WHERE dp.user_id = viewer_id AND dp.pool_user_id = target_id
  ) OR EXISTS (
    SELECT 1 FROM public.curated_matches cm
    WHERE cm.user_id = viewer_id AND cm.matched_user_id = target_id
  ) OR public.has_mutual_match(viewer_id, target_id)
$function$;

-- 5. Fix atomic_share_contact - change search_path from 'public' to ''
CREATE OR REPLACE FUNCTION public.atomic_share_contact(p_sharer_id uuid, p_recipient_id uuid, p_conversation_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_phone text;
  v_existing_id uuid;
  v_has_match boolean;
  v_sharer_name text;
  v_result jsonb;
BEGIN
  IF p_sharer_id = p_recipient_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot share contact with yourself', 'status', 400);
  END IF;

  v_has_match := public.has_mutual_match(p_sharer_id, p_recipient_id);
  IF NOT v_has_match THEN
    RETURN jsonb_build_object('success', false, 'error', 'You can only share contact info with mutual matches', 'status', 403);
  END IF;

  SELECT phone_number INTO v_phone
  FROM public.user_profiles
  WHERE user_id = p_sharer_id;

  IF v_phone IS NULL OR v_phone = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Please add your phone number to your profile first', 'status', 400);
  END IF;

  SELECT id INTO v_existing_id
  FROM public.contact_shares
  WHERE sharer_user_id = p_sharer_id
    AND recipient_user_id = p_recipient_id
  FOR UPDATE SKIP LOCKED;

  IF v_existing_id IS NOT NULL THEN
    RETURN jsonb_build_object('success', true, 'already_shared', true);
  END IF;

  INSERT INTO public.contact_shares (sharer_user_id, recipient_user_id, conversation_id, sms_sent)
  VALUES (p_sharer_id, p_recipient_id, p_conversation_id, false)
  ON CONFLICT DO NOTHING;

  SELECT name INTO v_sharer_name
  FROM public.profiles
  WHERE id = p_sharer_id;

  INSERT INTO public.messages (conversation_id, sender_user_id, recipient_user_id, content, message_type)
  VALUES (
    p_conversation_id,
    p_sharer_id,
    p_recipient_id,
    COALESCE(v_sharer_name, 'Your match') || ' shared their phone number with you!',
    'system'
  );

  INSERT INTO public.security_audit_log (event_type, user_id, target_user_id, action, success, metadata)
  VALUES (
    'contact_share',
    p_sharer_id,
    p_recipient_id,
    'share_contact_atomic',
    true,
    jsonb_build_object('conversation_id', p_conversation_id, 'timestamp', now())
  );

  RETURN jsonb_build_object('success', true, 'already_shared', false);
END;
$function$;
