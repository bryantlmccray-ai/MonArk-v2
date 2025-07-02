
-- Create messages table for storing chat messages
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  sender_user_id UUID NOT NULL REFERENCES auth.users,
  recipient_user_id UUID NOT NULL REFERENCES auth.users,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'system')),
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on messages table
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policies for messages
CREATE POLICY "Users can view messages in their conversations" ON public.messages 
  FOR SELECT USING (
    auth.uid() = sender_user_id OR 
    auth.uid() = recipient_user_id
  );

CREATE POLICY "Users can send messages in their conversations" ON public.messages 
  FOR INSERT WITH CHECK (
    auth.uid() = sender_user_id AND
    EXISTS (
      SELECT 1 FROM public.conversation_tracker 
      WHERE conversation_id = messages.conversation_id 
      AND (user_id = auth.uid() OR match_user_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their own messages" ON public.messages 
  FOR UPDATE USING (auth.uid() = sender_user_id);

-- Enable real-time for messages table
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Create function to update conversation activity when messages are sent
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Update conversation_tracker with latest activity
  UPDATE public.conversation_tracker 
  SET 
    last_activity = NEW.created_at,
    message_count = message_count + 1,
    updated_at = NEW.created_at
  WHERE conversation_id = NEW.conversation_id;
  
  -- Update conversation_monitor
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
$$ LANGUAGE plpgsql;

-- Create trigger for message updates
CREATE TRIGGER update_conversation_on_message_trigger
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_on_message();

-- Create function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_as_read(
  p_conversation_id TEXT,
  p_user_id UUID
)
RETURNS void AS $$
BEGIN
  UPDATE public.messages 
  SET read_at = now()
  WHERE conversation_id = p_conversation_id 
    AND recipient_user_id = p_user_id 
    AND read_at IS NULL;
END;
$$ LANGUAGE plpgsql;
