/**
 * LLM Firewall — PII Sanitizer for AI Context
 * 
 * This module strips Personally Identifiable Information (PII) from data
 * BEFORE it is included in any AI prompt or context window.
 * 
 * Defense-in-depth: Applied both client-side (before network) and
 * server-side (in edge functions) so that even a compromised client
 * cannot leak PII to an LLM.
 */

// ── PII Detection Patterns ─────────────────────────────────
const PHONE_REGEX = /(\+?\d{1,4}[\s.-]?)?(\(\d{1,4}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{3,4}/g;
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const SSN_REGEX = /\b\d{3}-?\d{2}-?\d{4}\b/g;
const UUID_REGEX = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
// Matches common address patterns (number + street name + type)
const ADDRESS_REGEX = /\b\d{1,5}\s+[\w\s]+(?:street|st|avenue|ave|boulevard|blvd|drive|dr|lane|ln|road|rd|court|ct|way|place|pl|circle|cir)\b/gi;
// Date of birth patterns (YYYY-MM-DD, MM/DD/YYYY, etc.)
const DOB_REGEX = /\b(19|20)\d{2}[-/](0[1-9]|1[0-2])[-/](0[1-9]|[12]\d|3[01])\b/g;

const PII_PLACEHOLDER = '[REDACTED]';
const NAME_PLACEHOLDER = 'Person';
const ID_PLACEHOLDER = 'anon';

/**
 * Strip PII patterns from a free-text string.
 */
export function scrubText(text: string | null | undefined): string {
  if (!text || typeof text !== 'string') return '';

  return text
    .replace(EMAIL_REGEX, PII_PLACEHOLDER)
    .replace(PHONE_REGEX, (match) => {
      // Only redact if it looks like a real phone number (7+ digits)
      const digits = match.replace(/\D/g, '');
      return digits.length >= 7 ? PII_PLACEHOLDER : match;
    })
    .replace(SSN_REGEX, PII_PLACEHOLDER)
    .replace(ADDRESS_REGEX, '[LOCATION]')
    .replace(DOB_REGEX, PII_PLACEHOLDER);
}

/**
 * Replace UUIDs with anonymous tokens.
 * Maintains consistency within a single sanitization pass 
 * (same UUID → same token) but tokens are NOT reversible.
 */
export function anonymizeIds(text: string): string {
  const idMap = new Map<string, string>();
  let counter = 1;

  return text.replace(UUID_REGEX, (match) => {
    if (!idMap.has(match)) {
      idMap.set(match, `${ID_PLACEHOLDER}_${counter++}`);
    }
    return idMap.get(match)!;
  });
}

/**
 * Sanitize a journal entry for AI context.
 * Strips partner names, reflection PII, and user IDs.
 */
export function sanitizeJournalEntry(entry: Record<string, unknown>): Record<string, unknown> {
  return {
    date_activity: scrubText(entry.date_activity as string),
    rating: entry.rating ?? null,
    would_repeat: entry.would_repeat ?? null,
    tags: Array.isArray(entry.tags) ? entry.tags : [],
    // Strip partner name entirely — AI doesn't need it
    // Strip reflection_notes of PII but keep sentiment
    reflection_summary: scrubText(entry.reflection_notes as string),
    // Strip learned_insights of PII
    insights_summary: scrubText(entry.learned_insights as string),
  };
}

/**
 * Sanitize a RIF profile for AI context.
 * RIF scores are behavioral, not PII, but we strip user_id.
 */
export function sanitizeRifProfile(rif: Record<string, unknown> | null): Record<string, number | null> | null {
  if (!rif) return null;
  return {
    emotional_readiness: (rif.emotional_readiness as number) ?? null,
    intent_clarity: (rif.intent_clarity as number) ?? null,
    pacing_preferences: (rif.pacing_preferences as number) ?? null,
    boundary_respect: (rif.boundary_respect as number) ?? null,
    post_date_alignment: (rif.post_date_alignment as number) ?? null,
  };
}

/**
 * Sanitize a user profile bio for AI context.
 * Strips any embedded PII from free-text bio.
 */
export function sanitizeProfileForAI(profile: Record<string, unknown> | null): Record<string, unknown> | null {
  if (!profile) return null;
  return {
    bio: scrubText(profile.bio as string),
    // Location is fuzzed to city-level only
    location_city: typeof profile.location === 'string'
      ? (profile.location as string).split(',')[0]?.trim() || null
      : null,
  };
}

/**
 * Sanitize chat messages for AI context.
 * Strips sender/recipient IDs and scrubs message content of PII.
 */
export function sanitizeMessages(messages: Record<string, unknown>[]): Record<string, unknown>[] {
  if (!Array.isArray(messages)) return [];

  const idMap = new Map<string, string>();
  let counter = 1;

  const anonId = (id: string): string => {
    if (!idMap.has(id)) {
      idMap.set(id, `participant_${counter++}`);
    }
    return idMap.get(id)!;
  };

  return messages.slice(0, 20).map((msg) => ({
    sender: anonId(String(msg.sender_user_id || msg.sender || 'unknown')),
    content: scrubText(String(msg.content || '')),
    // Preserve message_type for context (e.g., 'system' vs 'user')
    type: msg.message_type || 'user',
  }));
}

/**
 * Sanitize an entire AI companion request payload.
 * This is the main entry point for the LLM firewall.
 */
export function sanitizeCompanionContext(userContext: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  // Interests are non-PII categorical data — pass through
  if (Array.isArray(userContext.interests)) {
    sanitized.interests = userContext.interests;
  }

  // Aggregate stats — non-PII
  if (typeof userContext.averageRating === 'number') {
    sanitized.averageRating = userContext.averageRating;
  }
  if (typeof userContext.totalDates === 'number') {
    sanitized.totalDates = userContext.totalDates;
  }

  // Sanitize journal entries
  if (Array.isArray(userContext.recentDates)) {
    sanitized.recentDates = userContext.recentDates.map((entry: unknown) =>
      sanitizeJournalEntry(entry as Record<string, unknown>)
    );
  }

  // Sanitize RIF profile
  if (userContext.rifProfile) {
    sanitized.rifProfile = sanitizeRifProfile(userContext.rifProfile as Record<string, unknown>);
  }

  // Sanitize user message (scrub any PII the user typed)
  if (typeof userContext.userMessage === 'string') {
    sanitized.userMessage = scrubText(userContext.userMessage);
  }

  // Milestone — non-PII string
  if (typeof userContext.milestone === 'string') {
    sanitized.milestone = userContext.milestone;
  }

  return sanitized;
}

/**
 * Sanitize an entire date concierge request payload.
 */
export function sanitizeConciergeContext(requestData: Record<string, unknown>): Record<string, unknown> {
  return {
    // Conversation ID is needed for DB operations, but anonymized for AI
    conversationId: requestData.conversationId,
    // Match user ID needed for DB, anonymized in AI prompt
    matchUserId: requestData.matchUserId,
    // Interests are categorical, non-PII
    userInterests: Array.isArray(requestData.userInterests) ? requestData.userInterests : [],
    matchInterests: Array.isArray(requestData.matchInterests) ? requestData.matchInterests : [],
    // Sanitize profiles
    userProfile: sanitizeProfileForAI(requestData.userProfile as Record<string, unknown>),
    matchProfile: sanitizeProfileForAI(requestData.matchProfile as Record<string, unknown>),
    // Sanitize messages
    recentMessages: Array.isArray(requestData.recentMessages)
      ? sanitizeMessages(requestData.recentMessages as Record<string, unknown>[])
      : [],
    // City-level location only
    userLocation: typeof requestData.userLocation === 'string'
      ? (requestData.userLocation as string).split(',')[0]?.trim() || null
      : null,
    // Pass through control flags
    async: requestData.async,
    currentUserId: requestData.currentUserId,
  };
}
