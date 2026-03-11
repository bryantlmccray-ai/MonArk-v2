/**
 * Client-side LLM Firewall — PII Sanitizer
 * 
 * First line of defense: strips PII from data BEFORE it leaves
 * the browser. The server-side sanitizer provides defense-in-depth.
 */

const PHONE_REGEX = /(\+?\d{1,4}[\s.-]?)?(\(?\d{1,4}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{3,4}/g;
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const SSN_REGEX = /\b\d{3}-?\d{2}-?\d{4}\b/g;
const ADDRESS_REGEX = /\b\d{1,5}\s+[\w\s]+(?:street|st|avenue|ave|boulevard|blvd|drive|dr|lane|ln|road|rd|court|ct|way|place|pl|circle|cir)\b/gi;

const PII_PLACEHOLDER = '[REDACTED]';

function scrubText(text: string | null | undefined): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(EMAIL_REGEX, PII_PLACEHOLDER)
    .replace(PHONE_REGEX, (match) => {
      const digits = match.replace(/\D/g, '');
      return digits.length >= 7 ? PII_PLACEHOLDER : match;
    })
    .replace(SSN_REGEX, PII_PLACEHOLDER)
    .replace(ADDRESS_REGEX, '[LOCATION]');
}

/** Strip PII from journal entries before sending to AI */
function sanitizeJournalEntry(entry: Record<string, unknown>): Record<string, unknown> {
  return {
    date_activity: scrubText(entry.date_activity as string),
    rating: entry.rating ?? null,
    would_repeat: entry.would_repeat ?? null,
    tags: Array.isArray(entry.tags) ? entry.tags : [],
    reflection_summary: scrubText(entry.reflection_notes as string),
    insights_summary: scrubText(entry.learned_insights as string),
  };
}

/** Strip PII from RIF profile (scores only, no IDs) */
function sanitizeRifProfile(rif: Record<string, unknown> | null): Record<string, number | null> | null {
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
 * Sanitize the full AI companion context before sending to the edge function.
 */
export function sanitizeCompanionPayload(userContext: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  if (Array.isArray(userContext.interests)) {
    sanitized.interests = userContext.interests;
  }
  if (typeof userContext.averageRating === 'number') {
    sanitized.averageRating = userContext.averageRating;
  }
  if (typeof userContext.totalDates === 'number') {
    sanitized.totalDates = userContext.totalDates;
  }
  if (Array.isArray(userContext.recentDates)) {
    sanitized.recentDates = userContext.recentDates.map((e: unknown) =>
      sanitizeJournalEntry(e as Record<string, unknown>)
    );
  }
  if (userContext.rifProfile) {
    sanitized.rifProfile = sanitizeRifProfile(userContext.rifProfile as Record<string, unknown>);
  }
  if (typeof userContext.userMessage === 'string') {
    sanitized.userMessage = scrubText(userContext.userMessage);
  }
  if (typeof userContext.milestone === 'string') {
    sanitized.milestone = userContext.milestone;
  }

  return sanitized;
}

/**
 * Sanitize date concierge payload before sending to the edge function.
 */
export function sanitizeConciergePayload(data: Record<string, unknown>): Record<string, unknown> {
  return {
    conversationId: data.conversationId,
    matchUserId: data.matchUserId,
    currentUserId: data.currentUserId,
    userInterests: Array.isArray(data.userInterests) ? data.userInterests : [],
    matchInterests: Array.isArray(data.matchInterests) ? data.matchInterests : [],
    userProfile: data.userProfile
      ? { bio: scrubText((data.userProfile as Record<string, unknown>).bio as string) }
      : null,
    matchProfile: data.matchProfile
      ? { bio: scrubText((data.matchProfile as Record<string, unknown>).bio as string) }
      : null,
    recentMessages: Array.isArray(data.recentMessages)
      ? (data.recentMessages as string[]).map((m) => scrubText(m))
      : [],
    userLocation: typeof data.userLocation === 'string'
      ? (data.userLocation as string).split(',')[0]?.trim() || null
      : null,
    async: data.async,
  };
}
