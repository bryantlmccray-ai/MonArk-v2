CREATE TABLE public.rif_quiz_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  q1 TEXT,
  q2 TEXT,
  q3 TEXT,
  q4 TEXT,
  q5 TEXT,
  q6 TEXT,
  q7 TEXT,
  q8 TEXT,
  q9 TEXT,
  q10 TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.rif_quiz_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quiz answers"
  ON public.rif_quiz_answers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz answers"
  ON public.rif_quiz_answers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quiz answers"
  ON public.rif_quiz_answers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all quiz answers"
  ON public.rif_quiz_answers FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));