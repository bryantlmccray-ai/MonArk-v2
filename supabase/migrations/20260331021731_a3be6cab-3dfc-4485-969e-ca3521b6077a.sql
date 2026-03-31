
-- Fix security definer views by setting security_invoker = true
-- This ensures views respect the calling user's RLS policies

ALTER VIEW public.admin_flagged_users SET (security_invoker = true);
ALTER VIEW public.public_user_profiles SET (security_invoker = true);
ALTER VIEW public.rif_match_candidates SET (security_invoker = true);
ALTER VIEW public.subscription_overview SET (security_invoker = true);
