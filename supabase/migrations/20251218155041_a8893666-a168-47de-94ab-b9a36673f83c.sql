-- Table for curated weekly profile matches ("Your 3")
CREATE TABLE public.curated_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  matched_user_id UUID NOT NULL,
  week_start DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'passed')),
  compatibility_score NUMERIC(3,2),
  match_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, matched_user_id, week_start)
);

-- Enable RLS
ALTER TABLE public.curated_matches ENABLE ROW LEVEL SECURITY;

-- Users can view their own curated matches
CREATE POLICY "Users can view their own curated matches" 
ON public.curated_matches 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can update their own curated matches (accept/pass)
CREATE POLICY "Users can update their own curated matches" 
ON public.curated_matches 
FOR UPDATE 
USING (auth.uid() = user_id);

-- System can insert curated matches (via edge function)
CREATE POLICY "Service role can insert curated matches"
ON public.curated_matches
FOR INSERT
WITH CHECK (true);

-- Index for efficient weekly lookups
CREATE INDEX idx_curated_matches_user_week ON public.curated_matches(user_id, week_start);
CREATE INDEX idx_curated_matches_status ON public.curated_matches(status);

-- Function to check if match is mutual (both accepted each other)
CREATE OR REPLACE FUNCTION public.check_mutual_match(user_a UUID, user_b UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.curated_matches cm1
    JOIN public.curated_matches cm2 ON cm1.user_id = cm2.matched_user_id AND cm1.matched_user_id = cm2.user_id
    WHERE cm1.user_id = user_a 
    AND cm1.matched_user_id = user_b
    AND cm1.status = 'accepted'
    AND cm2.status = 'accepted'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;