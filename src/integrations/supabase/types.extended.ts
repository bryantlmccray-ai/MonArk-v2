/**
 * types.extended.ts
 *
 * Manual type extensions for tables that exist in Supabase migrations
 * but have not yet been regenerated into types.ts via `supabase gen types`.
 *
 * FIX 5: Added user_weekly_rhythm, UserProfileGeo, and GetCandidatesWithinRadiusRow
 * types so every caller has full TypeScript coverage without (as any) casts.
 *
 * TODO: Once the Supabase CLI is run (`supabase gen types typescript --linked`),
 * consolidate this file into the generated types.ts directly.
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

// ── user_weekly_rhythm ────────────────────────────────────────────────────────
// FIX 5: Table created in: 20260422_add_weekly_rhythm.sql
// Stores the weekly mood (reset | spark | stretch) users select each week.
// Rhythm data lives HERE — NOT on user_profiles. This is the authoritative source.
export type WeeklyRhythmValue = 'reset' | 'spark' | 'stretch';

export interface UserWeeklyRhythmRow {
  id: string;
  user_id: string;
  /** ISO date string of the Sunday that starts this rhythm week (YYYY-MM-DD) */
  week_start: string;
  rhythm: WeeklyRhythmValue;
  created_at: string;
}

export interface UserWeeklyRhythmInsert {
  id?: string;
  user_id: string;
  week_start: string;
  rhythm: WeeklyRhythmValue;
  created_at?: string;
}

export interface UserWeeklyRhythmUpdate {
  id?: string;
  user_id?: string;
  week_start?: string;
  rhythm?: WeeklyRhythmValue;
  created_at?: string;
}

// ── PostGIS geo columns on user_profiles ─────────────────────────────────────
// FIX 5: Added in: 20260425_add_postgis_geo_columns.sql
// These columns are added via migration and will appear in user_profiles rows
// returned from Supabase when explicitly selected.
export interface UserProfileGeo {
  /** Latitude in decimal degrees. Null when user hasn't granted location. */
  geo_lat: number | null;
  /** Longitude in decimal degrees. Null when user hasn't granted location. */
  geo_lng: number | null;
  /**
   * User-controlled match radius in km. Defaults to 50.
   * Used in get_candidates_within_radius() RPC calls.
   */
  search_radius_km: number;
}

// ── get_candidates_within_radius RPC return type ──────────────────────────────
// FIX 5: RPC created in: 20260425_add_postgis_geo_columns.sql
// Return row from the PostGIS radius query.
export interface GetCandidatesWithinRadiusRow {
  user_id: string;
  distance_km: number;
}
