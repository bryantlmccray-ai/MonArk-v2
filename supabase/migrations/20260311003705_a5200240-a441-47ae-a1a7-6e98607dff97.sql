
-- Async jobs table for background processing pattern
-- Edge functions write a job row and return immediately; 
-- results are pushed to the client via Supabase Realtime
CREATE TABLE public.async_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  job_type text NOT NULL,  -- e.g. 'date_proposal', 'adaptive_insight', 'ml_training'
  status text NOT NULL DEFAULT 'pending',  -- pending, processing, completed, failed
  input_data jsonb DEFAULT '{}',
  result_data jsonb DEFAULT NULL,
  error_message text DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz DEFAULT NULL,
  completed_at timestamptz DEFAULT NULL,
  expires_at timestamptz DEFAULT (now() + interval '24 hours')
);

-- Index for polling and Realtime filtering
CREATE INDEX idx_async_jobs_user_status ON public.async_jobs(user_id, status);
CREATE INDEX idx_async_jobs_type_status ON public.async_jobs(job_type, status);

-- Enable RLS
ALTER TABLE public.async_jobs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own jobs
CREATE POLICY "Users can view their own jobs"
ON public.async_jobs FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Users can create their own jobs
CREATE POLICY "Users can create their own jobs"
ON public.async_jobs FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Service role (edge functions) can update any job
-- No user-facing UPDATE policy — only edge functions with service role can update

-- Enable Realtime on this table so clients get push updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.async_jobs;

-- Cleanup expired jobs (can be called by cron)
CREATE OR REPLACE FUNCTION public.cleanup_expired_async_jobs()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO ''
AS $$
  DELETE FROM public.async_jobs WHERE expires_at < now();
$$;
