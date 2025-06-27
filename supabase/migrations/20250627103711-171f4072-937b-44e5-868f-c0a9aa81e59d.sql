
-- Create user_rif_state table to track emotional states
CREATE TABLE public.user_rif_state (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users,
  current_state TEXT NOT NULL DEFAULT 'Exploring',
  state_description TEXT,
  color_palette JSONB DEFAULT '{"primary": "#3B82F6", "secondary": "#93C5FD"}',
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rif_event_log table to track user behaviors
CREATE TABLE public.rif_event_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users,
  event_type TEXT NOT NULL, -- 'profile_view', 'message_sent', 'date_confirmed', 'reflection_skipped', etc.
  event_data JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rif_reflections table for journal entries
CREATE TABLE public.rif_reflections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users,
  prompt_id UUID,
  prompt_text TEXT,
  response_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rif_insights table for system-generated insights
CREATE TABLE public.rif_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users,
  insight_type TEXT NOT NULL, -- 'weekly', 'behavioral_pattern', 'milestone'
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  delivered BOOLEAN DEFAULT FALSE,
  engaged BOOLEAN DEFAULT FALSE
);

-- Create rif_prompts table for reflection prompts
CREATE TABLE public.rif_prompts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_text TEXT NOT NULL,
  category TEXT DEFAULT 'general', -- 'self_reflection', 'relationship_goals', 'emotional_awareness'
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_rif_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rif_event_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rif_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rif_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rif_prompts ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_rif_state
CREATE POLICY "Users can view their own RIF state" ON public.user_rif_state FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own RIF state" ON public.user_rif_state FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own RIF state" ON public.user_rif_state FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS policies for rif_event_log
CREATE POLICY "Users can view their own event log" ON public.rif_event_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own events" ON public.rif_event_log FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS policies for rif_reflections
CREATE POLICY "Users can view their own reflections" ON public.rif_reflections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own reflections" ON public.rif_reflections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reflections" ON public.rif_reflections FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for rif_insights
CREATE POLICY "Users can view their own insights" ON public.rif_insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own insights" ON public.rif_insights FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for rif_prompts (everyone can read active prompts)
CREATE POLICY "Anyone can view active prompts" ON public.rif_prompts FOR SELECT USING (is_active = true);

-- Insert some sample prompts
INSERT INTO public.rif_prompts (prompt_text, category) VALUES
('How are you feeling about your dating journey right now?', 'self_reflection'),
('What qualities in a connection make you feel most authentic?', 'relationship_goals'),
('When do you feel most confident in romantic situations?', 'emotional_awareness'),
('What patterns have you noticed in your recent interactions?', 'behavioral_pattern'),
('What would your ideal relationship dynamic look like?', 'relationship_goals');
