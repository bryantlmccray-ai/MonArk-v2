
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Tables } from '@/integrations/supabase/types';

type Message = Tables<'messages'>;

export const useMessages = (conversationId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
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
            const newMessage = payload.new as Message;
            setMessages(prev => [...prev, newMessage]);
            
            // Mark as read if user is recipient
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
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch (error) {
        console.error('Error removing channel:', error);
      }
    };
  }, [conversationId, user?.id]); // Use user.id instead of user object

  const sendMessage = async (content: string, recipientUserId: string, messageType: 'text' | 'system' = 'text') => {
    if (!user || !content.trim()) return null;

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
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
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
