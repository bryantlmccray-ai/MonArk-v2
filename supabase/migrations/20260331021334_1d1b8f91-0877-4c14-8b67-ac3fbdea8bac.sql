
-- Fix 1: Restrict investor_email_log to admin-only
DROP POLICY IF EXISTS "authenticated_read" ON public.investor_email_log;
CREATE POLICY "Only admins can view investor log"
  ON public.investor_email_log FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Fix 2: Check if venue_reply_log exists and restrict it
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='venue_reply_log') THEN
    EXECUTE 'DROP POLICY IF EXISTS "authenticated_read" ON public.venue_reply_log';
    EXECUTE 'CREATE POLICY "Only admins can view venue reply log" ON public.venue_reply_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(), ''admin''::app_role))';
  END IF;
END $$;

-- Fix 3: Restrict digest_log to admin-only
DROP POLICY IF EXISTS "authenticated_read" ON public.digest_log;
CREATE POLICY "Only admins can view digest log"
  ON public.digest_log FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Fix 4: Make profile-photos bucket private
UPDATE storage.buckets SET public = false WHERE id = 'profile-photos';

-- Fix 5: Drop overly permissive storage policy and replace with authenticated-only
DROP POLICY IF EXISTS "Users can view all photos" ON storage.objects;
CREATE POLICY "Authenticated users can view photos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'profile-photos');
