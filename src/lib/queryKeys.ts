/**
 * Centralized React Query key factory.
 * Every server-state query in the app MUST use keys from here
 * so that cross-component invalidation works reliably.
 */

export const queryKeys = {
  // ── Profile ──────────────────────────────────────────
  profile: {
    all: ['profile'] as const,
    byUser: (userId: string) => ['profile', userId] as const,
  },

  // ── Matching ─────────────────────────────────────────
  curatedMatches: {
    all: ['curated-matches'] as const,
    byWeek: (userId: string, weekStart: string) =>
      ['curated-matches', userId, weekStart] as const,
  },

  datingPool: {
    all: ['dating-pool'] as const,
    byWeek: (userId: string, weekStart: string) =>
      ['dating-pool', userId, weekStart] as const,
  },

  // ── Conversations & Messages ─────────────────────────
  conversations: {
    all: ['conversations'] as const,
    byUser: (userId: string) => ['conversations', userId] as const,
  },

  messages: {
    all: ['messages'] as const,
    byConversation: (conversationId: string) =>
      ['messages', conversationId] as const,
  },

  // ── Safety ───────────────────────────────────────────
  safety: {
    all: ['safety'] as const,
    blockedUsers: (userId: string) => ['safety', 'blocked', userId] as const,
    reports: (userId: string) => ['safety', 'reports', userId] as const,
    settings: (userId: string) => ['safety', 'settings', userId] as const,
  },
} as const;
