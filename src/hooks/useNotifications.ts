import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';

export interface Notification {
  id: string;
  user_id: string;
  type: 'match' | 'message' | 'date_proposal' | 'system' | 'safety';
  title: string;
  message: string;
  data: Json;
  read_at: string | null;
  action_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  push_enabled: boolean;
  email_enabled: boolean;
  new_matches: boolean;
  new_messages: boolean;
  date_proposals: boolean;
  date_reminders: boolean;
  rif_insights: boolean;
  safety_alerts: boolean;
  system_updates: boolean;
  created_at: string;
  updated_at: string;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return;

    try {
      console.log('Fetching notifications for user:', user.id);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      const typedNotifications = (data || []) as Notification[];
      console.log('Notifications fetched:', typedNotifications);
      setNotifications(typedNotifications);
      setUnreadCount(typedNotifications.filter(n => !n.read_at).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    }
  };

  // Fetch notification preferences
  const fetchPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (!data) {
        // Create default preferences
        const { data: newPrefs, error: createError } = await supabase
          .from('notification_preferences')
          .insert({
            user_id: user.id,
            push_enabled: true,
            email_enabled: true,
            new_matches: true,
            new_messages: true,
            date_proposals: true,
            date_reminders: true,
            rif_insights: true,
            safety_alerts: true,
            system_updates: false
          })
          .select()
          .single();

        if (createError) throw createError;
        setPreferences(newPrefs);
      } else {
        setPreferences(data);
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      toast({
        title: "Error",
        description: "Failed to load notification preferences",
        variant: "destructive",
      });
    }
  };

  // Create notification
  const createNotification = async (
    type: Notification['type'],
    title: string,
    message: string,
    data?: Json,
    actionUrl?: string
  ) => {
    if (!user) return false;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          type,
          title,
          message,
          data: data || {},
          action_url: actionUrl
        });

      if (error) throw error;

      await fetchNotifications();
      return true;
    } catch (error) {
      console.error('Error creating notification:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', user?.id);

      if (error) throw error;

      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, read_at: new Date().toISOString() }
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .is('read_at', null);

      if (error) throw error;

      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Update preferences
  const updatePreferences = async (updates: Partial<NotificationPreferences>) => {
    if (!user || !preferences) return false;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notification_preferences')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setPreferences(data);
      toast({
        title: "Success",
        description: "Notification preferences updated",
      });

      return true;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      toast({
        title: "Error",
        description: "Failed to update notification preferences",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // Update unread count if it was unread
      const wasUnread = notifications.find(n => n.id === notificationId && !n.read_at);
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Set up real-time subscription for new notifications only
  useEffect(() => {
    if (!user?.id) return;

    let channel: any = null;
    let isSubscribed = false;

    const setupSubscription = async () => {
      if (isSubscribed) return;
      
      try {
        // Use a unique channel name with timestamp to prevent subscription conflicts
        const channelName = `notifications_${user.id}_${Date.now()}`;
        channel = supabase
          .channel(channelName)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${user.id}`
            },
            (payload) => {
              try {
                const newNotification = payload.new as Notification;
                setNotifications(prev => [newNotification, ...prev]);
                setUnreadCount(prev => prev + 1);
                
                // Show toast for new notification
                toast({
                  title: newNotification.title,
                  description: newNotification.message,
                });
              } catch (error) {
                console.error('Error handling notification:', error);
              }
            }
          );

        await channel.subscribe();
        isSubscribed = true;
      } catch (error) {
        console.error('Error setting up notification subscription:', error);
      }
    };

    setupSubscription();

    return () => {
      isSubscribed = false;
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch (error) {
          console.error('Error removing channel:', error);
        }
      }
    };
  }, [user?.id]); // Use user.id instead of user object

  useEffect(() => {
    if (user) {
      console.log('User authenticated, fetching notifications for:', user.id);
      fetchNotifications();
      fetchPreferences();
    }
  }, [user]);

  return {
    notifications,
    preferences,
    loading,
    unreadCount,
    createNotification,
    markAsRead,
    markAllAsRead,
    updatePreferences,
    deleteNotification,
    refetch: {
      notifications: fetchNotifications,
      preferences: fetchPreferences
    }
  };
};