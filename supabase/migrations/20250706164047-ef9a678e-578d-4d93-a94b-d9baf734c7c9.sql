-- Add dismissal tracking to date proposals
ALTER TABLE public.date_proposals 
ADD COLUMN dismissed_by_creator_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN dismissed_by_recipient_at TIMESTAMP WITH TIME ZONE;

-- Add index for better performance when filtering dismissed proposals
CREATE INDEX idx_date_proposals_dismissal ON public.date_proposals(dismissed_by_creator_at, dismissed_by_recipient_at);