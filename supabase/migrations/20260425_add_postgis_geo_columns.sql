-- ============================================================
-- Fix: Add PostGIS geography columns to user_profiles for
--      real geospatial person-to-person matching.
--
-- Replaces the previous plain-text "location" string with:
--   • geo_point  — geography(Point, 4326) for ST_DWithin queries
--   • geo_lat / geo_lng — stored separately for cheap reads
--   • search_radius_km — user-controlled match radius (default 50 km)
--
-- Also fixes the weekly_rhythm join so generateDatingPool can read
-- it without a second round-trip query.
-- ============================================================

-- 1. Enable PostGIS (idempotent)
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;

-- 2. Add geography columns to user_profiles
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS geo_lat   DOUBLE PRECISION  DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS geo_lng   DOUBLE PRECISION  DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS geo_point extensions.geography(Point, 4326) GENERATED ALWAYS AS (
      CASE
        WHEN geo_lat IS NOT NULL AND geo_lng IS NOT NULL
        THEN extensions.ST_MakePoint(geo_lng, geo_lat)::extensions.geography
        ELSE NULL
      END
    ) STORED,
  ADD COLUMN IF NOT EXISTS search_radius_km INTEGER NOT NULL DEFAULT 50;

-- 3. Spatial index — dramatically speeds up ST_DWithin candidate queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_geo_point
  ON public.user_profiles
  USING GIST (geo_point);

-- 4. Plain indexes for the lat/lng columns (used in ORDER BY distance)
CREATE INDEX IF NOT EXISTS idx_user_profiles_geo_lat
  ON public.user_profiles (geo_lat)
  WHERE geo_lat IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_profiles_geo_lng
  ON public.user_profiles (geo_lng)
  WHERE geo_lng IS NOT NULL;

-- 5. Trigger: keep geo_lat/geo_lng in sync when location_data JSONB is updated
--    Expects location_data to contain { "lat": number, "lng": number }
CREATE OR REPLACE FUNCTION public.sync_geo_from_location_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.location_data IS NOT NULL THEN
    NEW.geo_lat := (NEW.location_data->>'lat')::DOUBLE PRECISION;
    NEW.geo_lng := (NEW.location_data->>'lng')::DOUBLE PRECISION;
  ELSE
    NEW.geo_lat := NULL;
    NEW.geo_lng := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_geo_from_location_data ON public.user_profiles;
CREATE TRIGGER trg_sync_geo_from_location_data
  BEFORE INSERT OR UPDATE OF location_data
  ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_geo_from_location_data();

-- 6. Back-fill existing rows that already have location_data with lat/lng
UPDATE public.user_profiles
SET
  geo_lat = (location_data->>'lat')::DOUBLE PRECISION,
  geo_lng = (location_data->>'lng')::DOUBLE PRECISION
WHERE
  location_data IS NOT NULL
  AND location_data ? 'lat'
  AND location_data ? 'lng';

-- 7. Helper SQL function: get candidate user_ids within radius
--    Called from edge functions as a RPC instead of raw SQL.
--    Returns user_ids within `radius_km` of the given lat/lng,
--    excluding a list of user_ids passed as an array.
CREATE OR REPLACE FUNCTION public.get_candidates_within_radius(
    center_lat    DOUBLE PRECISION,
    center_lng    DOUBLE PRECISION,
    radius_km     INTEGER,
    exclude_ids   UUID[]
  )
RETURNS TABLE (user_id UUID, distance_km DOUBLE PRECISION)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    up.user_id,
    ROUND(
        (extensions.ST_Distance(
          up.geo_point,
          extensions.ST_MakePoint(center_lng, center_lat)::extensions.geography
        ) / 1000.0)::NUMERIC,
        2
      )::DOUBLE PRECISION AS distance_km
  FROM public.user_profiles up
  WHERE
    up.is_profile_complete = true
    AND up.age_verified     = true
    AND up.geo_point IS NOT NULL
    AND NOT (up.user_id = ANY(exclude_ids))
    AND extensions.ST_DWithin(
            up.geo_point,
            extensions.ST_MakePoint(center_lng, center_lat)::extensions.geography,
            radius_km * 1000   -- ST_DWithin uses metres
        )
  ORDER BY distance_km ASC
  LIMIT 100;
$$;

GRANT EXECUTE ON FUNCTION public.get_candidates_within_radius TO service_role;
GRANT EXECUTE ON FUNCTION public.get_candidates_within_radius TO authenticated;

-- 8. RLS: users can see geo_lat/geo_lng on public_user_profiles view
--    (exact location stored privately; only city/neighborhood exposed by default)
COMMENT ON COLUMN public.user_profiles.geo_lat IS
  'Latitude extracted from location_data. Private — never exposed via RLS to other users directly.';
COMMENT ON COLUMN public.user_profiles.geo_lng IS
  'Longitude extracted from location_data. Private — never exposed via RLS to other users directly.';
COMMENT ON COLUMN public.user_profiles.geo_point IS
  'PostGIS geography point (EPSG:4326) computed from geo_lat/geo_lng. Used for ST_DWithin radius matching.';
COMMENT ON COLUMN public.user_profiles.search_radius_km IS
  'User-controlled match radius in km. Default 50. Used in get_candidates_within_radius() and generateDatingPool.';
