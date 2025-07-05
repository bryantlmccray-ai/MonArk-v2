import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useNotifications } from './useNotifications';

export const useNotificationTriggers = () => {
  const { user } = useAuth();
  const { createNotification, preferences } = useNotifications();

  // Listen for new matches
  useEffect(() => {
    if (!user || !preferences?.new_matches) return;

    const channel = supabase
      .channel(`match-notifications-${user.id}`)
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
          if (match.is_mutual) {
            createNotification(
              'match',
              '🎉 New Match!',
              'You have a new mutual match. Start a conversation!',
              { match_id: match.id },
              '/matches'
            );

            // Send email notification if enabled
            if (preferences?.email_enabled) {
              fetch('/functions/v1/send-notification-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  to: user.email,
                  type: 'match',
                  title: '🎉 New Match!',
                  message: 'You have a new mutual match. Start a conversation!',
                  actionUrl: `${window.location.origin}/matches`
                })
              }).catch(console.error);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, preferences, createNotification]);

  // Listen for new messages
  useEffect(() => {
    if (!user || !preferences?.new_messages) return;

    const channel = supabase
      .channel(`message-notifications-${user.id}`)
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

          // Send email notification if enabled
          if (preferences?.email_enabled) {
            fetch('/functions/v1/send-notification-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: user.email,
                type: 'message',
                title: '💬 New Message',
                message: 'You have a new message waiting for you.',
                actionUrl: `${window.location.origin}/matches?conversation=${message.conversation_id}`
              })
            }).catch(console.error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, preferences, createNotification]);

  // Listen for date proposals
  useEffect(() => {
    if (!user || !preferences?.date_proposals) return;

    const channel = supabase
      .channel(`proposal-notifications-${user.id}`)
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

          // Send email notification if enabled
          if (preferences?.email_enabled) {
            fetch('/functions/v1/send-notification-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: user.email,
                type: 'date_proposal',
                title: '📅 Date Proposal',
                message: `Someone proposed a date: ${proposal.title}`,
                actionUrl: `${window.location.origin}/matches?conversation=${proposal.conversation_id}`
              })
            }).catch(console.error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, preferences, createNotification]);

  // Listen for RIF insights
  useEffect(() => {
    if (!user || !preferences?.rif_insights) return;

    const channel = supabase
      .channel(`rif-insights-notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'rif_insights',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const insight = payload.new as any;
          createNotification(
            'system',
            '💡 New Insight',
            `${insight.title}: ${insight.content.substring(0, 100)}...`,
            { insight_id: insight.id },
            '/profile'
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, preferences, createNotification]);

  return null;
};