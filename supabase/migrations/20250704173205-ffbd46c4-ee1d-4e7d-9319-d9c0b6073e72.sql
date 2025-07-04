-- Create waitlist submissions table
CREATE TABLE public.waitlist_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  source_page TEXT DEFAULT 'demo-landing'
);

-- Enable Row Level Security
ALTER TABLE public.waitlist_submissions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous insertions (for waitlist submissions)
CREATE POLICY "Allow anonymous waitlist submissions" 
ON public.waitlist_submissions 
FOR INSERT 
WITH CHECK (true);

-- Create policy to prevent public access to waitlist data
CREATE POLICY "No public access to waitlist submissions" 
ON public.waitlist_submissions 
FOR ALL 
USING (false);