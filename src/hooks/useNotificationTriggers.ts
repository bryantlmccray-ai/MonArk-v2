import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useNotificationTriggers = () => {
  const { user } = useAuth();

  // Create notifications for various events
  useEffect(() => {
    if (!user?.id) return;

    let channel: any = null;
    let isSubscribed = false;

    const createNotification = async (
      type: 'match' | 'message' | 'date_proposal' | 'system' | 'safety',
      title: string,
      message: string,
      data?: any,
      actionUrl?: string
    ) => {
      try {
        await supabase
          .from('notifications')
          .insert({
            user_id: user.id,
            type,
            title,
            message,
            data: data || {},
            action_url: actionUrl
          });
      } catch (error) {
        console.error('Error creating notification:', error);
      }
    };

    const setupSubscription = async () => {
      if (isSubscribed) return;

      try {
        // Single channel for all notification triggers with unique timestamp
        const channelName = `notification-triggers-${user.id}-${Date.now()}`;
        channel = supabase
          .channel(channelName)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'matches',
              filter: `liked_user_id=eq.${user.id}`
            },
            (payload) => {
              try {
                const match = payload.new as any;
                if (match.is_mutual && !payload.old?.is_mutual) {
                  createNotification(
                    'match',
                    '🎉 New Match!',
                    'You have a new mutual match. Start a conversation!',
                    { match_id: match.id },
                    '/matches'
                  );
                }
              } catch (error) {
                console.error('Error handling match notification:', error);
              }
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages',
              filter: `recipient_user_id=eq.${user.id}`
            },
            (payload) => {
              try {
                const message = payload.new as any;
                createNotification(
                  'message',
                  '💬 New Message',
                  'You have a new message waiting for you.',
                  { 
                    message_id: message.id,
                    conversation_id: message.conversation_id 
                  },
                  `/matches?conversation=${message.conversation_id}`
                );
              } catch (error) {
                console.error('Error handling message notification:', error);
              }
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'date_proposals',
              filter: `recipient_user_id=eq.${user.id}`
            },
            (payload) => {
              try {
                const proposal = payload.new as any;
                createNotification(
                  'date_proposal',
                  '📅 Date Proposal',
                  `Someone proposed a date: ${proposal.title}`,
                  { 
                    proposal_id: proposal.id,
                    conversation_id: proposal.conversation_id 
                  },
                  `/matches?conversation=${proposal.conversation_id}`
                );
              } catch (error) {
                console.error('Error handling date proposal notification:', error);
              }
            }
          );

        await channel.subscribe();
        isSubscribed = true;
      } catch (error) {
        console.error('Error setting up notification triggers subscription:', error);
      }
    };

    setupSubscription();

    return () => {
      isSubscribed = false;
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch (error) {
          console.error('Error removing channel:', error);
        }
      }
    };
  }, [user?.id]); // Use user.id instead of user object

  return null;
};