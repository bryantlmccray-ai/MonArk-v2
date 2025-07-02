
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const useMatching = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const likeUser = async (likedUserId: string) => {
    if (!user) {
      toast.error('Please sign in to like profiles');
      return false;
    }

    if (user.id === likedUserId) {
      toast.error('You cannot like yourself');
      return false;
    }

    setLoading(true);
    try {
      // Check if already liked
      const { data: existingLike, error: checkError } = await supabase
        .from('matches')
        .select('id, is_mutual')
        .eq('user_id', user.id)
        .eq('liked_user_id', likedUserId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing like:', checkError);
        toast.error('Failed to like profile');
        return false;
      }

      if (existingLike) {
        toast.info('You already liked this profile');
        return false;
      }

      // Create the like
      const { error: insertError } = await supabase
        .from('matches')
        .insert({
          user_id: user.id,
          liked_user_id: likedUserId
        });

      if (insertError) {
        console.error('Error creating like:', insertError);
        toast.error('Failed to like profile');
        return false;
      }

      // Check if it's a mutual match (the trigger will handle conversation creation)
      const { data: mutualCheck, error: mutualError } = await supabase
        .from('matches')
        .select('is_mutual')
        .eq('user_id', user.id)
        .eq('liked_user_id', likedUserId)
        .single();

      if (mutualCheck?.is_mutual) {
        toast.success("It's a match! 🎉 You can now start chatting!");
      } else {
        toast.success('Profile liked! We\'ll let you know if it\'s a match.');
      }

      return true;
    } catch (error) {
      console.error('Error in likeUser:', error);
      toast.error('Failed to like profile');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const startConversation = async (matchUserId: string) => {
    if (!user) {
      toast.error('Please sign in to start conversations');
      return null;
    }

    try {
      // Check if there's a mutual match and existing conversation
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .select('is_mutual')
        .or(`and(user_id.eq.${user.id},liked_user_id.eq.${matchUserId}),and(user_id.eq.${matchUserId},liked_user_id.eq.${user.id})`)
        .eq('is_mutual', true)
        .single();

      if (matchError || !match) {
        toast.error('You need to match with this person first');
        return null;
      }

      // Generate conversation ID
      const conversationId = [user.id, matchUserId].sort().join('_');

      // Check if conversation already exists
      const { data: existingConvo, error: convoError } = await supabase
        .from('conversation_tracker')
        .select('conversation_id')
        .eq('conversation_id', conversationId)
        .single();

      if (convoError && convoError.code !== 'PGRST116') {
        console.error('Error checking conversation:', convoError);
        toast.error('Failed to start conversation');
        return null;
      }

      if (!existingConvo) {
        // Create conversation if it doesn't exist
        const { error: createError } = await supabase
          .from('conversation_tracker')
          .insert({
            conversation_id: conversationId,
            user_id: user.id,
            match_user_id: matchUserId
          });

        if (createError) {
          console.error('Error creating conversation:', createError);
          toast.error('Failed to start conversation');
          return null;
        }
      }

      toast.success('Conversation started!');
      return conversationId;
    } catch (error) {
      console.error('Error in startConversation:', error);
      toast.error('Failed to start conversation');
      return null;
    }
  };

  return {
    likeUser,
    startConversation,
    loading
  };
};
