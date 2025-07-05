-- Create user compatibility feedback table for ML learning
CREATE TABLE public.user_compatibility_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  target_user_id UUID NOT NULL,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('like', 'pass', 'message', 'block')),
  feedback_score INTEGER NOT NULL CHECK (feedback_score >= 1 AND feedback_score <= 10),
  interaction_context TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_compatibility_feedback ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create their own feedback" 
ON public.user_compatibility_feedback 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own feedback" 
ON public.user_compatibility_feedback 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_user_compatibility_feedback_user_id ON public.user_compatibility_feedback(user_id);
CREATE INDEX idx_user_compatibility_feedback_target_user_id ON public.user_compatibility_feedback(target_user_id);