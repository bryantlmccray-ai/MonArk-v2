/**
 * types.extended.ts
 *
 * Manual type extensions for tables that exist in Supabase migrations
 * but have not yet been regenerated into types.ts via `supabase gen types`.
 *
 * TODO: Once the Supabase CLI is run (`supabase gen types typescript --linked`),
 * remove this file and use the generated types.ts directly.
 */

// ── discover_interests ────────────────────────────────────────────────────────
// Table created in: 20260411140000_add_discover_interests_and_profile_depth.sql
// Tracks between-Sunday interest expressions from Discover Mode.
// Used by ai-match-curator to weight Sunday picks.

export interface DiscoverInterestRow {
  id: string;
  user_id: string;
  target_user_id: string;
  skipped: boolean;
  created_at: string;
}

export interface DiscoverInterestInsert {
  id?: string;
  user_id: string;
  target_user_id: string;
  skipped?: boolean;
  created_at?: string;
}

export interface DiscoverInterestUpdate {
  id?: string;
  user_id?: string;
  target_user_id?: string;
  skipped?: boolean;
  created_at?: string;
}

// ── profile_depth_answers ─────────────────────────────────────────────────────
// Table created in: 20260411140000_add_discover_interests_and_profile_depth.sql
// Daily progressive profile answers. Each answer is passed as context to the
// AI curation engine for sharper Sunday matches.

export interface ProfileDepthAnswerRow {
  id: string;
  user_id: string;
  question_id: string;
  question_text: string;
  answer_text: string;
  field_key: string;
  answered_at: string;
}

export interface ProfileDepthAnswerInsert {
  id?: string;
  user_id: string;
  question_id: string;
  question_text: string;
  answer_text: string;
  field_key: string;
  answered_at?: string;
}

export interface ProfileDepthAnswerUpdate {
  id?: string;
  user_id?: string;
  question_id?: string;
  question_text?: string;
  answer_text?: string;
  field_key?: string;
  answered_at?: string;
}
