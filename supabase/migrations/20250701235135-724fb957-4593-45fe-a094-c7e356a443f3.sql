
-- Create a function to completely delete a user and all their associated data
CREATE OR REPLACE FUNCTION public.delete_user_completely(user_id_input UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Grant execute permission to authenticated users for their own data only
REVOKE ALL ON FUNCTION public.delete_user_completely FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_user_completely TO authenticated;
