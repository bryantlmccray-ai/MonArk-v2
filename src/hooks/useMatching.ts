
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const useMatching = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const likeUser = async (likedUserId: string) => {
    if (!user) {
      toast.error('Please sign in to show interest');
      return false;
    }

    if (user.id === likedUserId) {
      toast.error('You cannot show interest in yourself');
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
        toast.error('Failed to show interest');
        return false;
      }

      if (existingLike) {
        toast.info('You already showed interest in this person');
        return false;
      }

      // Create the interest/like
      const { error: insertError } = await supabase
        .from('matches')
        .insert({
          user_id: user.id,
          liked_user_id: likedUserId
        });

      if (insertError) {
        console.error('Error creating like:', insertError);
        toast.error('Failed to show interest');
        return false;
      }

      // Check if there's mutual interest
      const { data: mutualCheck, error: mutualError } = await supabase
        .from('matches')
        .select('is_mutual')
        .eq('user_id', user.id)
        .eq('liked_user_id', likedUserId)
        .single();

      if (mutualCheck?.is_mutual) {
        toast.success("There's mutual interest! You can now choose to start a conversation. 💬");
      } else {
        toast.success('Interest shown! They\'ll be notified and can choose to connect with you.');
      }

      return true;
    } catch (error) {
      console.error('Error in likeUser:', error);
      toast.error('Failed to show interest');
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
        // Create conversation - open messaging allows anyone to start conversations
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

      toast.success('Conversation started! You can now chat.');
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
