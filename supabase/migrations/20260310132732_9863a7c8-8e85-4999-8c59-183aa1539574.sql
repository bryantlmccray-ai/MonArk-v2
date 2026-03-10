
-- Expand venues table with richer fields for vendor browsing
ALTER TABLE public.venues
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS photos text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS website_url text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS vibe_tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS category text DEFAULT 'restaurant',
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Create vendor_profiles for service providers (photographers, florists, planners)
CREATE TABLE IF NOT EXISTS public.vendor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'service',
  description text,
  photos text[] DEFAULT '{}',
  website_url text,
  phone text,
  email text,
  price_level integer DEFAULT 2,
  vibe_tags text[] DEFAULT '{}',
  service_area_km integer DEFAULT 25,
  is_lgbtq_friendly boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS: public read, admin write
ALTER TABLE public.vendor_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to vendor profiles"
  ON public.vendor_profiles FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage vendor profiles"
  ON public.vendor_profiles FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Junction table: link vendors/venues to itineraries
CREATE TABLE IF NOT EXISTS public.itinerary_vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id uuid REFERENCES public.itineraries(id) ON DELETE CASCADE NOT NULL,
  venue_id uuid REFERENCES public.venues(id) ON DELETE SET NULL,
  vendor_profile_id uuid REFERENCES public.vendor_profiles(id) ON DELETE SET NULL,
  role text DEFAULT 'primary',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT must_have_venue_or_vendor CHECK (venue_id IS NOT NULL OR vendor_profile_id IS NOT NULL)
);

ALTER TABLE public.itinerary_vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their itinerary vendors"
  ON public.itinerary_vendors FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.itineraries i
      WHERE i.id = itinerary_vendors.itinerary_id
      AND (i.user_id = auth.uid() OR i.counterpart_user_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.itineraries i
      WHERE i.id = itinerary_vendors.itinerary_id
      AND (i.user_id = auth.uid() OR i.counterpart_user_id = auth.uid())
    )
  );

-- Add admin write policy to venues table (currently read-only)
CREATE POLICY "Admins can manage venues"
  ON public.venues FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
