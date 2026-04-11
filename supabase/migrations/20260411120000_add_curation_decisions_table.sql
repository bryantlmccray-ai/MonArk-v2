-- Migration: add curation_decisions table
-- Purpose: Store every AI match curation decision for audit, debugging, and feedback learning
-- Generated: 2026-04-11

-- ─────────────────────────────────────────────
-- curation_decisions
-- One row per (user_a, user_b) pair evaluated by ai-match-curator
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.curation_decisions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- The person for whom we are curating (Sunday 3-pick recipient)
  requester_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- The two people being compared
  user_a_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_b_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Outcome
  should_match         BOOLEAN NOT NULL,
  confidence           NUMERIC(4,3) CHECK (confidence >= 0 AND confidence <= 1),
  compatibility_score  SMALLINT CHECK (compatibility_score >= 0 AND compatibility_score <= 100),

  -- AI-generated text (user-facing and internal)
  match_reason         TEXT,          -- shown to the user in SundayMatches
  internal_rationale   TEXT,          -- full reasoning, never shown to user

  -- Feature breakdown stored as JSONB for analytics
  rif_breakdown        JSONB,         -- { intent_clarity: 0.9, pacing_preferences: 0.7, ... }
  interest_overlap     TEXT[],        -- shared interests array
  flags                TEXT[],        -- e.g. ['high_rif_alignment', 'pacing_mismatch']

  -- Model versioning for A/B testing future iterations
  model_version        TEXT NOT NULL DEFAULT 'gpt-4o-mini-v1',

  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookup per requester (weekly curator queries)
CREATE INDEX IF NOT EXISTS idx_curation_decisions_requester
  ON public.curation_decisions (requester_id, created_at DESC);

-- Index for pair lookup (deduplication check)
CREATE INDEX IF NOT EXISTS idx_curation_decisions_pair
  ON public.curation_decisions (user_a_id, user_b_id, created_at DESC);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.set_curation_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_curation_decisions_updated_at
  BEFORE UPDATE ON public.curation_decisions
  FOR EACH ROW EXECUTE FUNCTION public.set_curation_updated_at();

-- ─────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────
ALTER TABLE public.curation_decisions ENABLE ROW LEVEL SECURITY;

-- Users can see decisions where they are the requester (so they can see why they received matches)
CREATE POLICY "users_can_read_own_curation_decisions"
  ON public.curation_decisions
  FOR SELECT
  USING (requester_id = auth.uid());

-- Service role can do everything (used by weekly-scheduler + ai-match-curator)
CREATE POLICY "service_role_full_access_curation_decisions"
  ON public.curation_decisions
  FOR ALL
  USING (auth.role() = 'service_role');

-- ─────────────────────────────────────────────
-- Also add curation metadata columns to curated_matches if they don't exist
-- These link curated_matches rows back to the full curation decision
-- ─────────────────────────────────────────────
ALTER TABLE public.curated_matches
  ADD COLUMN IF NOT EXISTS curator_confidence   NUMERIC(4,3),
  ADD COLUMN IF NOT EXISTS curator_flags        TEXT[],
  ADD COLUMN IF NOT EXISTS curation_model       TEXT DEFAULT 'gpt-4o-mini-v1',
  ADD COLUMN IF NOT EXISTS week_start           TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS position             SMALLINT;

COMMENT ON TABLE public.curation_decisions IS
  'Stores every AI match curation decision from the ai-match-curator edge function. '
  'Used for audit, debugging, user transparency (''why was I shown this person?''), '
  'and as training signal to improve future curation quality.';
