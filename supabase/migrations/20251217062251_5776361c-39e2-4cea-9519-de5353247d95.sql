-- Add approval workflow columns to waitlist_submissions
ALTER TABLE public.waitlist_submissions
ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS reviewed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approval_notes text,
ADD COLUMN IF NOT EXISTS why_monark text,
ADD COLUMN IF NOT EXISTS looking_for text;

-- Create index for faster filtering by status
CREATE INDEX IF NOT EXISTS idx_waitlist_approval_status ON public.waitlist_submissions(approval_status);

-- Allow admins to view and manage all waitlist submissions
CREATE POLICY "Admins can view all waitlist submissions"
ON public.waitlist_submissions
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role));

CREATE POLICY "Admins can update waitlist submissions"
ON public.waitlist_submissions
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role));