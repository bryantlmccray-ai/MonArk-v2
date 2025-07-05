import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useNotificationTriggers = () => {
  const { user } = useAuth();

  // Create notifications for various events
  useEffect(() => {
    if (!user) return;

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

    // Single channel for all notification triggers
    const channel = supabase
      .channel(`notification-triggers-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'matches',
          filter: `liked_user_id=eq.${user.id}`
        },
        (payload) => {
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
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return null;
};