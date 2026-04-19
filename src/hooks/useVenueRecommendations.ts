import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  getVenueRecommendations,
  getVenueRecommendationsWithSignals,
} from '@/lib/venueMatching';
import type { Venue, RIFScores, ConversationSignals } from '@/lib/venueMatching';

/**
 * Input shape for useVenueRecommendations.
 */
export interface UseVenueRecommendationsInput {
  /** The Supabase conversation ID for the active chat thread */
  conversationId: string;
  /** The current authenticated user's ID */
  userId: string;
  /** The user's five-pillar RIF scores */
  rifScores: RIFScores;
  /** Full active venue list from useVenues() */
  venues: Venue[];
  /** Max venues to return (default 3 - the "Your 3" UX concept) */
  limit?: number;
}

/**
 * Return shape for useVenueRecommendations.
 */
export interface UseVenueRecommendationsResult {
  /** Ranked venue recommendations (3 by default) */
  venues: Venue[];
  /** True while the edge function call is in flight */
  loading: boolean;
  /**
   * 0-1 confidence from the conversation signal extractor.
   * 0 = base RIF scoring only (edge function failed or not yet resolved).
   */
  confidence: number;
}

/**
 * Optimistic venue recommendation hook.
 *
 * On mount:
 *  1. Immediately returns base RIF recommendations so the UI is never empty.
 *  2. Calls the analyze-conversation-signals edge function in the background.
 *  3. When the edge function resolves, upgrades recommendations with signal boosts.
 *
 * On any edge function failure, gracefully falls back to base RIF scoring
 * (confidence stays 0, venue list remains the initial RIF-scored result).
 *
 * @example
 * const { venues, loading, confidence } = useVenueRecommendations({
 *   conversationId,
 *   userId: user.id,
 *   rifScores,
 *   venues: allVenues,
 * });
 */
export function useVenueRecommendations({
  conversationId,
  userId,
  rifScores,
  venues,
  limit = 3,
}: UseVenueRecommendationsInput): UseVenueRecommendationsResult {
  const [recommendations, setRecommendations] = useState<Venue[]>(() =>
    getVenueRecommendations(rifScores, venues, limit)
  );
  const [loading, setLoading] = useState(true);
  const [confidence, setConfidence] = useState(0);

  // Keep a stable reference to avoid re-triggering on every parent render
  const stableInput = useRef({ conversationId, userId, rifScores, venues, limit });
  stableInput.current = { conversationId, userId, rifScores, venues, limit };

  useEffect(() => {
    // Optimistic base result - shown immediately
    setRecommendations(
      getVenueRecommendations(rifScores, venues, limit)
    );
    setLoading(true);
    setConfidence(0);

    let cancelled = false;

    async function fetchSignals() {
      try {
        const { data, error } = await supabase.functions.invoke(
          'analyze-conversation-signals',
          {
            body: {
              conversation_id: conversationId,
              user_id: userId,
              current_rif_scores: rifScores,
            },
          }
        );

        if (cancelled) return;

        if (error || !data) {
          console.warn('[useVenueRecommendations] edge function error, using base scoring:', error);
          setLoading(false);
          return;
        }

        const signals = data.signals as ConversationSignals;
        const signalConfidence = typeof data.confidence === 'number' ? data.confidence : 0;

        setConfidence(signalConfidence);
        setRecommendations(
          getVenueRecommendationsWithSignals(
            stableInput.current.rifScores,
            signals,
            signalConfidence,
            stableInput.current.venues,
            stableInput.current.limit
          )
        );
      } catch (err) {
        if (!cancelled) {
          console.warn('[useVenueRecommendations] unexpected error, using base scoring:', err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchSignals();

    return () => {
      cancelled = true;
    };
  // Re-run when conversation or venues change, but not on every RIF score re-render
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, userId, venues.length]);

  return { venues: recommendations, loading, confidence };
}
