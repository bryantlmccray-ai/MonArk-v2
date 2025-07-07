-- Fix duplicate key constraint issues by ensuring proper upsert operations
-- This addresses the RIF settings constraint violation

-- Update the handle_new_user_rif_settings function to use upsert instead of insert
CREATE OR REPLACE FUNCTION public.handle_new_user_rif_settings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Use upsert to prevent duplicate key violations
  INSERT INTO public.rif_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$function$;

-- Ensure conversation monitor handles duplicates properly
-- Update the conversation monitor trigger function to handle conflicts better
CREATE OR REPLACE FUNCTION public.update_conversation_on_message()
RETURNS trigger
LANGUAGE plpgsql
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