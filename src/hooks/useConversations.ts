import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { queryKeys } from '@/lib/queryKeys';
import { Tables } from '@/integrations/supabase/types';

type ConversationTracker = Tables<'conversation_tracker'>;
type Message = Tables<'messages'>;
type Profile = Tables<'profiles'>;

export interface ConversationWithDetails extends ConversationTracker {
  otherUser: Profile;
  lastMessage?: Message;
  unreadCount: number;
}

async function fetchConversationsFromDb(userId: string): Promise<ConversationWithDetails[]> {
  const { data: trackers, error: trackersError } = await supabase
    .from('conversation_tracker')
    .select('*')
    .or(`user_id.eq.${userId},match_user_id.eq.${userId}`)
    .order('last_activity', { ascending: false });

  if (trackersError) throw trackersError;
  if (!trackers || trackers.length === 0) return [];

  const otherUserIds = trackers.map(t =>
    t.user_id === userId ? t.match_user_id : t.user_id
  );
  const conversationIds = trackers.map(t => t.conversation_id);

  const [{ data: profiles }, { data: messages }] = await Promise.all([
    supabase.from('profiles').select('*').in('id', otherUserIds),
    supabase
      .from('messages')
      .select('*')
      .in('conversation_id', conversationIds)
      .order('created_at', { ascending: false }),
  ]);

  // Batch unread counts
  const unreadCounts: Record<string, number> = {};
  await Promise.all(
    conversationIds.map(async (cid) => {
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', cid)
        .eq('recipient_user_id', userId)
        .is('read_at', null);
      unreadCounts[cid] = count || 0;
    })
  );

  return trackers.map(tracker => {
    const otherUserId = tracker.user_id === userId ? tracker.match_user_id : tracker.user_id;
    const otherUser = profiles?.find(p => p.id === otherUserId);
    const lastMessage = messages?.find(m => m.conversation_id === tracker.conversation_id);

    return {
      ...tracker,
      otherUser: otherUser || { id: otherUserId, name: 'Unknown User', email: null, created_at: '', updated_at: '' },
      lastMessage,
      unreadCount: unreadCounts[tracker.conversation_id] || 0
    };
  });
}

export const useConversations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: conversations = [], isLoading: loading } = useQuery({
    queryKey: queryKeys.conversations.byUser(user?.id ?? ''),
    queryFn: () => fetchConversationsFromDb(user!.id),
    enabled: !!user,
    staleTime: 15_000, // 15s — conversations update frequently
  });

  // Real-time subscriptions that invalidate the query cache
  useEffect(() => {
    if (!user) return;

    const messageChannel = supabase
      .channel(`messages_${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `recipient_user_id=eq.${user.id}` },
        () => {
          queryClient.invalidateQueries({ queryKey: queryKeys.conversations.byUser(user.id) });
          // Also invalidate the specific message thread
          queryClient.invalidateQueries({ queryKey: queryKeys.messages.all });
        }
      )
      .subscribe();

    const conversationChannel = supabase
      .channel(`conversations_${user.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'conversation_tracker' },
        (payload) => {
          const updated = payload.new as ConversationTracker;
          if (updated.user_id === user.id || updated.match_user_id === user.id) {
            queryClient.invalidateQueries({ queryKey: queryKeys.conversations.byUser(user.id) });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(conversationChannel);
    };
  }, [user?.id, queryClient]);

  const getTotalUnreadCount = useCallback(() => {
    return conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
  }, [conversations]);

  const markConversationAsRead = useCallback(async (conversationId: string) => {
    if (!user) return;

    try {
      await supabase.rpc('mark_messages_as_read', {
        p_conversation_id: conversationId,
        p_user_id: user.id
      });

      // Optimistically update the cache
      queryClient.setQueryData(
        queryKeys.conversations.byUser(user.id),
        (old: ConversationWithDetails[] | undefined) =>
          (old || []).map(conv =>
            conv.conversation_id === conversationId
              ? { ...conv, unreadCount: 0 }
              : conv
          )
      );
    } catch (error) {
      console.error('Error marking conversation as read:', error);
    }
  }, [user, queryClient]);

  return {
    conversations,
    loading,
    totalUnreadCount: getTotalUnreadCount(),
    markConversationAsRead,
    refetch: () => {
      if (user) queryClient.invalidateQueries({ queryKey: queryKeys.conversations.byUser(user.id) });
    }
  };
};
