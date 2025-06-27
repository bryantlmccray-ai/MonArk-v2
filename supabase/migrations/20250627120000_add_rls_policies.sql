
-- Enable RLS on all tables and add proper policies

-- User Profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RIF Profiles
ALTER TABLE rif_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own RIF profile"
  ON rif_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own RIF profile"
  ON rif_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own RIF profile"
  ON rif_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RIF Settings
ALTER TABLE rif_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own RIF settings"
  ON rif_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own RIF settings"
  ON rif_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own RIF settings"
  ON rif_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RIF Reflections
ALTER TABLE rif_reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reflections"
  ON rif_reflections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reflections"
  ON rif_reflections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RIF Insights
ALTER TABLE rif_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own insights"
  ON rif_insights FOR SELECT
  USING (auth.uid() = user_id);

-- RIF Event Log
ALTER TABLE rif_event_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own events"
  ON rif_event_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own events"
  ON rif_event_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RIF Feedback
ALTER TABLE rif_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own feedback"
  ON rif_feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feedback"
  ON rif_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User RIF State
ALTER TABLE user_rif_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own RIF state"
  ON user_rif_state FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own RIF state"
  ON user_rif_state FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own RIF state"
  ON user_rif_state FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Conversation Events
ALTER TABLE conversation_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversation events"
  ON conversation_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversation events"
  ON conversation_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Date Proposals
ALTER TABLE date_proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view proposals they created or received"
  ON date_proposals FOR SELECT
  USING (auth.uid() = creator_user_id OR auth.uid() = recipient_user_id);

CREATE POLICY "Users can insert their own proposals"
  ON date_proposals FOR INSERT
  WITH CHECK (auth.uid() = creator_user_id);

CREATE POLICY "Users can update proposals they created or received"
  ON date_proposals FOR UPDATE
  USING (auth.uid() = creator_user_id OR auth.uid() = recipient_user_id);

-- Date Journal
ALTER TABLE date_journal ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own journal entries"
  ON date_journal FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own journal entries"
  ON date_journal FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal entries"
  ON date_journal FOR UPDATE
  USING (auth.uid() = user_id);

-- Conversation Tracker
ALTER TABLE conversation_tracker ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view conversations they're part of"
  ON conversation_tracker FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = match_user_id);

CREATE POLICY "Users can insert their own conversation trackers"
  ON conversation_tracker FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update conversations they're part of"
  ON conversation_tracker FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = match_user_id);

-- Nudge Library (public read access)
ALTER TABLE nudge_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active nudge prompts"
  ON nudge_library FOR SELECT
  USING (is_active = true);

-- RIF Prompts (public read access)
ALTER TABLE rif_prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active RIF prompts"
  ON rif_prompts FOR SELECT
  USING (is_active = true);

-- RIF Recommendations
ALTER TABLE rif_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own recommendations"
  ON rif_recommendations FOR SELECT
  USING (auth.uid() = user_id);

-- Conversation Monitor (public read for system functionality)
ALTER TABLE conversation_monitor ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System can access conversation monitor"
  ON conversation_monitor FOR ALL
  USING (true);
