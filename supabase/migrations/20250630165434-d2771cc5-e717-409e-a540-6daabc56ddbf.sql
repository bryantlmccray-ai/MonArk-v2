
-- Add date of birth column to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN date_of_birth DATE,
ADD COLUMN age_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN age_verification_timestamp TIMESTAMP WITH TIME ZONE;

-- Create a function to calculate age from date of birth
CREATE OR REPLACE FUNCTION calculate_age(birth_date DATE) 
RETURNS INTEGER AS $$
BEGIN
  RETURN EXTRACT(YEAR FROM AGE(birth_date));
END;
$$ LANGUAGE plpgsql;

-- Create a function to verify age is 18 or older
CREATE OR REPLACE FUNCTION verify_age_18_plus(birth_date DATE) 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN calculate_age(birth_date) >= 18;
END;
$$ LANGUAGE plpgsql;

-- Update the user_profiles table to automatically calculate and verify age
CREATE OR REPLACE FUNCTION update_age_verification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.date_of_birth IS NOT NULL THEN
    NEW.age = calculate_age(NEW.date_of_birth);
    NEW.age_verified = verify_age_18_plus(NEW.date_of_birth);
    NEW.age_verification_timestamp = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update age verification when DOB is set
CREATE TRIGGER trigger_update_age_verification
  BEFORE INSERT OR UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_age_verification();

-- Add index for age verification queries
CREATE INDEX idx_user_profiles_age_verified ON public.user_profiles (age_verified);
