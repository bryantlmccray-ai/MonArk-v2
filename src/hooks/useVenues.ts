import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Venue } from '@/lib/venueMatching';

/**
 * Fetches all active venues from public.venues using the MonArk venue schema.
 * Returns venues typed against the Venue interface from venueMatching.ts.
 *
 * Separate from useVendors (which uses the legacy schema) so the new
 * RIF-affinity columns are always correctly typed and selected.
 *
 * @example
 * const { venues, loading, error } = useVenues();
 */
export function useVenues() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const { data, error: queryError } = await supabase
        .from('venues')
        .select(
          'id, name, partner_group, city, address, lat, lng, venue_type, atmosphere_tags, noise_level, price_tier, cuisine_tags, resy_url, is_partner, is_active, rif_affinity, created_at'
        )
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (cancelled) return;

      if (queryError) {
        console.error('[useVenues] query error:', queryError);
        setError(queryError.message);
        setLoading(false);
        return;
      }

      // Map lat/lng -> latitude/longitude to match the Venue interface
      const mapped: Venue[] = (data ?? []).map((row: any) => ({
        id: row.id,
        name: row.name,
        partner_group: row.partner_group ?? null,
        city: row.city ?? null,
        address: row.address ?? null,
        latitude: row.lat,
        longitude: row.lng,
        venue_type: row.venue_type,
        atmosphere_tags: row.atmosphere_tags ?? [],
        noise_level: row.noise_level,
        price_tier: row.price_tier ?? 2,
        cuisine_tags: row.cuisine_tags ?? [],
        resy_url: row.resy_url ?? null,
        is_partner: row.is_partner ?? false,
        is_active: row.is_active ?? true,
        rif_affinity: row.rif_affinity ?? [],
        created_at: row.created_at,
      }));

      setVenues(mapped);
      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { venues, loading, error };
}
