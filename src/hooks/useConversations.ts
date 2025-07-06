import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { Tables } from '@/integrations/supabase/types';

type ConversationTracker = Tables<'conversation_tracker'>;
type Message = Tables<'messages'>;
type Profile = Tables<'profiles'>;

export interface ConversationWithDetails extends ConversationTracker {
  otherUser: Profile;
  lastMessage?: Message;
  unreadCount: number;
}

export const useConversations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get conversation trackers
      const { data: trackers, error: trackersError } = await supabase
        .from('conversation_tracker')
        .select('*')
        .or(`user_id.eq.${user.id},match_user_id.eq.${user.id}`)
        .order('last_activity', { ascending: false });

      if (trackersError) throw trackersError;

      if (!trackers || trackers.length === 0) {
        setConversations([]);
        return;
      }

      // Get other user profiles
      const otherUserIds = trackers.map(tracker => 
        tracker.user_id === user.id ? tracker.match_user_id : tracker.user_id
      );

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', otherUserIds);

      if (profilesError) throw profilesError;

      // Get last messages for each conversation
      const conversationIds = trackers.map(t => t.conversation_id);
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .in('conversation_id', conversationIds)
        .order('created_at', { ascending: false });

      if (messagesError) throw messagesError;

      // Get unread counts
      const unreadCounts: Record<string, number> = {};
      for (const conversationId of conversationIds) {
        const { count, error: countError } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conversationId)
          .eq('recipient_user_id', user.id)
          .is('read_at', null);

        if (!countError) {
          unreadCounts[conversationId] = count || 0;
        }
      }

      // Combine data
      const conversationsWithDetails: ConversationWithDetails[] = trackers.map(tracker => {
        const otherUserId = tracker.user_id === user.id ? tracker.match_user_id : tracker.user_id;
        const otherUser = profiles?.find(p => p.id === otherUserId);
        const lastMessage = messages?.find(m => m.conversation_id === tracker.conversation_id);
        const unreadCount = unreadCounts[tracker.conversation_id] || 0;

        return {
          ...tracker,
          otherUser: otherUser || { id: otherUserId, name: 'Unknown User', email: null, created_at: '', updated_at: '' },
          lastMessage,
          unreadCount
        };
      });

      setConversations(conversationsWithDetails);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load conversations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getTotalUnreadCount = () => {
    return conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
  };

  const markConversationAsRead = async (conversationId: string) => {
    if (!user) return;

    try {
      await supabase.rpc('mark_messages_as_read', {
        p_conversation_id: conversationId,
        p_user_id: user.id
      });

      // Update local state
      setConversations(prev => 
        prev.map(conv => 
          conv.conversation_id === conversationId 
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
    } catch (error) {
      console.error('Error marking conversation as read:', error);
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    // Subscribe to new messages
    const messageChannel = supabase
      .channel(`messages_${user.id}_${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_user_id=eq.${user.id}`
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    // Subscribe to conversation updates  
    const conversationChannel = supabase
      .channel(`conversations_${user.id}_${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversation_tracker'
        },
        (payload) => {
          const updatedConversation = payload.new as ConversationTracker;
          if (updatedConversation.user_id === user.id || updatedConversation.match_user_id === user.id) {
            fetchConversations();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(conversationChannel);
    };
  }, [user]);

  // Load conversations on mount
  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  return {
    conversations,
    loading,
    totalUnreadCount: getTotalUnreadCount(),
    markConversationAsRead,
    refetch: fetchConversations
  };
};