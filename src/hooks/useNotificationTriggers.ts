import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

/**
 * MVP Email Notification Triggers
 * Sends emails for essential events only:
 * - New match accepted your option
 * - New message received
 * - In-app notification received (via Realtime on notifications table)
 * - Date reminder (handled by scheduled function)
 * - After-action prompt (handled by scheduled function)
 * - Weekly options ready (handled by scheduled function)
 */
export const useNotificationTriggers = () => {
    const { user } = useAuth();

    useEffect(() => {
          if (!user?.id) return;

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

                  let mounted = true;

                  const channelName = `email-triggers-${user.id}`;
          const channel = supabase
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
                                          if (!mounted) return;
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
                          if (!mounted) return;
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
            )
                    // In-app notification received — triggers email for actionable alerts
                    .on(
                              'postgres_changes',
                      {
                                  event: 'INSERT',
                                  schema: 'public',
                                  table: 'notifications',
                                  filter: `user_id=eq.${user.id}`
                      },
                              async (payload) => {
                                          if (!mounted) return;
                                          try {
                                                        const notification = payload.new as any;
                                                        // Only send email for high-priority notification types
                                            const emailTypes = ['match', 'message', 'date_proposal', 'system', 'safety'];
                                                        if (emailTypes.includes(notification.type)) {
                                                                        await sendEmailNotification(
                                                                                          notification.type as 'match' | 'message' | 'date_proposal' | 'system' | 'safety',
                                                                                          notification.title ?? 'New Notification',
                                                                                          notification.message ?? 'You have a new notification.',
                                                                                          notification.action_url ?? 'https://monark.app'
                                                                                        );
                                                        }
                                          } catch (error) {
                                                        console.error('Error handling in-app notification:', error);
                                          }
                              }
                            )
                    .subscribe();

      return () => {
              mounted = false;
              supabase.removeChannel(channel);
      };
}, [user?.id]);

  return null;
};
