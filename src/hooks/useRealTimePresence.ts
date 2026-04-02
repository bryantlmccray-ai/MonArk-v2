import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UserPresence {
  user_id: string;
  online_at: string;
  last_seen: string;
  location?: { lat: number; lng: number };
}

export const useRealTimePresence = () => {
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const [userPresence, setUserPresence] = useState<UserPresence | null>(null);
  const { user } = useAuth();
  const presenceRef = useRef<UserPresence | null>(null);

  useEffect(() => {
    if (!user) return;

    const channelName = `user_presence_${user.id}`;
    const channel = supabase.channel(channelName);

    const trackPresence = async () => {
      try {
        const presence: UserPresence = {
          user_id: user.id,
          online_at: new Date().toISOString(),
          last_seen: new Date().toISOString()
        };
        presenceRef.current = presence;
        setUserPresence(presence);
        await channel.track(presence);
      } catch (error) {
        console.error('Error tracking presence:', error);
      }
    };

    channel
      .on('presence', { event: 'sync' }, () => {
        try {
          const presenceState = channel.presenceState();
          const users: UserPresence[] = [];
          Object.keys(presenceState).forEach(key => {
            const presences = presenceState[key] as any[];
            presences.forEach(p => {
              if (p.user_id && p.online_at && p.last_seen) {
                users.push(p as UserPresence);
              }
            });
          });
          setOnlineUsers(users);
        } catch (error) {
          console.error('Error handling presence sync:', error);
        }
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await trackPresence();
      }
    });

    // Use ref so the interval always reads the latest presence
    const presenceInterval = setInterval(() => {
      if (presenceRef.current) {
        try {
          channel.track({
            ...presenceRef.current,
            last_seen: new Date().toISOString()
          });
        } catch (error) {
          console.error('Error updating presence:', error);
        }
      }
    }, 30000);

    return () => {
      clearInterval(presenceInterval);
      presenceRef.current = null;
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const isUserOnline = useCallback((userId: string): boolean => {
    const found = onlineUsers.find(u => u.user_id === userId);
    if (!found) return false;
    const lastSeen = new Date(found.last_seen);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastSeen.getTime()) / (1000 * 60);
    return diffMinutes < 5;
  }, [onlineUsers]);

  return {
    onlineUsers,
    userPresence,
    isUserOnline
  };
};
