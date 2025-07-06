import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface ActivityItem {
  id: string;
  type: 'new_profile' | 'user_online' | 'proximity_alert';
  user_id: string;
  user_name: string;
  user_image?: string;
  message: string;
  timestamp: string;
  distance?: number;
  compatibility_score?: number;
}

export const useActivityFeed = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Use a stable channel name with user ID
    const channelName = `activity-profiles-${user.id}`;
    const profilesChannel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_profiles'
        },
        async (payload) => {
          try {
            // Fetch profile name
            const { data: profile } = await supabase
              .from('profiles')
              .select('name')
              .eq('id', payload.new.user_id)
              .single();

            if (profile) {
              const newActivity: ActivityItem = {
                id: `profile-${payload.new.id}`,
                type: 'new_profile',
                user_id: payload.new.user_id,
                user_name: profile.name || 'New User',
                message: `${profile.name || 'Someone new'} just joined MonArk!`,
                timestamp: payload.new.created_at,
                distance: Math.random() * 10 + 1 // Mock distance for now
              };

              setActivities(prev => [newActivity, ...prev.slice(0, 9)]); // Keep last 10
            }
          } catch (error) {
            console.error('Error handling activity feed:', error);
          }
        }
      )
      .subscribe();

    // Generate some mock activities for demonstration
    const generateMockActivities = () => {
      const mockActivities: ActivityItem[] = [
        {
          id: 'mock-1',
          type: 'new_profile',
          user_id: 'mock-user-1',
          user_name: 'Alex',
          user_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
          message: 'Alex just joined MonArk!',
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          distance: 2.3
        },
        {
          id: 'mock-2',
          type: 'user_online',
          user_id: 'mock-user-2',
          user_name: 'Maya',
          user_image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
          message: 'Maya is now active nearby',
          timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
          distance: 1.8
        },
        {
          id: 'mock-3',
          type: 'proximity_alert',
          user_id: 'mock-user-3',
          user_name: 'Jordan',
          user_image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
          message: 'Jordan (94% compatibility) is nearby',
          timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
          distance: 0.5,
          compatibility_score: 94
        }
      ];

      setActivities(mockActivities);
    };

    generateMockActivities();

    return () => {
      try {
        supabase.removeChannel(profilesChannel);
      } catch (error) {
        console.error('Error removing channel:', error);
      }
    };
  }, [user?.id]); // Use user.id instead of user object

  const addProximityAlert = (
    userId: string,
    userName: string,
    userImage: string,
    distance: number,
    compatibilityScore: number
  ) => {
    const alert: ActivityItem = {
      id: `proximity-${userId}-${Date.now()}`,
      type: 'proximity_alert',
      user_id: userId,
      user_name: userName,
      user_image: userImage,
      message: `${userName} (${compatibilityScore}% compatibility) is ${distance.toFixed(1)}mi away`,
      timestamp: new Date().toISOString(),
      distance,
      compatibility_score: compatibilityScore
    };

    setActivities(prev => [alert, ...prev.slice(0, 9)]);
  };

  return {
    activities,
    addProximityAlert
  };
};