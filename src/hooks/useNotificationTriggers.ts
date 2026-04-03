import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

/**
 * MVP Email Notification Triggers
 * Sends emails for essential events only:
 * - New match accepted your option
 * - New message received
 * - Date reminder (handled by scheduled function)
 * - After-action prompt (handled by scheduled function)
 * - Weekly options ready (handled by scheduled function)
 */
export const useNotificationTriggers = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    let channel: any = null;
    let isSubscribed = false;

    const sendEmailNotification = async (
      type: 'match' | 'message' | 'date_proposal' | 'system' | 'safety',
      title: string,
      message: string,
      actionUrl?: string
    ) => {
      try {
        // Get user's email
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', user.id)
          .single();

        if (!profile?.email) {
          console.log('No email found for user, skipping notification');
          return;
        }

        // Send email via edge function
        const { error } = await supabase.functions.invoke('send-notification-email', {
          body: {
            to: profile.email,
            type,
            title,
            message,
            actionUrl
          }
        });

        if (error) {
          console.error('Error sending notification email:', error);
        } else {
          console.log('Notification email sent:', title);
        }
      } catch (error) {
        console.error('Error in sendEmailNotification:', error);
      }
    };

    const setupSubscription = async () => {
      if (isSubscribed) return;

      try {
        const channelName = `email-triggers-${user.id}`;
        channel = supabase
          .channel(channelName)
          // New mutual match notification
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'matches',
              filter: `liked_user_id=eq.${user.id}`
            },
            async (payload) => {
              try {
                const match = payload.new as any;
                if (match.is_mutual && !payload.old?.is_mutual) {
                  await sendEmailNotification(
                    'match',
                    'New Match!',
                    'Someone accepted your connection! Start a conversation now.',
                    'https://monark.app/matches'
                  );
                }
              } catch (error) {
                console.error('Error handling match notification:', error);
              }
            }
          )
          // New message notification
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages',
              filter: `recipient_user_id=eq.${user.id}`
            },
            async (payload) => {
              try {
                const message = payload.new as any;
                await sendEmailNotification(
                  'message',
                  'New Message',
                  'You have a new message waiting for you.',
                  `https://monark.app/matches?conversation=${message.conversation_id}`
                );
              } catch (error) {
                console.error('Error handling message notification:', error);
              }
            }
          );

        await channel.subscribe();
        isSubscribed = true;
        console.log('Email notification triggers subscribed');
      } catch (error) {
        console.error('Error setting up email notification triggers:', error);
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
  }, [user?.id]);

  return null;
};
