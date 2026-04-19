import { VenueCard } from './VenueCard';
import type { Venue, RIFScores } from '@/lib/venueMatching';

export interface VenueRecommendationStripProps {
  /**
   * Ranked venue list from useVenueRecommendations (max 3).
   * If empty and not loading, the strip renders nothing.
   */
  venues: Venue[];
  /** True while the edge function is in flight */
  loading: boolean;
  /**
   * 0-1 signal confidence score.
   * Shown as a subtle label when > 0 ("Personalised to your conversation").
   */
  confidence: number;
  /** User's RIF scores, forwarded to VenueCard for pillar alignment display */
  rifScores?: RIFScores;
  /** Optional section heading override */
  heading?: string;
  className?: string;
}

/**
 * Horizontal scroll strip displaying up to 3 personalised venue recommendations.
 *
 * Mounts inside:
 *  - MatchDateSuggestionCard — after useConversationReadiness fires
 *  - AIConciergeModal — as the venue options section
 *
 * UX intent: "Your 3" — not a browse catalog, but a curated moment-specific
 * recommendation surfaced at the right time in the conversation flow.
 */
export function VenueRecommendationStrip({
  venues,
  loading,
  confidence,
  rifScores,
  heading = 'Your 3',
  className = '',
}: VenueRecommendationStripProps) {
  // Don't render if empty and not loading
  if (!loading && venues.length === 0) return null;

  return (
    <section className={'flex flex-col gap-3 ' + className} aria-label="Venue recommendations">
      {/* Header row */}
      <div className="flex items-center justify-between px-1">
        <h4 className="text-sm font-semibold text-foreground">{heading}</h4>
        {confidence > 0 && (
          <span className="text-[10px] text-primary/60 font-medium">
            Personalised to your conversation
          </span>
        )}
      </div>

      {/* Loading skeleton */}
      {loading && venues.length === 0 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-64 h-52 shrink-0 rounded-2xl bg-muted animate-pulse"
              aria-hidden="true"
            />
          ))}
        </div>
      )}

      {/* Venue cards */}
      {venues.length > 0 && (
        <div
          className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
          role="list"
          aria-label={heading + ' venue recommendations'}
        >
          {venues.map((venue) => (
            <div key={venue.id} role="listitem">
              <VenueCard venue={venue} rifScores={rifScores} />
            </div>
          ))}
        </div>
      )}

      {/* Upgrading indicator - shown while edge function resolves after base results are displayed */}
      {loading && venues.length > 0 && (
        <p className="text-[10px] text-muted-foreground/50 text-center animate-pulse">
          Personalising to your conversation...
        </p>
      )}
    </section>
  );
}
