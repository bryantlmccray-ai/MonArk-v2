-- Create behavior_analytics table with proper structure
CREATE TABLE IF NOT EXISTS public.behavior_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.behavior_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for behavior_analytics
CREATE POLICY "Users can insert their own analytics events"
  ON public.behavior_analytics
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own analytics events"
  ON public.behavior_analytics
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all analytics events"
  ON public.behavior_analytics
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_behavior_analytics_user_id ON public.behavior_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_behavior_analytics_event_type ON public.behavior_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_behavior_analytics_created_at ON public.behavior_analytics(created_at DESC);