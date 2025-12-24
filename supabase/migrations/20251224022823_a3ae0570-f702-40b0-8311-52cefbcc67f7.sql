-- Add phone_number column to user_profiles for contact sharing
ALTER TABLE public.user_profiles 
ADD COLUMN phone_number TEXT;

-- Add contact sharing table to track who shared with whom
CREATE TABLE public.contact_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sharer_user_id UUID NOT NULL,
  recipient_user_id UUID NOT NULL,
  conversation_id TEXT NOT NULL,
  shared_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sms_sent BOOLEAN DEFAULT false,
  UNIQUE(sharer_user_id, recipient_user_id)
);

-- Enable RLS
ALTER TABLE public.contact_shares ENABLE ROW LEVEL SECURITY;

-- Users can view contact shares they're involved in
CREATE POLICY "Users can view their contact shares"
ON public.contact_shares
FOR SELECT
USING (auth.uid() = sharer_user_id OR auth.uid() = recipient_user_id);

-- Users can create contact shares where they are the sharer
CREATE POLICY "Users can share their own contact"
ON public.contact_shares
FOR INSERT
WITH CHECK (auth.uid() = sharer_user_id);

-- Create index for quick lookups
CREATE INDEX idx_contact_shares_conversation ON public.contact_shares(conversation_id);
CREATE INDEX idx_contact_shares_users ON public.contact_shares(sharer_user_id, recipient_user_id);