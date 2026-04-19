-- =============================================================
-- MIGRATION: 20260419_venues_seed_partners.sql
-- PURPOSE:   Additive seed — insert 3 new partner venue records.
--            No schema changes. No other files touched.
-- =============================================================

-- venue_type is a text column (no enum), so 'experience' and
-- 'activity' are valid values without any ALTER TYPE needed.

-- ------------------------------------------------------------------
-- VENUE 1: Stillwater Symphony
-- Mobile luxury sound bath & wellness experience.
-- No fixed address — show "Contact to Book" CTA in UI.
-- ------------------------------------------------------------------
INSERT INTO public.venues (
  name,
  partner_group,
  neighborhood,
  address,
  venue_type,
  atmosphere,
  noise_level,
  price_tier,
  cuisine_tags,
  resy_url,
  is_partner,
  is_active,
  rif_affinity
) VALUES (
  'Stillwater Symphony',
  'Stillwater Symphony',
  'Greater Chicago — Mobile',
  NULL,
  'experience',
  ARRAY['intimate', 'romantic', 'upscale'],
  'quiet',
  3,
  ARRAY['Sound Bath', 'Wellness', 'Meditation', 'Live Music'],
  NULL,
  true,
  true,
  ARRAY['emotional_intelligence', 'relationship_readiness', 'growth_orientation']
);

-- ------------------------------------------------------------------
-- VENUE 2: Union Padel Club
-- 5 indoor padel courts, full bar, sauna + cold plunge, social lounges.
-- Chicago's first premium indoor padel club. Fulton Market.
-- ------------------------------------------------------------------
INSERT INTO public.venues (
  name,
  partner_group,
  neighborhood,
  address,
  latitude,
  longitude,
  venue_type,
  atmosphere,
  noise_level,
  price_tier,
  cuisine_tags,
  resy_url,
  is_partner,
  is_active,
  rif_affinity
) VALUES (
  'Union Padel Club',
  'Union Padel Club',
  'Fulton Market',
  '207 N Paulina St, Chicago, IL 60612',
  41.8854,
  -87.6672,
  'activity',
  ARRAY['social', 'lively', 'upscale'],
  'moderate',
  3,
  ARRAY['Padel', 'Sport', 'Bar', 'Social Club', 'Recovery'],
  'https://www.unionpadelclub.com',
  true,
  true,
  ARRAY['lifestyle_alignment', 'communication_style', 'growth_orientation']
);

-- ------------------------------------------------------------------
-- VENUE 3: Rancher Hat Bar
-- Interactive custom hat experience with cocktails. Fulton Market.
-- Opened April 10, 2026. Low-pressure activity venue.
-- ------------------------------------------------------------------
INSERT INTO public.venues (
  name,
  partner_group,
  neighborhood,
  address,
  venue_type,
  atmosphere,
  noise_level,
  price_tier,
  cuisine_tags,
  resy_url,
  is_partner,
  is_active,
  rif_affinity
) VALUES (
  'Rancher Hat Bar',
  'Rancher Hat Bar',
  'Fulton Market',
  'N Sangamon St, Chicago, IL 60607',
  'activity',
  ARRAY['social', 'lively', 'casual'],
  'moderate',
  2,
  ARRAY['Retail Experience', 'Cocktails', 'Custom Hats', 'Western'],
  NULL,
  true,
  true,
  ARRAY['lifestyle_alignment', 'communication_style']
);
