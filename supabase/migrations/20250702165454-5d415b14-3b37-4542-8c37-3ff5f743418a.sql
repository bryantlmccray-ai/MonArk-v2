
-- Create matches table to store user likes and matches
CREATE TABLE public.matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users,
  liked_user_id UUID NOT NULL REFERENCES auth.users,
  is_mutual BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, liked_user_id)
);

-- Enable RLS on matches table
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Create policies for matches
CREATE POLICY "Users can view their own matches" ON public.matches 
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = liked_user_id);

CREATE POLICY "Users can create their own likes" ON public.matches 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update matches they're part of" ON public.matches 
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = liked_user_id);

-- Create function to handle mutual matches and create conversations
CREATE OR REPLACE FUNCTION handle_new_like()
RETURNS TRIGGER AS $$
DECLARE
  existing_like_id UUID;
  conversation_id_val TEXT;
BEGIN
  -- Check if the liked user already liked this user back
  SELECT id INTO existing_like_id
  FROM public.matches 
  WHERE user_id = NEW.liked_user_id 
    AND liked_user_id = NEW.user_id;

  -- If mutual like exists, mark both as mutual and create conversation
  IF existing_like_id IS NOT NULL THEN
    -- Mark both likes as mutual
    UPDATE public.matches 
    SET is_mutual = true, updated_at = now()
    WHERE id = existing_like_id OR id = NEW.id;
    
    -- Create conversation ID
    conversation_id_val := CONCAT(
      LEAST(NEW.user_id::text, NEW.liked_user_id::text),
      '_',
      GREATEST(NEW.user_id::text, NEW.liked_user_id::text)
    );
    
    -- Create conversation tracker
    INSERT INTO public.conversation_tracker (
      conversation_id,
      user_id,
      match_user_id
    ) VALUES (
      conversation_id_val,
      NEW.user_id,
      NEW.liked_user_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new likes
CREATE TRIGGER handle_new_like_trigger
  AFTER INSERT ON public.matches
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_like();

-- Enable real-time for matches table
ALTER TABLE public.matches REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
