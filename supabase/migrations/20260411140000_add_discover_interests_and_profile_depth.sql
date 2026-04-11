-- Discover Mode: stores between-Sunday interest expressions
-- These feed into the AI curation model for Sunday picks
CREATE TABLE IF NOT EXISTS discover_interests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skipped BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, target_user_id)
);

ALTER TABLE discover_interests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own discover interests"
  ON discover_interests FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_discover_interests_user_id ON discover_interests (user_id);
CREATE INDEX IF NOT EXISTS idx_discover_interests_target ON discover_interests (target_user_id);
CREATE INDEX IF NOT EXISTS idx_discover_interests_skipped ON discover_interests (skipped) WHERE skipped = false;

-- Progressive Profile: daily question answers that deepen AI match quality
CREATE TABLE IF NOT EXISTS profile_depth_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  question_text TEXT NOT NULL,
  answer_text TEXT NOT NULL,
  field_key TEXT NOT NULL,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, question_id)
);

ALTER TABLE profile_depth_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own profile depth answers"
  ON profile_depth_answers FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_profile_depth_answers_user ON profile_depth_answers (user_id);

COMMENT ON TABLE discover_interests IS
  'Between-Sunday interest expressions from Discover Mode. Used by ai-match-curator to weight Sunday picks.';

COMMENT ON TABLE profile_depth_answers IS
  'Daily progressive profile answers. Each answer is passed as context to the AI curation engine.';
