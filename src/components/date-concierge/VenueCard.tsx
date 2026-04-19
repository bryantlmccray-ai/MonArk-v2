import type { Venue } from '@/lib/venueMatching';
import type { RIFScores } from '@/lib/venueMatching';

/** Map noise_level to a human-readable icon + label */
const NOISE_LABEL: Record<Venue['noise_level'], string> = {
  quiet: 'Intimate',
  moderate: 'Conversational',
  loud: 'Energetic',
};

/** Render 1-4 filled/empty dots for price_tier */
function PriceDots({ tier }: { tier: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={'Price tier ' + tier + ' of 4'}>
      {[1, 2, 3, 4].map((n) => (
        <span
          key={n}
          className={
            n <= tier
              ? 'w-1.5 h-1.5 rounded-full bg-foreground'
              : 'w-1.5 h-1.5 rounded-full bg-muted-foreground/30'
          }
        />
      ))}
    </span>
  );
}

/** Determine which RIF pillars the venue aligns with, given user scores */
function getAlignedPillars(venue: Venue, rifScores?: RIFScores): string[] {
  if (!rifScores) return venue.rif_affinity.slice(0, 2);
  return venue.rif_affinity.filter((pillar) => {
    const score = rifScores[pillar as keyof RIFScores];
    return typeof score === 'number' && score > 65;
  });
}

/** Human-friendly pillar label */
const PILLAR_LABEL: Record<string, string> = {
  emotional_intelligence: 'Emotional Intelligence',
  communication_style: 'Communication Style',
  lifestyle_alignment: 'Lifestyle Alignment',
  relationship_readiness: 'Relationship Readiness',
  growth_orientation: 'Growth Orientation',
};

export interface VenueCardProps {
  venue: Venue;
  /** User's RIF scores - used to highlight aligned pillars (optional) */
  rifScores?: RIFScores;
  className?: string;
}

/**
 * Atomic venue display card for MonArk's "Your 3" venue strip.
 *
 * Shows:
 *  - Venue name + partner group badge
 *  - Price tier dots + noise level label
 *  - Atmosphere tag pills
 *  - Top 2 cuisine tags
 *  - Contextual CTA: Reserve / Contact to Book / Book this
 *  - RIF alignment indicator (matched pillars from user's scores)
 *
 * CTA logic:
 *  - venue_type === 'experience' or resy_url is null -> "Contact to Book" (tel/email or mailto)
 *  - venue_type === 'activity' -> "Book this" (opens resy_url or venue website)
 *  - otherwise -> "Reserve" (opens resy_url in new tab)
 */
export function VenueCard({ venue, rifScores, className = '' }: VenueCardProps) {
  const alignedPillars = getAlignedPillars(venue, rifScores);
  const topCuisineTags = venue.cuisine_tags.slice(0, 2);
  const isExperience = venue.venue_type === 'experience';
  const isActivity = venue.venue_type === 'activity';
  const hasReservationLink = Boolean(venue.resy_url);

  function handleCTA() {
    if (isExperience || !hasReservationLink) {
      // Contact to Book - no direct reservation link
      return;
    }
    window.open(venue.resy_url!, '_blank', 'noopener,noreferrer');
  }

  const ctaLabel = isExperience || !hasReservationLink
    ? 'Contact to Book'
    : isActivity
    ? 'Book this'
    : 'Reserve';

  const ctaDisabled = isExperience || !hasReservationLink;

  return (
    <article
      className={'flex flex-col gap-3 rounded-2xl bg-card border border-border p-4 w-64 shrink-0 ' + className}
      aria-label={venue.name}
    >
      {/* Header */}
      <div className="flex flex-col gap-0.5">
        <h3 className="text-sm font-semibold leading-tight text-card-foreground line-clamp-1">
          {venue.name}
        </h3>
        {venue.partner_group && (
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
            {venue.partner_group}
          </span>
        )}
      </div>

      {/* Price + Noise */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <PriceDots tier={venue.price_tier} />
        <span className="text-muted-foreground/40">·</span>
        <span>{NOISE_LABEL[venue.noise_level]}</span>
      </div>

      {/* Atmosphere pills */}
      {venue.atmosphere_tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {venue.atmosphere_tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-full bg-muted text-[10px] font-medium text-muted-foreground capitalize"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Cuisine tags */}
      {topCuisineTags.length > 0 && (
        <p className="text-xs text-muted-foreground truncate">
          {topCuisineTags.join(' · ')}
        </p>
      )}

      {/* RIF alignment indicator */}
      {alignedPillars.length > 0 && (
        <p className="text-[10px] text-primary/70 leading-snug">
          Matches your{' '}
          <span className="font-medium text-primary">
            {alignedPillars
              .map((p) => PILLAR_LABEL[p] ?? p)
              .join(' & ')}
          </span>{' '}
          profile
        </p>
      )}

      {/* CTA */}
      <button
        onClick={handleCTA}
        disabled={ctaDisabled}
        className={
          'mt-auto w-full rounded-xl py-2 px-3 text-xs font-semibold transition-colors ' +
          (ctaDisabled
            ? 'bg-muted text-muted-foreground cursor-default'
            : 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95')
        }
        aria-label={ctaLabel + ' ' + venue.name}
      >
        {ctaLabel}
      </button>
    </article>
  );
}
