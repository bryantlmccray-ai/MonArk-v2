
-- Atomic contact sharing function with row locking
-- Checks mutual match, phone number, duplicate share, and inserts — all in one transaction
CREATE OR REPLACE FUNCTION public.atomic_share_contact(
  p_sharer_id uuid,
  p_recipient_id uuid,
  p_conversation_id text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_phone text;
  v_existing_id uuid;
  v_has_match boolean;
  v_sharer_name text;
  v_result jsonb;
BEGIN
  -- 1. Prevent self-sharing
  IF p_sharer_id = p_recipient_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot share contact with yourself', 'status', 400);
  END IF;

  -- 2. Verify mutual match (uses existing SECURITY DEFINER function)
  v_has_match := public.has_mutual_match(p_sharer_id, p_recipient_id);
  IF NOT v_has_match THEN
    RETURN jsonb_build_object('success', false, 'error', 'You can only share contact info with mutual matches', 'status', 403);
  END IF;

  -- 3. Get sharer's phone number
  SELECT phone_number INTO v_phone
  FROM public.user_profiles
  WHERE user_id = p_sharer_id;

  IF v_phone IS NULL OR v_phone = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Please add your phone number to your profile first', 'status', 400);
  END IF;

  -- 4. Lock and check for existing share (SELECT FOR UPDATE prevents race conditions)
  SELECT id INTO v_existing_id
  FROM public.contact_shares
  WHERE sharer_user_id = p_sharer_id
    AND recipient_user_id = p_recipient_id
  FOR UPDATE SKIP LOCKED;

  IF v_existing_id IS NOT NULL THEN
    RETURN jsonb_build_object('success', true, 'already_shared', true);
  END IF;

  -- 5. Insert the contact share record atomically
  INSERT INTO public.contact_shares (sharer_user_id, recipient_user_id, conversation_id, sms_sent)
  VALUES (p_sharer_id, p_recipient_id, p_conversation_id, false)
  ON CONFLICT DO NOTHING;  -- Extra safety against race conditions

  -- 6. Get sharer's display name for the system message
  SELECT name INTO v_sharer_name
  FROM public.profiles
  WHERE id = p_sharer_id;

  -- 7. Insert system message
  INSERT INTO public.messages (conversation_id, sender_user_id, recipient_user_id, content, message_type)
  VALUES (
    p_conversation_id,
    p_sharer_id,
    p_recipient_id,
    COALESCE(v_sharer_name, 'Your match') || ' shared their phone number with you!',
    'system'
  );

  -- 8. Log the security event
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
$$;
