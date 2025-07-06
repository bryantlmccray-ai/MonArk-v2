
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Tables } from '@/integrations/supabase/types';

type Message = Tables<'messages'>;

interface MessageWithStatus extends Message {
  delivery_status?: 'sending' | 'delivered' | 'read' | 'failed';
}

export const useMessages = (conversationId: string) => {
  const [messages, setMessages] = useState<MessageWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch existing messages
  useEffect(() => {
    if (!conversationId || !user) return;

    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching messages:', error);
          return;
        }

        setMessages(data || []);
        
        // Mark messages as read
        await supabase.rpc('mark_messages_as_read', {
          p_conversation_id: conversationId,
          p_user_id: user.id
        });
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [conversationId, user]);

  // Set up real-time subscription
  useEffect(() => {
    if (!conversationId || !user) return;

    const channelName = `messages:${conversationId}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          try {
            const newMessage = payload.new as MessageWithStatus;
            newMessage.delivery_status = 'delivered';
            
            // Don't add if it's already in the messages (avoid duplicates from optimistic updates)
            setMessages(prev => {
              const exists = prev.find(msg => msg.id === newMessage.id);
              if (exists) return prev;
              return [...prev, newMessage];
            });
            
            // Mark as read if user is recipient and chat is active
            if (newMessage.recipient_user_id === user.id) {
              try {
                await supabase.rpc('mark_messages_as_read', {
                  p_conversation_id: conversationId,
                  p_user_id: user.id
                });
              } catch (markReadError) {
                console.error('Error marking message as read:', markReadError);
              }
            }
          } catch (error) {
            console.error('Error handling new message:', error);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          try {
            const updatedMessage = payload.new as MessageWithStatus;
            setMessages(prev => prev.map(msg => 
              msg.id === updatedMessage.id 
                ? { ...updatedMessage, delivery_status: updatedMessage.read_at ? 'read' : 'delivered' }
                : msg
            ));
          } catch (error) {
            console.error('Error handling message update:', error);
          }
        }
      )
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch (error) {
        console.error('Error removing channel:', error);
      }
    };
  }, [conversationId, user?.id]);

  const sendMessage = async (content: string, recipientUserId: string, messageType: 'text' | 'system' = 'text') => {
    if (!user || !content.trim()) return false;

    // Add optimistic message
    const tempId = `temp_${Date.now()}_${Math.random()}`;
    const optimisticMessage: MessageWithStatus = {
      id: tempId,
      conversation_id: conversationId,
      sender_user_id: user.id,
      recipient_user_id: recipientUserId,
      content: content.trim(),
      message_type: messageType,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      read_at: null,
      delivery_status: 'sending'
    };

    setMessages(prev => [...prev, optimisticMessage]);

    try {
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

      if (error) {
        console.error('Error sending message:', error);
        // Update optimistic message to failed
        setMessages(prev => prev.map(msg => 
          msg.id === tempId 
            ? { ...msg, delivery_status: 'failed' }
            : msg
        ));
        return false;
      }

      // Replace optimistic message with real one
      setMessages(prev => prev.map(msg => 
        msg.id === tempId 
          ? { ...data, delivery_status: 'delivered' }
          : msg
      ));

      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      // Update optimistic message to failed
      setMessages(prev => prev.map(msg => 
        msg.id === tempId 
          ? { ...msg, delivery_status: 'failed' }
          : msg
      ));
      return false;
    }
  };

  const getUnreadCount = () => {
    if (!user) return 0;
    return messages.filter(m => 
      m.recipient_user_id === user.id && !m.read_at
    ).length;
  };

  return {
    messages,
    loading,
    sendMessage,
    unreadCount: getUnreadCount()
  };
};
