-- Create function to find nearest neighborhood
CREATE OR REPLACE FUNCTION public.find_nearest_neighborhood(user_lat NUMERIC, user_lng NUMERIC)
RETURNS TABLE (
  id UUID,
  name TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  lat NUMERIC,
  lng NUMERIC,
  transit_score INTEGER,
  walkability_score INTEGER,
  distance_km NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.name,
    n.city,
    n.state,
    n.country,
    n.lat,
    n.lng,
    n.transit_score,
    n.walkability_score,
    -- Calculate distance using Haversine formula (approximate)
    (6371 * acos(cos(radians(user_lat)) * cos(radians(n.lat)) * cos(radians(n.lng) - radians(user_lng)) + sin(radians(user_lat)) * sin(radians(n.lat)))) AS distance_km
  FROM public.neighborhoods n
  ORDER BY distance_km
  LIMIT 1;
END;
$$;