-- Add unique constraints to prevent double-entry race conditions

-- rif_profiles: one active RIF profile per user
ALTER TABLE public.rif_profiles
  ADD CONSTRAINT rif_profiles_user_id_key UNIQUE (user_id);

-- user_rif_state: one state record per user
ALTER TABLE public.user_rif_state
  ADD CONSTRAINT user_rif_state_user_id_key UNIQUE (user_id);

-- behavioral_patterns: one pattern per type per user
ALTER TABLE public.behavioral_patterns
  ADD CONSTRAINT behavioral_patterns_user_pattern_key UNIQUE (user_id, pattern_type);