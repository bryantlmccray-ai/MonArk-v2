import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface TypingUser {
  user_id: string;
  user_name: string;
  started_typing: string;
}

export const useTypingIndicator = (conversationId: string) => {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const { user } = useAuth();

  // Set up real-time subscription for typing indicators
  useEffect(() => {
    if (!conversationId || !user) return;

    const channelName = `typing:${conversationId}`;
    const channel = supabase.channel(channelName);

    // Listen for typing events
    channel
      .on('broadcast', { event: 'typing_start' }, (payload) => {
        const typingUser = payload.payload as TypingUser;
        if (typingUser.user_id !== user.id) {
          setTypingUsers(prev => {
            const existing = prev.find(u => u.user_id === typingUser.user_id);
            if (existing) {
              return prev.map(u => 
                u.user_id === typingUser.user_id 
                  ? { ...u, started_typing: typingUser.started_typing }
                  : u
              );
            }
            return [...prev, typingUser];
          });
        }
      })
      .on('broadcast', { event: 'typing_stop' }, (payload) => {
        const { user_id } = payload.payload as { user_id: string };
        if (user_id !== user.id) {
          setTypingUsers(prev => prev.filter(u => u.user_id !== user_id));
        }
      })
      .subscribe();

    // Clean up old typing indicators (remove after 5 seconds)
    const cleanupInterval = setInterval(() => {
      setTypingUsers(prev => {
        const now = new Date();
        return prev.filter(user => {
          const typingTime = new Date(user.started_typing);
          const diffSeconds = (now.getTime() - typingTime.getTime()) / 1000;
          return diffSeconds < 5;
        });
      });
    }, 1000);

    return () => {
      clearInterval(cleanupInterval);
      supabase.removeChannel(channel);
    };
  }, [conversationId, user?.id]);

  // Start typing indicator
  const startTyping = useCallback(async (userName: string) => {
    if (!user || !conversationId || isTyping) return;

    setIsTyping(true);
    const channel = supabase.channel(`typing:${conversationId}`);
    
    await channel.send({
      type: 'broadcast',
      event: 'typing_start',
      payload: {
        user_id: user.id,
        user_name: userName,
        started_typing: new Date().toISOString()
      }
    });
  }, [user, conversationId, isTyping]);

  // Stop typing indicator
  const stopTyping = useCallback(async () => {
    if (!user || !conversationId || !isTyping) return;

    setIsTyping(false);
    const channel = supabase.channel(`typing:${conversationId}`);
    
    await channel.send({
      type: 'broadcast',
      event: 'typing_stop',
      payload: {
        user_id: user.id
      }
    });
  }, [user, conversationId, isTyping]);

  return {
    typingUsers,
    isTyping,
    startTyping,
    stopTyping
  };
};