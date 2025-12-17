-- Create date_reflections table for RIF Beta
CREATE TABLE public.date_reflections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  partner_name TEXT NOT NULL,
  date_occurred TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Question 1: How did you feel during the date?
  feeling_during TEXT NOT NULL CHECK (feeling_during IN ('energized_engaged', 'comfortable_not_excited', 'anxious_drained', 'not_great_fit')),
  
  -- Question 2: What stood out to you? (can select multiple)
  standout_qualities TEXT[] NOT NULL DEFAULT '{}',
  
  -- Question 3: Next preference
  next_preference TEXT NOT NULL CHECK (next_preference IN ('similar_energy', 'different_energy', 'not_sure')),
  different_energy_description TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.date_reflections ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own reflections
CREATE POLICY "Users can view their own reflections"
  ON public.date_reflections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reflections"
  ON public.date_reflections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reflections"
  ON public.date_reflections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reflections"
  ON public.date_reflections FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_date_reflections_user_id ON public.date_reflections(user_id);
CREATE INDEX idx_date_reflections_created_at ON public.date_reflections(created_at DESC);