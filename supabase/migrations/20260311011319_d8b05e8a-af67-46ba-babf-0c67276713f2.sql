-- Fix 1: Replace conflicting RESTRICTIVE SELECT policies on profiles table
-- with a single PERMISSIVE policy using OR logic

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view conversation partner profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles of conversation partners" ON public.profiles;

CREATE POLICY "Users can view own or conversation partner profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id
  OR id IN (
    SELECT CASE 
      WHEN ct.user_id = auth.uid() THEN ct.match_user_id
      ELSE ct.user_id
    END
    FROM public.conversation_tracker ct
    WHERE ct.user_id = auth.uid() OR ct.match_user_id = auth.uid()
  )
);

-- Fix 2: Restrict vendor_profiles SELECT to authenticated users only
DROP POLICY IF EXISTS "Anyone can view active vendor profiles" ON public.vendor_profiles;
DROP POLICY IF EXISTS "Public can view active vendors" ON public.vendor_profiles;

CREATE POLICY "Authenticated users can view active vendor profiles"
ON public.vendor_profiles
FOR SELECT
TO authenticated
USING (is_active = true);