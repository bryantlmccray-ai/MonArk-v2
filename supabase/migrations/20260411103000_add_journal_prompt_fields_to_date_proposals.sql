-- Migration: add journal_prompt_sent tracking to date_proposals
-- This supports the check-date-feedback function which sends after-date journal
-- email prompts 24 hours after an accepted date_proposal's time_suggestion

ALTER TABLE public.date_proposals
  ADD COLUMN IF NOT EXISTS journal_prompt_sent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS journal_prompt_sent_at timestamptz;

-- Index for efficient querying by the check-date-feedback cron function
CREATE INDEX IF NOT EXISTS idx_date_proposals_journal_prompt
  ON public.date_proposals (status, time_suggestion, journal_prompt_sent)
  WHERE status = 'accepted' AND journal_prompt_sent = false;

-- Comment for documentation
COMMENT ON COLUMN public.date_proposals.journal_prompt_sent IS
  'True once the after-date journal prompt email has been sent to both participants';
COMMENT ON COLUMN public.date_proposals.journal_prompt_sent_at IS
  'Timestamp when the journal prompt email was dispatched';
