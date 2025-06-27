
-- Create conversation_tracker table to monitor engagement
CREATE TABLE public.conversation_tracker (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users,
  match_user_id UUID NOT NULL REFERENCES auth.users,
  conversation_id TEXT NOT NULL,
  message_count INTEGER DEFAULT 0,
  mutual_engagement_score NUMERIC DEFAULT 0.0,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ai_concierge_triggered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create date_proposals table for AI-generated date ideas
CREATE TABLE public.date_proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_user_id UUID NOT NULL REFERENCES auth.users,
  recipient_user_id UUID NOT NULL REFERENCES auth.users,
  conversation_id TEXT NOT NULL,
  title TEXT NOT NULL,
  activity TEXT NOT NULL,
  location_type TEXT,
  vibe TEXT,
  time_suggestion TEXT,
  rationale TEXT,
  status TEXT DEFAULT 'proposed', -- 'proposed', 'accepted', 'declined', 'completed'
  ai_generated BOOLEAN DEFAULT TRUE,
  proposal_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create date_journal table for completed dates
CREATE TABLE public.date_journal (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date_proposal_id UUID REFERENCES public.date_proposals,
  user_id UUID NOT NULL REFERENCES auth.users,
  partner_name TEXT NOT NULL,
  date_title TEXT NOT NULL,
  date_activity TEXT NOT NULL,
  date_completed TIMESTAMP WITH TIME ZONE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  reflection_notes TEXT,
  learned_insights TEXT,
  would_repeat BOOLEAN,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.conversation_tracker ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.date_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.date_journal ENABLE ROW LEVEL SECURITY;

-- RLS policies for conversation_tracker
CREATE POLICY "Users can view conversations they're part of" ON public.conversation_tracker 
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = match_user_id);
CREATE POLICY "Users can update conversations they're part of" ON public.conversation_tracker 
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = match_user_id);
CREATE POLICY "Users can insert conversations they're part of" ON public.conversation_tracker 
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() = match_user_id);

-- RLS policies for date_proposals
CREATE POLICY "Users can view proposals they created or received" ON public.date_proposals 
  FOR SELECT USING (auth.uid() = creator_user_id OR auth.uid() = recipient_user_id);
CREATE POLICY "Users can create proposals" ON public.date_proposals 
  FOR INSERT WITH CHECK (auth.uid() = creator_user_id);
CREATE POLICY "Users can update proposals they created or received" ON public.date_proposals 
  FOR UPDATE USING (auth.uid() = creator_user_id OR auth.uid() = recipient_user_id);

-- RLS policies for date_journal
CREATE POLICY "Users can view their own date journal entries" ON public.date_journal 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own date journal entries" ON public.date_journal 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own date journal entries" ON public.date_journal 
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function to update conversation engagement
CREATE OR REPLACE FUNCTION update_conversation_engagement()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  
  -- Trigger AI concierge when engagement score > 0.7 and message count > 15
  IF NEW.mutual_engagement_score > 0.7 AND NEW.message_count > 15 AND NEW.ai_concierge_triggered = FALSE THEN
    NEW.ai_concierge_triggered = TRUE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for conversation engagement updates
CREATE TRIGGER update_conversation_engagement_trigger
  BEFORE UPDATE ON public.conversation_tracker
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_engagement();
