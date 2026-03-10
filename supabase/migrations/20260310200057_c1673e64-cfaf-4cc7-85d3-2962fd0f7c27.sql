-- 1. Drop the overly-permissive RLS policy that exposes PII to match/pool members
DROP POLICY IF EXISTS "Matched users can view profiles via view" ON public.user_profiles;

-- 2. Fix has_role function: add SET search_path TO '' to prevent search_path injection
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;