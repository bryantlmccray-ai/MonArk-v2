/**
 * MonArk Venue Intelligence - RIF-to-Venue Matching
 *
 * Provides deterministic scoring functions that rank venues by alignment
 * with a user's RIF (Relationship Intelligence Framework) scores and any
 * conversation-derived preference signals.
 *
 * REQUIRED ENV for the edge function companion:
 *   ANTHROPIC_API_KEY - set in Supabase Dashboard -> Edge Functions -> Secrets
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Five-pillar RIF score object. Each pillar is a 0-100 integer.
 */
export interface RIFScores {
  /** Capacity for emotional attunement and vulnerability */
  emotional_intelligence: number;
  /** Clarity and style of expression */
  communication_style: number;
  /** Day-to-day preferences, energy, and social appetite */
  lifestyle_alignment: number;
  /** Openness to pursuing a committed relationship */
  relationship_readiness: number;
  /** Orientation toward personal development and shared growth */
  growth_orientation: number;
}

/**
 * A venue record as returned from Supabase public.venues.
 * Mirrors the columns added by the 20260419_venues_table.sql migration.
 */
export interface Venue {
  id: string;
  name: string;
  partner_group: string | null;
  /** Maps to the city column - plain-text neighborhood / area label */
  city: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  venue_type:
    | 'restaurant'
    | 'bar'
    | 'lounge'
    | 'cafe'
    | 'rooftop'
    | 'event_space'
    | 'activity'
    | 'experience';
  /** Array of atmosphere descriptors e.g. ['intimate', 'romantic'] */
  atmosphere_tags: string[];
  noise_level: 'quiet' | 'moderate' | 'loud';
  /** 1-4 scale: 1 = casual/budget, 4 = luxury */
  price_tier: number;
  cuisine_tags: string[];
  resy_url: string | null;
  is_partner: boolean;
  is_active: boolean;
  /** RIF pillar names this venue most strongly serves */
  rif_affinity: string[];
  created_at: string;
}

/**
 * Conversation-derived preference signals returned by the
 * analyze-conversation-signals edge function.
 */
export interface ConversationSignals {
  /** Partial neighborhood name the users mentioned (case-insensitive match) */
  neighborhood_preference: string | null;
  cuisine_preferences: string[];
  /** 'quiet' | 'lively' - extracted from conversation tone/content */
  atmosphere_preferences: string[];
  /** 'budget' | 'moderate' | 'upscale' | 'luxury' */
  price_sensitivity: string | null;
  /** Venue names explicitly mentioned by either party */
  mentioned_venues: string[];
}

// ---------------------------------------------------------------------------
// Internal: Base RIF scoring
// ---------------------------------------------------------------------------

/**
 * Score a single venue against a user's RIF scores.
 *
 * Rules:
 *  1. +25 per rif_affinity pillar matching a top-scoring pillar (score > 65)
 *  2. +15 if noise_level is 'quiet' and emotional_intelligence > 70
 *  3. +15 if atmosphere_tags includes 'intimate' and relationship_readiness > 70
 *  4. +15 if atmosphere_tags includes 'lively' and lifestyle_alignment > 70
 *  5. +10 if price_tier >= 3 and growth_orientation > 65
 *  6. Returns 0 for inactive venues (is_active = false)
 */
function scoreVenueForRIF(venue: Venue, rif: RIFScores): number {
  if (!venue.is_active) return 0;

  let score = 0;

  const topPillars = (Object.keys(rif) as (keyof RIFScores)[]).filter(
    (k) => rif[k] > 65
  );

  for (const pillar of venue.rif_affinity) {
    if (topPillars.includes(pillar as keyof RIFScores)) score += 25;
  }

  if (venue.noise_level === 'quiet' && rif.emotional_intelligence > 70) score += 15;
  if (venue.atmosphere_tags.includes('intimate') && rif.relationship_readiness > 70) score += 15;
  if (venue.atmosphere_tags.includes('lively') && rif.lifestyle_alignment > 70) score += 15;
  if (venue.price_tier >= 3 && rif.growth_orientation > 65) score += 10;

  return score;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns venues ranked by RIF alignment, filtered to active venues only.
 *
 * @param rifScores - the user's 5-pillar RIF scores (0-100 each)
 * @param venues    - full venue list fetched from Supabase
 * @param limit     - max venues to return (default 3 - the "Your 3" UX concept)
 */
export function getVenueRecommendations(
  rifScores: RIFScores,
  venues: Venue[],
  limit: number = 3
): Venue[] {
  return venues
    .filter((v) => v.is_active)
    .map((v) => ({ venue: v, score: scoreVenueForRIF(v, rifScores) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.venue);
}

// ---------------------------------------------------------------------------
// Internal: Signal-boosted scoring
// ---------------------------------------------------------------------------

/**
 * Score a single venue using both RIF scores and conversation signals.
 * Signal boosts are multiplied by confidence before being added,
 * so low-confidence extractions have proportionally less impact.
 */
function scoreVenueWithSignals(
  venue: Venue,
  rif: RIFScores,
  signals: ConversationSignals,
  confidence: number
): number {
  if (!venue.is_active) return 0;

  const base = scoreVenueForRIF(venue, rif);
  let signalBoost = 0;

  // Neighborhood match
  if (signals.neighborhood_preference) {
    const pref = signals.neighborhood_preference.toLowerCase();
    const city = (venue.city ?? '').toLowerCase();
    if (city.includes(pref) || pref.includes(city)) signalBoost += 30;
  }

  // Cuisine overlap (max +40)
  let cuisineBoost = 0;
  for (const pref of signals.cuisine_preferences) {
    const prefLower = pref.toLowerCase();
    for (const tag of venue.cuisine_tags) {
      if (tag.toLowerCase().includes(prefLower) || prefLower.includes(tag.toLowerCase())) {
        cuisineBoost += 20;
      }
    }
  }
  signalBoost += Math.min(cuisineBoost, 40);

  // Atmosphere match
  for (const pref of signals.atmosphere_preferences) {
    if (pref === 'quiet' && venue.noise_level === 'quiet') signalBoost += 20;
    if (pref === 'lively' && venue.atmosphere_tags.includes('lively')) signalBoost += 20;
  }

  // Price sensitivity
  if (signals.price_sensitivity === 'budget' && venue.price_tier <= 2) signalBoost += 20;
  if (
    (signals.price_sensitivity === 'luxury' || signals.price_sensitivity === 'upscale') &&
    venue.price_tier >= 3
  ) signalBoost += 20;

  // Explicitly mentioned venue (strongest signal)
  for (const mentioned of signals.mentioned_venues) {
    if (venue.name.toLowerCase().includes(mentioned.toLowerCase())) signalBoost += 50;
  }

  return base + signalBoost * confidence;
}

/**
 * Returns venues ranked by combined RIF + conversation-signal score.
 * Degrades gracefully to pure RIF scoring when confidence is 0 or signals are empty.
 *
 * @param rifScores  - the user's 5-pillar RIF scores
 * @param signals    - ConversationSignals from the analyze-conversation-signals edge function
 * @param confidence - 0-1 float alongside signals (0 = no signal boost applied)
 * @param venues     - full venue list fetched from Supabase
 * @param limit      - max venues to return (default 3)
 */
export function getVenueRecommendationsWithSignals(
  rifScores: RIFScores,
  signals: ConversationSignals,
  confidence: number,
  venues: Venue[],
  limit: number = 3
): Venue[] {
  return venues
    .filter((v) => v.is_active)
    .map((v) => ({
      venue: v,
      score: scoreVenueWithSignals(v, rifScores, signals, confidence),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.venue);
}
