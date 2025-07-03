-- Update the check_profile_completion function to make height_cm optional
CREATE OR REPLACE FUNCTION public.check_profile_completion()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.is_profile_complete = (
    NEW.bio IS NOT NULL AND 
    NEW.age IS NOT NULL AND
    NEW.photos IS NOT NULL AND 
    array_length(NEW.photos, 1) > 0 AND
    NEW.interests IS NOT NULL AND 
    array_length(NEW.interests, 1) > 0 AND
    NEW.gender_identity IS NOT NULL AND
    NEW.sexual_orientation IS NOT NULL AND
    NEW.occupation IS NOT NULL AND
    NEW.education_level IS NOT NULL AND
    NEW.relationship_goals IS NOT NULL AND
    array_length(NEW.relationship_goals, 1) > 0 AND
    NEW.exercise_habits IS NOT NULL AND
    NEW.smoking_status IS NOT NULL AND
    NEW.drinking_status IS NOT NULL
    -- Removed height_cm requirement as it's optional
  );
  RETURN NEW;
END;
$function$;