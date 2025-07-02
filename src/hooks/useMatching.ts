
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const useMatching = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const likeUser = async (likedUserId: string) => {
    if (!user) {
      toast.error('Please sign in to connect with profiles');
      return false;
    }

    if (user.id === likedUserId) {
      toast.error('You cannot connect with yourself');
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
        toast.error('Failed to connect');
        return false;
      }

      if (existingLike) {
        toast.info('You already showed interest in this profile');
        return false;
      }

      // Create the like/interest
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

      // Check if it creates a mutual connection (the trigger will handle conversation creation)
      const { data: mutualCheck, error: mutualError } = await supabase
        .from('matches')
        .select('is_mutual')
        .eq('user_id', user.id)
        .eq('liked_user_id', likedUserId)
        .single();

      if (mutualCheck?.is_mutual) {
        toast.success("You can now start a conversation! 💬");
      } else {
        toast.success('Interest shown! They\'ll be notified you\'d like to connect.');
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
      // Check if there's a mutual connection
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .select('is_mutual')
        .or(`and(user_id.eq.${user.id},liked_user_id.eq.${matchUserId}),and(user_id.eq.${matchUserId},liked_user_id.eq.${user.id})`)
        .eq('is_mutual', true)
        .single();

      if (matchError || !match) {
        toast.error('You need a mutual connection to start a conversation');
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
