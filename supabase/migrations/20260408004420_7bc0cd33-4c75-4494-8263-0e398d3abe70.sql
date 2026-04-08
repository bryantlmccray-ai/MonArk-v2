-- Delete self-referential test conversation data
-- First delete messages where sender = recipient
DELETE FROM public.messages WHERE sender_user_id = recipient_user_id;

-- Then delete conversation tracker entries where user = match
DELETE FROM public.conversation_tracker WHERE user_id = match_user_id;

-- Clean up conversation monitor for orphaned conversations
DELETE FROM public.conversation_monitor WHERE conversation_id IN ('conv_alex_001', 'conv_jordan_001', 'conv_maya_001')
AND NOT EXISTS (SELECT 1 FROM public.conversation_tracker ct WHERE ct.conversation_id = conversation_monitor.conversation_id);