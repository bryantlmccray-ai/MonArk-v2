
-- Add location consent and settings to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN location_data JSONB DEFAULT NULL,
ADD COLUMN location_consent BOOLEAN DEFAULT FALSE,
ADD COLUMN show_location_on_profile BOOLEAN DEFAULT TRUE;

-- Update the trigger to handle location data updates
CREATE OR REPLACE FUNCTION update_user_profile_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS update_user_profiles_timestamp ON public.user_profiles;
CREATE TRIGGER update_user_profiles_timestamp
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profile_timestamp();

-- Add RLS policies for location data (users can only see their own location data)
CREATE POLICY "Users can update their own location data" 
ON public.user_profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
