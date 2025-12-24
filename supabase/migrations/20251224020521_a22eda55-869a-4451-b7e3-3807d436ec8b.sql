-- Dating pool table for the 10-person browsable pool
CREATE TABLE public.dating_pool (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pool_user_id UUID NOT NULL,
  week_start DATE NOT NULL,
  compatibility_score NUMERIC,
  status TEXT NOT NULL DEFAULT 'pending',
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT dating_pool_unique UNIQUE (user_id, pool_user_id, week_start)
);

-- Enable RLS
ALTER TABLE public.dating_pool ENABLE ROW LEVEL SECURITY;

-- RLS policies for dating_pool
CREATE POLICY "Users can view their own dating pool"
ON public.dating_pool FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own dating pool entries"
ON public.dating_pool FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all dating pool entries"
ON public.dating_pool FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add delivery tracking to curated_matches
ALTER TABLE public.curated_matches 
ADD COLUMN IF NOT EXISTS is_delivered BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS curated_by UUID,
ADD COLUMN IF NOT EXISTS curation_notes TEXT;

-- Create match_delivery_log table to track delivery history
CREATE TABLE public.match_delivery_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  week_start DATE NOT NULL,
  curated_count INTEGER DEFAULT 0,
  pool_count INTEGER DEFAULT 0,
  delivered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  delivery_method TEXT DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on delivery log
ALTER TABLE public.match_delivery_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for delivery log
CREATE POLICY "Admins can manage delivery log"
ON public.match_delivery_log FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own delivery log"
ON public.match_delivery_log FOR SELECT
USING (auth.uid() = user_id);

-- Admin curation queue - tracks users who need matches curated
CREATE TABLE public.curation_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  priority INTEGER DEFAULT 0,
  last_curated_at TIMESTAMP WITH TIME ZONE,
  needs_curation BOOLEAN DEFAULT true,
  assigned_admin UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on curation queue
ALTER TABLE public.curation_queue ENABLE ROW LEVEL SECURITY;

-- RLS policies for curation queue
CREATE POLICY "Admins can manage curation queue"
ON public.curation_queue FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role));

-- Indexes for performance
CREATE INDEX idx_dating_pool_user_week ON public.dating_pool(user_id, week_start);
CREATE INDEX idx_dating_pool_status ON public.dating_pool(status);
CREATE INDEX idx_curated_matches_delivery ON public.curated_matches(is_delivered, week_start);
CREATE INDEX idx_curation_queue_needs ON public.curation_queue(needs_curation, priority DESC);