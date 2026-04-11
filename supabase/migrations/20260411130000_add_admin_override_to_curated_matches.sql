-- Add admin override columns to curated_matches
-- Allows the AI Decision Review panel (AdminMatchCuration.tsx) to log
-- admin approvals, rejections, and flags on AI-generated picks.

ALTER TABLE curated_matches
  ADD COLUMN IF NOT EXISTS admin_override TEXT,
  ADD COLUMN IF NOT EXISTS admin_flag TEXT;

-- Index for fast filtering of overridden picks in the admin panel
CREATE INDEX IF NOT EXISTS idx_curated_matches_admin_override
  ON curated_matches (admin_override)
  WHERE admin_override IS NOT NULL;

COMMENT ON COLUMN curated_matches.admin_override IS
  'Admin action on this AI pick: approve | reject | flag | NULL (untouched)';

COMMENT ON COLUMN curated_matches.admin_flag IS
  'Free-text admin note explaining the override decision';
