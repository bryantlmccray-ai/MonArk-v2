import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search, SlidersHorizontal, X, ExternalLink, Star } from 'lucide-react';
import { useVenues } from '@/hooks/useVenues';
import type { Venue } from '@/lib/venueMatching';

type VenueType = Venue['venue_type'] | 'all';
type NoiseLevel = Venue['noise_level'] | 'all';

const VENUE_TYPE_LABELS: Record<string, string> = {
  all: 'All Types',
  restaurant: 'Restaurant',
  bar: 'Bar',
  lounge: 'Lounge',
  cafe: 'Café',
  rooftop: 'Rooftop',
  event_space: 'Event Space',
  activity: 'Activity',
  experience: 'Experience',
};

const PRICE_LABELS: Record<number, string> = { 1: '$', 2: '$$', 3: '$$$', 4: '$$$$' };

const NOISE_LABELS: Record<string, string> = {
  all: 'Any Vibe',
  quiet: 'Quiet',
  moderate: 'Moderate',
  loud: 'Lively',
};

const VenueCard: React.FC<{ venue: Venue; index: number }> = ({ venue, index }) => {
  return (
    <motion.div
      key={venue.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      className="bg-card border border-border/60 rounded-xl p-4 flex flex-col gap-2"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-sm font-semibold text-foreground leading-tight truncate">
            {venue.name}
          </h3>
          {venue.partner_group && (
            <p className="text-[10px] font-caption text-primary uppercase tracking-wider mt-0.5">
              {venue.partner_group}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {venue.is_partner && (
            <span className="flex items-center gap-0.5 bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded-full font-medium">
              <Star className="w-2.5 h-2.5" />
              Partner
            </span>
          )}
          <span className="text-[11px] font-medium text-muted-foreground">
            {PRICE_LABELS[venue.price_tier] ?? ''}
          </span>
        </div>
      </div>

      {(venue.city || venue.address) && (
        <div className="flex items-center gap-1 text-muted-foreground">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="text-xs truncate">{venue.city || venue.address}</span>
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
          {VENUE_TYPE_LABELS[venue.venue_type] ?? venue.venue_type}
        </span>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
          {NOISE_LABELS[venue.noise_level] ?? venue.noise_level}
        </span>
      </div>

      {venue.atmosphere_tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {venue.atmosphere_tags.slice(0, 4).map((tag) => (
            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full border border-border/50 text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>
      )}

      {venue.rif_affinity.length > 0 && (
        <p className="text-[10px] text-primary/70 leading-snug">
          Best for: {venue.rif_affinity.join(' · ')}
        </p>
      )}

      {venue.resy_url && (
        <a
          href={venue.resy_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex items-center gap-1 text-[11px] text-primary font-medium hover:underline"
        >
          Reserve on Resy
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </motion.div>
  );
};

export const VenueDirectory: React.FC = () => {
  const { venues, loading } = useVenues();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<VenueType>('all');
  const [noiseFilter, setNoiseFilter] = useState<NoiseLevel>('all');
  const [priceFilter, setPriceFilter] = useState<number | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return venues.filter((v) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        v.name.toLowerCase().includes(q) ||
        (v.city ?? '').toLowerCase().includes(q) ||
        (v.address ?? '').toLowerCase().includes(q) ||
        v.atmosphere_tags.some((t) => t.toLowerCase().includes(q)) ||
        v.cuisine_tags.some((t) => t.toLowerCase().includes(q));
      const matchesType = typeFilter === 'all' || v.venue_type === typeFilter;
      const matchesNoise = noiseFilter === 'all' || v.noise_level === noiseFilter;
      const matchesPrice = priceFilter === 'all' || v.price_tier === priceFilter;
      return matchesSearch && matchesType && matchesNoise && matchesPrice;
    });
  }, [venues, search, typeFilter, noiseFilter, priceFilter]);

  const activeFilterCount = [typeFilter !== 'all', noiseFilter !== 'all', priceFilter !== 'all'].filter(Boolean).length;

  const clearFilters = () => {
    setTypeFilter('all');
    setNoiseFilter('all');
    setPriceFilter('all');
    setSearch('');
  };

  return (
    <motion.div
      key="venues"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="space-y-4"
    >
      <div>
        <p className="text-[10px] font-caption text-muted-foreground/60 uppercase tracking-[0.15em]">The Map</p>
        <h2 className="font-serif text-xl font-semibold text-foreground leading-tight">All Venues</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Every place in the MonArk network, curated for intentional dates.</p>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search venues, neighborhoods..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-muted rounded-lg border border-border/40 focus:outline-none focus:ring-1 focus:ring-primary/40 placeholder:text-muted-foreground/50"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters((p) => !p)}
          className={`relative px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${showFilters || activeFilterCount > 0 ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-muted border-border/40 text-muted-foreground'}`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] flex items-center justify-center font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="bg-muted/50 rounded-xl p-3 space-y-3 border border-border/40">
              <div>
                <p className="text-[10px] font-caption text-muted-foreground uppercase tracking-wider mb-1.5">Type</p>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(VENUE_TYPE_LABELS).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setTypeFilter(key as VenueType)}
                      className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${typeFilter === key ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border/50'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-caption text-muted-foreground uppercase tracking-wider mb-1.5">Vibe</p>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(NOISE_LABELS).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setNoiseFilter(key as NoiseLevel)}
                      className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${noiseFilter === key ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border/50'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-caption text-muted-foreground uppercase tracking-wider mb-1.5">Price</p>
                <div className="flex gap-1.5">
                  {(['all', 1, 2, 3, 4] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPriceFilter(p)}
                      className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${priceFilter === p ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border/50'}`}
                    >
                      {p === 'all' ? 'Any' : PRICE_LABELS[p]}
                    </button>
                  ))}
                </div>
              </div>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1">
                  <X className="w-3 h-3" />
                  Clear all filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!loading && (
        <p className="text-[11px] text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? 'venue' : 'venues'}
          {activeFilterCount > 0 || search ? ' matching your filters' : ' in the network'}
        </p>
      )}

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {!loading && (
        <AnimatePresence mode="popLayout">
          {filtered.length > 0 ? (
            <div className="space-y-3">
              {filtered.map((venue, i) => (
                <VenueCard key={venue.id} venue={venue} index={i} />
              ))}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 text-muted-foreground">
              <MapPin className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No venues match your filters.</p>
              <button onClick={clearFilters} className="mt-2 text-xs text-primary hover:underline">Clear filters</button>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
};

export default VenueDirectory;
