-- Ensure the age verification trigger exists
DROP TRIGGER IF EXISTS update_user_profile_age_verification ON public.user_profiles;

CREATE TRIGGER update_user_profile_age_verification
  BEFORE INSERT OR UPDATE OF date_of_birth ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_age_verification();

-- Update existing profiles with incorrect or missing age calculations
UPDATE public.user_profiles 
SET age = public.calculate_age(date_of_birth),
    age_verified = public.verify_age_18_plus(date_of_birth),
    age_verification_timestamp = NOW()
WHERE date_of_birth IS NOT NULL 
AND (age IS NULL OR age != EXTRACT(YEAR FROM AGE(date_of_birth)));