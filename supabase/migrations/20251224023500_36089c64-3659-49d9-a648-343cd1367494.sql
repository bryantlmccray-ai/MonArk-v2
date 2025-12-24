-- Create table for after-date feedback based on contact shares
CREATE TABLE public.contact_share_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_share_id UUID NOT NULL REFERENCES public.contact_shares(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  match_user_id UUID NOT NULL,
  conversation_id TEXT NOT NULL,
  did_meet BOOLEAN NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  see_again TEXT CHECK (see_again IN ('yes', 'maybe', 'no')),
  comment TEXT,
  notification_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(contact_share_id, user_id)
);

-- Enable RLS
ALTER TABLE public.contact_share_feedback ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can create their own feedback" 
ON public.contact_share_feedback 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own feedback" 
ON public.contact_share_feedback 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback" 
ON public.contact_share_feedback 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_contact_share_feedback_user ON public.contact_share_feedback(user_id);
CREATE INDEX idx_contact_share_feedback_contact_share ON public.contact_share_feedback(contact_share_id);

-- Add notification_sent column to contact_shares to track if we've notified about feedback
ALTER TABLE public.contact_shares 
ADD COLUMN feedback_notification_sent BOOLEAN DEFAULT false,
ADD COLUMN feedback_notification_sent_at TIMESTAMP WITH TIME ZONE;