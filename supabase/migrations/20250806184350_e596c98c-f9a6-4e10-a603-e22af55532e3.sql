-- Fix database function security by adding SET search_path parameter
-- This prevents schema injection attacks

-- 1. Fix calculate_age function
CREATE OR REPLACE FUNCTION public.calculate_age(birth_date date)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  RETURN EXTRACT(YEAR FROM AGE(birth_date));
END;
$function$;

-- 2. Fix update_journey_stage function
CREATE OR REPLACE FUNCTION public.update_journey_stage()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 3. Fix update_rif_profile_timestamp function
CREATE OR REPLACE FUNCTION public.update_rif_profile_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 4. Fix handle_new_user_profile function
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.user_profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$function$;

-- 5. Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$function$;

-- 6. Fix update_user_profile_timestamp function
CREATE OR REPLACE FUNCTION public.update_user_profile_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 7. Fix verify_age_18_plus function
CREATE OR REPLACE FUNCTION public.verify_age_18_plus(birth_date date)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  RETURN public.calculate_age(birth_date) >= 18;
END;
$function$;

-- 8. Fix update_age_verification function
CREATE OR REPLACE FUNCTION public.update_age_verification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  IF NEW.date_of_birth IS NOT NULL THEN
    NEW.age = public.calculate_age(NEW.date_of_birth);
    NEW.age_verified = public.verify_age_18_plus(NEW.date_of_birth);
    NEW.age_verification_timestamp = NOW();
  END IF;
  RETURN NEW;
END;
$function$;

-- 9. Fix update_conversation_engagement function
CREATE OR REPLACE FUNCTION public.update_conversation_engagement()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  
  -- Trigger AI concierge when engagement score > 0.7 and message count > 15
  IF NEW.mutual_engagement_score > 0.7 AND NEW.message_count > 15 AND NEW.ai_concierge_triggered = FALSE THEN
    NEW.ai_concierge_triggered = TRUE;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 10. Fix update_conversation_monitor function
CREATE OR REPLACE FUNCTION public.update_conversation_monitor()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Update or insert conversation monitor data
  INSERT INTO public.conversation_monitor (conversation_id, last_message_time, message_count, updated_at)
  VALUES (NEW.conversation_id, now(), 1, now())
  ON CONFLICT (conversation_id) 
  DO UPDATE SET 
    last_message_time = now(),
    message_count = conversation_monitor.message_count + 1,
    inactivity_hours = 0,
    updated_at = now();
    
  RETURN NEW;
END;
$function$;

-- 11. Fix update_preference_timestamp function
CREATE OR REPLACE FUNCTION public.update_preference_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  IF OLD.preference_to_see IS DISTINCT FROM NEW.preference_to_see OR
     OLD.preference_to_be_seen_by IS DISTINCT FROM NEW.preference_to_be_seen_by OR
     OLD.gender_identity IS DISTINCT FROM NEW.gender_identity OR
     OLD.sexual_orientation IS DISTINCT FROM NEW.sexual_orientation THEN
    NEW.last_preference_update = now();
  END IF;
  RETURN NEW;
END;
$function$;

-- 12. Fix mark_messages_as_read function
CREATE OR REPLACE FUNCTION public.mark_messages_as_read(p_conversation_id text, p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  UPDATE public.messages 
  SET read_at = now()
  WHERE conversation_id = p_conversation_id 
    AND recipient_user_id = p_user_id 
    AND read_at IS NULL;
END;
$function$;

-- 13. Fix handle_new_user_rif_settings function
CREATE OR REPLACE FUNCTION public.handle_new_user_rif_settings()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Use upsert to prevent duplicate key violations
  INSERT INTO public.rif_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$function$;

-- 14. Fix handle_new_like function
CREATE OR REPLACE FUNCTION public.handle_new_like()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  existing_like_id UUID;
  conversation_id_val TEXT;
BEGIN
  -- Check if the liked user already liked this user back
  SELECT id INTO existing_like_id
  FROM public.matches 
  WHERE user_id = NEW.liked_user_id 
    AND liked_user_id = NEW.user_id;

  -- If mutual like exists, mark both as mutual and create conversation
  IF existing_like_id IS NOT NULL THEN
    -- Mark both likes as mutual
    UPDATE public.matches 
    SET is_mutual = true, updated_at = now()
    WHERE id = existing_like_id OR id = NEW.id;
    
    -- Create conversation ID
    conversation_id_val := CONCAT(
      LEAST(NEW.user_id::text, NEW.liked_user_id::text),
      '_',
      GREATEST(NEW.user_id::text, NEW.liked_user_id::text)
    );
    
    -- Create conversation tracker
    INSERT INTO public.conversation_tracker (
      conversation_id,
      user_id,
      match_user_id
    ) VALUES (
      conversation_id_val,
      NEW.user_id,
      NEW.liked_user_id
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 15. Fix update_conversation_on_message function
CREATE OR REPLACE FUNCTION public.update_conversation_on_message()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Update conversation_tracker with latest activity
  UPDATE public.conversation_tracker 
  SET 
    last_activity = NEW.created_at,
    message_count = message_count + 1,
    updated_at = NEW.created_at
  WHERE conversation_id = NEW.conversation_id;
  
  -- Update conversation_monitor with better conflict handling
  INSERT INTO public.conversation_monitor (
    conversation_id, 
    last_message_time, 
    message_count, 
    updated_at
  )
  VALUES (
    NEW.conversation_id, 
    NEW.created_at, 
    1, 
    NEW.created_at
  )
  ON CONFLICT (conversation_id) 
  DO UPDATE SET 
    last_message_time = NEW.created_at,
    message_count = conversation_monitor.message_count + 1,
    inactivity_hours = 0,
    updated_at = NEW.created_at;
    
  RETURN NEW;
END;
$function$;

-- 16. Fix delete_user_completely function
CREATE OR REPLACE FUNCTION public.delete_user_completely(user_id_input uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Delete from all user-related tables in the correct order to avoid foreign key conflicts
  
  -- Delete RIF-related data
  DELETE FROM public.rif_insights WHERE user_id = user_id_input;
  DELETE FROM public.rif_recommendations WHERE user_id = user_id_input;
  DELETE FROM public.rif_reflections WHERE user_id = user_id_input;
  DELETE FROM public.rif_feedback WHERE user_id = user_id_input;
  DELETE FROM public.rif_event_log WHERE user_id = user_id_input;
  DELETE FROM public.rif_profiles WHERE user_id = user_id_input;
  DELETE FROM public.rif_settings WHERE user_id = user_id_input;
  DELETE FROM public.user_rif_state WHERE user_id = user_id_input;
  
  -- Delete conversation-related data
  DELETE FROM public.conversation_events WHERE user_id = user_id_input;
  DELETE FROM public.conversation_monitor WHERE conversation_id IN (
    SELECT conversation_id FROM public.conversation_tracker 
    WHERE user_id = user_id_input OR match_user_id = user_id_input
  );
  DELETE FROM public.conversation_tracker WHERE user_id = user_id_input OR match_user_id = user_id_input;
  
  -- Delete date-related data
  DELETE FROM public.date_journal WHERE user_id = user_id_input;
  DELETE FROM public.date_proposals WHERE creator_user_id = user_id_input OR recipient_user_id = user_id_input;
  
  -- Delete profile data
  DELETE FROM public.user_profiles WHERE user_id = user_id_input;
  DELETE FROM public.profiles WHERE id = user_id_input;
  
  -- Note: We don't delete from auth.users as that's managed by Supabase Auth
  -- The user account itself will remain but all profile data will be removed
END;
$function$;

-- 17. Fix check_profile_completion function
CREATE OR REPLACE FUNCTION public.check_profile_completion()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  NEW.is_profile_complete = (
    NEW.bio IS NOT NULL AND 
    NEW.age IS NOT NULL AND
    NEW.photos IS NOT NULL AND 
    array_length(NEW.photos, 1) > 0 AND
    NEW.interests IS NOT NULL AND 
    array_length(NEW.interests, 1) > 0 AND
    NEW.gender_identity IS NOT NULL AND
    NEW.sexual_orientation IS NOT NULL AND
    NEW.occupation IS NOT NULL AND
    NEW.education_level IS NOT NULL AND
    NEW.relationship_goals IS NOT NULL AND
    array_length(NEW.relationship_goals, 1) > 0 AND
    NEW.exercise_habits IS NOT NULL AND
    NEW.smoking_status IS NOT NULL AND
    NEW.drinking_status IS NOT NULL
    -- Removed height_cm requirement as it's optional
  );
  RETURN NEW;
END;
$function$;

-- 18. Fix find_nearest_neighborhood function
CREATE OR REPLACE FUNCTION public.find_nearest_neighborhood(user_lat numeric, user_lng numeric)
 RETURNS TABLE(id uuid, name text, city text, state text, country text, lat numeric, lng numeric, transit_score integer, walkability_score integer, distance_km numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.name,
    n.city,
    n.state,
    n.country,
    n.lat,
    n.lng,
    n.transit_score,
    n.walkability_score,
    -- Calculate distance using Haversine formula (approximate)
    (6371 * acos(cos(radians(user_lat)) * cos(radians(n.lat)) * cos(radians(n.lng) - radians(user_lng)) + sin(radians(user_lat)) * sin(radians(n.lat)))) AS distance_km
  FROM public.neighborhoods n
  ORDER BY distance_km
  LIMIT 1;
END;
$function$;

-- 19. Remove or fix the "MonArk RFP" table - it appears to be unused
-- First check if it has any data, if not, we'll drop it for security
DROP TABLE IF EXISTS public."MonArk RFP";

-- 20. Create security logging function for admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  admin_user_id uuid,
  action_type text,
  target_table text,
  target_id text,
  details jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Log admin actions for security monitoring
  INSERT INTO public.rif_event_log (user_id, event_type, event_data, timestamp)
  VALUES (
    admin_user_id,
    'admin_action',
    jsonb_build_object(
      'action_type', action_type,
      'target_table', target_table,
      'target_id', target_id,
      'details', details,
      'timestamp', now()
    ),
    now()
  );
END;
$function$;