-- ============================================================
-- Migration: add weekly rhythm support
-- 1. Creates user_weekly_rhythm table (one row per user per week)
-- 2. Adds weekly_rhythm column to curated_matches for signal storage
-- ============================================================

-- Step 1: user_weekly_rhythm table
CREATE TABLE IF NOT EXISTS public.user_weekly_rhythm (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    week_start    date NOT NULL,
    rhythm        text NOT NULL CHECK (rhythm IN ('reset', 'spark', 'stretch')),
    selected_at   timestamptz NOT NULL DEFAULT now(),
    created_at    timestamptz NOT NULL DEFAULT now(),
    UNIQUE (user_id, week_start)
  );

-- RLS
ALTER TABLE public.user_weekly_rhythm ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_rhythm"
  ON public.user_weekly_rhythm
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index for weekly lookups
CREATE INDEX IF NOT EXISTS idx_user_weekly_rhythm_user_week
  ON public.user_weekly_rhythm (user_id, week_start);

-- Step 2: Add weekly_rhythm column to curated_matches (nullable — backfill-safe)
ALTER TABLE public.curated_matches
  ADD COLUMN IF NOT EXISTS weekly_rhythm text
    CHECK (weekly_rhythm IN ('reset', 'spark', 'stretch'));

-- Index so the match-curator can efficiently filter by rhythm
CREATE INDEX IF NOT EXISTS idx_curated_matches_rhythm
  ON public.curated_matches (weekly_rhythm);
