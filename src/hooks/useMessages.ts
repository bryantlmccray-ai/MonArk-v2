
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { queryKeys } from '@/lib/queryKeys';
import { Tables } from '@/integrations/supabase/types';

type Message = Tables<'messages'>;

interface MessageWithStatus extends Message {
  delivery_status?: 'sending' | 'delivered' | 'read' | 'failed';
}

export const useMessages = (conversationId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading: loading } = useQuery({
    queryKey: queryKeys.messages.byConversation(conversationId),
    queryFn: async (): Promise<MessageWithStatus[]> => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Mark messages as read on fetch
      if (user) {
        await supabase.rpc('mark_messages_as_read', {
          p_conversation_id: conversationId,
          p_user_id: user.id
        });
      }

      return (data || []).map(m => ({ ...m, delivery_status: m.read_at ? 'read' : 'delivered' as const }));
    },
    enabled: !!conversationId && !!user,
    staleTime: 10_000,
  });

  // Real-time subscription
  useEffect(() => {
    if (!conversationId || !user) return;

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
        async (payload) => {
          const newMessage = payload.new as MessageWithStatus;
          newMessage.delivery_status = 'delivered';

          // Add to cache if not already present (avoid duplicates from optimistic updates)
          queryClient.setQueryData(
            queryKeys.messages.byConversation(conversationId),
            (old: MessageWithStatus[] | undefined) => {
              if (!old) return [newMessage];
              if (old.find(m => m.id === newMessage.id)) return old;
              // Replace optimistic message if it exists
              const withoutTemp = old.filter(m => !m.id.startsWith('temp_'));
              return [...withoutTemp.filter(m => m.id !== newMessage.id), newMessage];
            }
          );

          // Mark as read if we're the recipient
          if (newMessage.recipient_user_id === user.id) {
            try {
              await supabase.rpc('mark_messages_as_read', {
                p_conversation_id: conversationId,
                p_user_id: user.id
              });
            } catch (e) {
              console.error('Error marking message as read:', e);
            }
          }

          // Invalidate conversations to update unread counts
          queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const updated = payload.new as MessageWithStatus;
          queryClient.setQueryData(
            queryKeys.messages.byConversation(conversationId),
            (old: MessageWithStatus[] | undefined) =>
              (old || []).map(msg =>
                msg.id === updated.id
                  ? { ...updated, delivery_status: updated.read_at ? 'read' : 'delivered' as const }
                  : msg
              )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user?.id, queryClient]);

  const sendMutation = useMutation({
    mutationFn: async ({ content, recipientUserId, messageType = 'text' }: { content: string; recipientUserId: string; messageType?: 'text' | 'system' }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_user_id: user.id,
          recipient_user_id: recipientUserId,
          content: content.trim(),
          message_type: messageType
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async ({ content, recipientUserId, messageType = 'text' }) => {
      // Optimistic update
      const tempId = `temp_${Date.now()}_${Math.random()}`;
      const optimistic: MessageWithStatus = {
        id: tempId,
        conversation_id: conversationId,
        sender_user_id: user!.id,
        recipient_user_id: recipientUserId,
        content: content.trim(),
        message_type: messageType,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        read_at: null,
        delivery_status: 'sending'
      };

      queryClient.setQueryData(
        queryKeys.messages.byConversation(conversationId),
        (old: MessageWithStatus[] | undefined) => [...(old || []), optimistic]
      );

      return { tempId };
    },
    onError: (_error, _vars, context) => {
      if (context?.tempId) {
        queryClient.setQueryData(
          queryKeys.messages.byConversation(conversationId),
          (old: MessageWithStatus[] | undefined) =>
            (old || []).map(msg =>
              msg.id === context.tempId ? { ...msg, delivery_status: 'failed' as const } : msg
            )
        );
      }
    },
    onSuccess: (data, _vars, context) => {
      // Replace optimistic with real
      if (context?.tempId) {
        queryClient.setQueryData(
          queryKeys.messages.byConversation(conversationId),
          (old: MessageWithStatus[] | undefined) =>
            (old || []).map(msg =>
              msg.id === context.tempId ? { ...data, delivery_status: 'delivered' as const } : msg
            )
        );
      }
      // Invalidate conversations to update last message
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
    },
  });

  const sendMessage = useCallback(
    async (content: string, recipientUserId: string, messageType: 'text' | 'system' = 'text') => {
      if (!user || !content.trim()) return false;
      try {
        await sendMutation.mutateAsync({ content, recipientUserId, messageType });
        return true;
      } catch {
        return false;
      }
    },
    [user, sendMutation]
  );

  const getUnreadCount = useCallback(() => {
    if (!user) return 0;
    return messages.filter(m => m.recipient_user_id === user.id && !m.read_at).length;
  }, [messages, user]);

  return {
    messages,
    loading,
    sendMessage,
    unreadCount: getUnreadCount()
  };
};
