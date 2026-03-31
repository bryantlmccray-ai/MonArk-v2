
-- Add subscription columns to user_profiles (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_profiles' AND column_name='subscription_tier') THEN
    ALTER TABLE public.user_profiles ADD COLUMN subscription_tier text NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'plus', 'monarch'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_profiles' AND column_name='subscription_status') THEN
    ALTER TABLE public.user_profiles ADD COLUMN subscription_status text NOT NULL DEFAULT 'inactive';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_profiles' AND column_name='subscription_expires_at') THEN
    ALTER TABLE public.user_profiles ADD COLUMN subscription_expires_at timestamptz;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_profiles' AND column_name='trial_ends_at') THEN
    ALTER TABLE public.user_profiles ADD COLUMN trial_ends_at timestamptz;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_profiles' AND column_name='revenuecat_customer_id') THEN
    ALTER TABLE public.user_profiles ADD COLUMN revenuecat_customer_id text;
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_tier ON public.user_profiles (subscription_tier);
CREATE INDEX IF NOT EXISTS idx_user_profiles_revenuecat_customer_id ON public.user_profiles (revenuecat_customer_id);

-- Subscription events table
CREATE TABLE IF NOT EXISTS public.subscription_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  tier text NOT NULL,
  previous_tier text,
  product_id text,
  price_usd numeric,
  currency text,
  environment text DEFAULT 'PRODUCTION',
  revenuecat_event_id text,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS on subscription_events: deny all client access (server-only via service_role)
ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='subscription_events' AND policyname='subscription_events_deny_all') THEN
    CREATE POLICY subscription_events_deny_all ON public.subscription_events FOR ALL TO public USING (false);
  END IF;
END $$;
