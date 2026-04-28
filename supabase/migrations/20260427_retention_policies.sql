-- ============================================================
-- Migration: 20260427_retention_policies.sql
-- Purpose: Rolling retention windows for high-growth tables
--          + automated pg_cron jobs to enforce them daily.
--
-- Applied manually via Supabase SQL Editor on 2026-04-27.
-- This file is kept in source control as the canonical record.
--
-- Problem:
--   user_sessions:            677 rows / 15 users (~45 sessions/user)
--   weekly_options_engagement: 2,888 rows / 15 users
--   behavior_analytics:        24 rows (grows with every interaction)
--
--   At 10,000 users these become 450k, 1.9M, and 16k+ rows.
--   Without a retention policy they balloon indefinitely,
--   increasing storage cost and query latency.
--
-- Solution:
--   30-day window for session data (stale sessions have no value)
--   90-day window for engagement + analytics (13 Sunday cycles of
--   training signal — enough for the ML compatibility trainer)
-- ============================================================

-- ── Part 1: Indexes (run before deletes for plan efficiency) ──

CREATE INDEX IF NOT EXISTS idx_user_sessions_created_at
  ON public.user_sessions (created_at);

CREATE INDEX IF NOT EXISTS idx_weekly_options_engagement_created_at
  ON public.weekly_options_engagement (created_at);

CREATE INDEX IF NOT EXISTS idx_behavior_analytics_created_at
  ON public.behavior_analytics (created_at);

-- ── Part 2: Initial backfill deletes (already applied) ───────

-- DELETE FROM public.user_sessions
--   WHERE created_at < NOW() - INTERVAL '30 days';
-- Result: 579 rows remaining (98 deleted)

-- DELETE FROM public.weekly_options_engagement
--   WHERE created_at < NOW() - INTERVAL '90 days';
-- Result: 22 rows remaining (2,866 deleted)

-- DELETE FROM public.behavior_analytics
--   WHERE created_at < NOW() - INTERVAL '90 days';
-- Result: 23 rows remaining (1 deleted)

-- ── Part 3: pg_cron automated jobs (already applied) ─────────

-- SELECT cron.schedule(
--   'monark-purge-user-sessions',
--   '0 3 * * *',
--   $$DELETE FROM public.user_sessions WHERE created_at < NOW() - INTERVAL '30 days'$$
-- );

-- SELECT cron.schedule(
--   'monark-purge-weekly-engagement',
--   '5 3 * * *',
--   $$DELETE FROM public.weekly_options_engagement WHERE created_at < NOW() - INTERVAL '90 days'$$
-- );

-- SELECT cron.schedule(
--   'monark-purge-behavior-analytics',
--   '10 3 * * *',
--   $$DELETE FROM public.behavior_analytics WHERE created_at < NOW() - INTERVAL '90 days'$$
-- );

-- ── Part 4: To verify at any time ────────────────────────────

-- SELECT jobname, schedule, command, active
-- FROM cron.job
-- WHERE jobname LIKE 'monark-%'
-- ORDER BY jobname;

-- SELECT 'user_sessions' AS table_name, COUNT(*) AS rows FROM public.user_sessions
-- UNION ALL
-- SELECT 'weekly_options_engagement', COUNT(*) FROM public.weekly_options_engagement
-- UNION ALL
-- SELECT 'behavior_analytics', COUNT(*) FROM public.behavior_analytics;
