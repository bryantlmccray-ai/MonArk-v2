
-- Fix: The "Reported users" policy on base table still exposes reporter_user_id
-- Remove it and use a SECURITY DEFINER function to return masked data instead

-- 1. Remove the leaky policy
DROP POLICY IF EXISTS "Reported users can view reports against them" ON public.user_reports;

-- 2. Drop the view (security_invoker won't work without base table access)
DROP VIEW IF EXISTS public.user_reports_masked;

-- 3. Create a SECURITY DEFINER function that returns only safe columns
CREATE OR REPLACE FUNCTION public.get_reports_against_me()
RETURNS TABLE (
  id uuid,
  report_type text,
  status text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT 
    ur.id,
    ur.report_type,
    ur.status,
    ur.created_at,
    ur.updated_at
  FROM public.user_reports ur
  WHERE ur.reported_user_id = auth.uid();
$$;
