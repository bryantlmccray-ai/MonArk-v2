-- Create neighborhoods table for detailed geographic data
CREATE TABLE public.neighborhoods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL,
  lat NUMERIC NOT NULL,
  lng NUMERIC NOT NULL,
  bounds JSONB, -- Geographic boundaries as polygon
  population INTEGER,
  transit_score INTEGER, -- 0-100 rating for public transit access
  walkability_score INTEGER, -- 0-100 rating for walkability
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cities table for city-level data
CREATE TABLE public.cities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL,
  lat NUMERIC NOT NULL,
  lng NUMERIC NOT NULL,
  timezone TEXT,
  population INTEGER,
  metro_area TEXT,
  transit_systems JSONB, -- Array of available transit systems
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(name, state, country)
);

-- Create venue types table for activity-based discovery
CREATE TABLE public.venue_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL, -- 'social', 'recreation', 'cultural', 'dining', etc.
  icon TEXT, -- Icon identifier for UI
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create venues table for location-based matching
CREATE TABLE public.venues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  venue_type_id UUID REFERENCES public.venue_types(id),
  neighborhood_id UUID REFERENCES public.neighborhoods(id),
  address TEXT,
  lat NUMERIC NOT NULL,
  lng NUMERIC NOT NULL,
  rating NUMERIC, -- 0-5 star rating
  price_level INTEGER, -- 1-4 price range
  is_lgbtq_friendly BOOLEAN DEFAULT false,
  operating_hours JSONB, -- Weekly schedule
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert some major US cities data
INSERT INTO public.cities (name, state, country, lat, lng, timezone, population, metro_area, transit_systems) VALUES
('New York', 'NY', 'USA', 40.7128, -74.0060, 'America/New_York', 8336817, 'New York-Newark-Jersey City', '["subway", "bus", "commuter_rail", "ferry"]'),
('Los Angeles', 'CA', 'USA', 34.0522, -118.2437, 'America/Los_Angeles', 3979576, 'Los Angeles-Long Beach-Anaheim', '["metro", "bus", "light_rail"]'),
('Chicago', 'IL', 'USA', 41.8781, -87.6298, 'America/Chicago', 2693976, 'Chicago-Naperville-Elgin', '["subway", "bus", "commuter_rail"]'),
('San Francisco', 'CA', 'USA', 37.7749, -122.4194, 'America/Los_Angeles', 881549, 'San Francisco-Oakland-Berkeley', '["subway", "bus", "light_rail", "ferry", "cable_car"]'),
('Seattle', 'WA', 'USA', 47.6062, -122.3321, 'America/Los_Angeles', 753675, 'Seattle-Tacoma-Bellevue', '["bus", "light_rail", "streetcar", "ferry"]'),
('Boston', 'MA', 'USA', 42.3601, -71.0589, 'America/New_York', 695506, 'Boston-Cambridge-Newton', '["subway", "bus", "commuter_rail"]'),
('Austin', 'TX', 'USA', 30.2672, -97.7431, 'America/Chicago', 978908, 'Austin-Round Rock-Georgetown', '["bus", "commuter_rail"]'),
('Denver', 'CO', 'USA', 39.7392, -104.9903, 'America/Denver', 715522, 'Denver-Aurora-Lakewood', '["bus", "light_rail", "commuter_rail"]');

-- Insert NYC neighborhoods as example
INSERT INTO public.neighborhoods (name, city, state, country, lat, lng, transit_score, walkability_score) VALUES
('Manhattan', 'New York', 'NY', 'USA', 40.7831, -73.9712, 100, 95),
('Brooklyn Heights', 'New York', 'NY', 'USA', 40.6958, -73.9935, 90, 85),
('Williamsburg', 'New York', 'NY', 'USA', 40.7081, -73.9571, 85, 80),
('SoHo', 'New York', 'NY', 'USA', 40.7233, -74.0030, 95, 90),
('Greenwich Village', 'New York', 'NY', 'USA', 40.7336, -74.0027, 95, 90),
('East Village', 'New York', 'NY', 'USA', 40.7264, -73.9818, 90, 85),
('Chelsea', 'New York', 'NY', 'USA', 40.7465, -74.0014, 90, 85),
('Tribeca', 'New York', 'NY', 'USA', 40.7195, -74.0090, 85, 80),
('Upper West Side', 'New York', 'NY', 'USA', 40.7870, -73.9754, 90, 85),
('Upper East Side', 'New York', 'NY', 'USA', 40.7736, -73.9566, 85, 80);

-- Insert venue types
INSERT INTO public.venue_types (name, category, icon) VALUES
('Coffee Shop', 'social', 'coffee'),
('Bar', 'social', 'wine'),
('Restaurant', 'dining', 'utensils'),
('Park', 'recreation', 'tree'),
('Gym', 'recreation', 'dumbbell'),
('Museum', 'cultural', 'building'),
('Bookstore', 'cultural', 'book'),
('Yoga Studio', 'recreation', 'lotus'),
('Coworking Space', 'social', 'briefcase'),
('Beach', 'recreation', 'umbrella-beach');

-- Enable RLS on new tables
ALTER TABLE public.neighborhoods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (these are reference data)
CREATE POLICY "Public read access to neighborhoods" 
ON public.neighborhoods FOR SELECT 
USING (true);

CREATE POLICY "Public read access to cities" 
ON public.cities FOR SELECT 
USING (true);

CREATE POLICY "Public read access to venue types" 
ON public.venue_types FOR SELECT 
USING (true);

CREATE POLICY "Public read access to venues" 
ON public.venues FOR SELECT 
USING (true);

-- Create indexes for performance
CREATE INDEX idx_neighborhoods_city ON public.neighborhoods(city, state, country);
CREATE INDEX idx_neighborhoods_location ON public.neighborhoods(lat, lng);
CREATE INDEX idx_venues_location ON public.venues(lat, lng);
CREATE INDEX idx_venues_neighborhood ON public.venues(neighborhood_id);
CREATE INDEX idx_venues_type ON public.venues(venue_type_id);