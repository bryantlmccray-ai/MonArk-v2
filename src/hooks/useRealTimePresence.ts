import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel('user_presence');

    // Track current user's presence
    const trackPresence = async () => {
      const presence: UserPresence = {
        user_id: user.id,
        online_at: new Date().toISOString(),
        last_seen: new Date().toISOString()
      };

      setUserPresence(presence);
      await channel.track(presence);
    };

    // Listen for presence changes
    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const users: UserPresence[] = [];
        
        Object.keys(presenceState).forEach(key => {
          const presences = presenceState[key] as any[];
          presences.forEach(presence => {
            if (presence.user_id && presence.online_at && presence.last_seen) {
              users.push(presence as UserPresence);
            }
          });
        });
        
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      });

    // Subscribe and track presence
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await trackPresence();
      }
    });

    // Update presence every 30 seconds
    const presenceInterval = setInterval(() => {
      if (userPresence) {
        channel.track({
          ...userPresence,
          last_seen: new Date().toISOString()
        });
      }
    }, 30000);

    return () => {
      clearInterval(presenceInterval);
      supabase.removeChannel(channel);
    };
  }, [user]);

  const isUserOnline = (userId: string): boolean => {
    const userPresence = onlineUsers.find(u => u.user_id === userId);
    if (!userPresence) return false;
    
    const lastSeen = new Date(userPresence.last_seen);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastSeen.getTime()) / (1000 * 60);
    
    return diffMinutes < 5; // Consider online if seen within 5 minutes
  };

  return {
    onlineUsers,
    userPresence,
    isUserOnline
  };
};