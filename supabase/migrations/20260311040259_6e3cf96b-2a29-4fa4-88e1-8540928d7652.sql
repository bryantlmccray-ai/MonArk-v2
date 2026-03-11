CREATE OR REPLACE FUNCTION public.check_profile_completion()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  -- Only require at least one photo for profile completion
  -- All other fields are optional
  IF NEW.is_profile_complete IS DISTINCT FROM TRUE THEN
    NEW.is_profile_complete = (
      NEW.photos IS NOT NULL AND 
      array_length(NEW.photos, 1) > 0
    );
  END IF;
  RETURN NEW;
END;
$function$;