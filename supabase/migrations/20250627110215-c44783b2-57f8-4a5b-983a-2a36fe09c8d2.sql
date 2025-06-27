
-- Create conversation_events table for tracking conversation activities
CREATE TABLE public.conversation_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users,
  event_type TEXT NOT NULL, -- 'message_sent', 'graceful_exit', 'nudge_triggered', 'nudge_dismissed'
  event_data JSONB DEFAULT '{}',
  sentiment_score NUMERIC DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create nudge_library table for storing conversation prompts
CREATE TABLE public.nudge_library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nudge_type TEXT NOT NULL, -- 'clarity', 'pacing', 'graceful_exit', 'meaningful_question'
  trigger_context TEXT NOT NULL, -- 'inactive_24h', 'mismatched_energy', 'unclear_intent'
  prompt_text TEXT NOT NULL,
  response_options JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create conversation_monitor table for tracking conversation health
CREATE TABLE public.conversation_monitor (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id TEXT NOT NULL UNIQUE,
  last_message_time TIMESTAMP WITH TIME ZONE,
  message_count INTEGER DEFAULT 0,
  response_balance_score NUMERIC DEFAULT 0.0, -- -1 to 1, balanced vs one-sided
  avg_sentiment_score NUMERIC DEFAULT 0.0,
  inactivity_hours INTEGER DEFAULT 0,
  nudge_count INTEGER DEFAULT 0,
  last_nudge_time TIMESTAMP WITH TIME ZONE,
  graceful_exit BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.conversation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nudge_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_monitor ENABLE ROW LEVEL SECURITY;

-- RLS policies for conversation_events
CREATE POLICY "Users can view their own conversation events" ON public.conversation_events 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own conversation events" ON public.conversation_events 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS policies for nudge_library (read-only for users)
CREATE POLICY "Users can view active nudges" ON public.nudge_library 
  FOR SELECT USING (is_active = TRUE);

-- RLS policies for conversation_monitor
CREATE POLICY "Users can view conversation monitors for their conversations" ON public.conversation_monitor 
  FOR SELECT USING (
    conversation_id IN (
      SELECT conversation_id FROM public.conversation_tracker 
      WHERE user_id = auth.uid() OR match_user_id = auth.uid()
    )
  );

-- Insert default nudge prompts
INSERT INTO public.nudge_library (nudge_type, trigger_context, prompt_text, response_options) VALUES
('meaningful_question', 'low_engagement', 'Want help asking a meaningful question?', 
 '["What''s something you''re genuinely curious about in life?", "What''s been the highlight of your week?", "What''s something you''ve learned recently that excited you?"]'),

('clarity', 'unclear_intent', 'Not sure where this is going? You can check in with a clarity prompt.',
 '["I''m enjoying our conversation! What are you hoping to discover about each other?", "How are you feeling about our connection so far?", "What would make this conversation more meaningful for you?"]'),

('pacing', 'mismatched_energy', 'Feeling like the conversation pace isn''t quite right?',
 '["I want to make sure we''re both comfortable with how this is going.", "Should we slow down a bit and get to know each other better?", "I''d love to hear your thoughts on how this feels for you."]'),

('graceful_exit', 'one_sided_messaging', 'Would you like help closing this conversation kindly?',
 '["Thanks for chatting! I don''t think we''re quite the right fit, but I wish you well in your search.", "This has been lovely, but I''m going to step back for now. Best of luck!", "I''m stepping back from this conversation. Thanks for connecting, and I hope you find what you''re looking for."]'),

('graceful_exit', 'no_connection', 'Not feeling a strong connection? Here are some kind ways to close.',
 '["I''ve enjoyed getting to know you, but I don''t feel we''re a romantic match. Wishing you the best!", "Thanks for the great conversation! I''m going to focus on other connections right now.", "I appreciate your time, but I think we''re looking for different things. Take care!"]');

-- Create function to update conversation monitor
CREATE OR REPLACE FUNCTION update_conversation_monitor()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger to update monitor when conversation tracker changes
CREATE TRIGGER update_conversation_monitor_trigger
  AFTER UPDATE ON public.conversation_tracker
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_monitor();
