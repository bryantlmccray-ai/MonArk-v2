import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';

export interface BlockedUser {
  id: string;
  blocker_user_id: string;
  blocked_user_id: string;
  reason?: string;
  created_at: string;
  updated_at: string;
}

export interface UserReport {
  id: string;
  reporter_user_id: string;
  reported_user_id: string;
  report_type: string;
  reason: string;
  description?: string;
  conversation_id?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface SafetySettings {
  id: string;
  user_id: string;
  location_sharing_enabled: boolean;
  show_online_status: boolean;
  allow_messages_from_strangers: boolean;
  require_mutual_match_for_messaging: boolean;
  auto_decline_inappropriate_content: boolean;
  emergency_contacts: Json;
  created_at: string;
  updated_at: string;
}

export const useUserSafety = () => {
  const { user } = useAuth();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [userReports, setUserReports] = useState<UserReport[]>([]);
  const [safetySettings, setSafetySettings] = useState<SafetySettings | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch blocked users
  const fetchBlockedUsers = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('blocked_users')
        .select('*')
        .eq('blocker_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBlockedUsers(data || []);
    } catch (error) {
      console.error('Error fetching blocked users:', error);
      toast({
        title: "Error",
        description: "Failed to load blocked users",
        variant: "destructive",
      });
    }
  };

  // Fetch user reports
  const fetchUserReports = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_reports')
        .select('*')
        .eq('reporter_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserReports(data || []);
    } catch (error) {
      console.error('Error fetching user reports:', error);
      toast({
        title: "Error",
        description: "Failed to load reports",
        variant: "destructive",
      });
    }
  };

  // Fetch safety settings
  const fetchSafetySettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_safety_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (!data) {
        // Create default settings if none exist
        const { data: newSettings, error: createError } = await supabase
          .from('user_safety_settings')
          .insert({
            user_id: user.id,
            location_sharing_enabled: true,
            show_online_status: true,
            allow_messages_from_strangers: true,
            require_mutual_match_for_messaging: false,
            auto_decline_inappropriate_content: true,
            emergency_contacts: []
          })
          .select()
          .single();

        if (createError) throw createError;
        setSafetySettings(newSettings);
      } else {
        setSafetySettings(data);
      }
    } catch (error) {
      console.error('Error fetching safety settings:', error);
      toast({
        title: "Error",
        description: "Failed to load safety settings",
        variant: "destructive",
      });
    }
  };

  // Block user
  const blockUser = async (userIdToBlock: string, reason?: string) => {
    if (!user) return false;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('blocked_users')
        .insert({
          blocker_user_id: user.id,
          blocked_user_id: userIdToBlock,
          reason
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "User has been blocked",
      });

      await fetchBlockedUsers();
      return true;
    } catch (error) {
      console.error('Error blocking user:', error);
      toast({
        title: "Error",
        description: "Failed to block user",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Unblock user
  const unblockUser = async (userIdToUnblock: string) => {
    if (!user) return false;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('blocked_users')
        .delete()
        .eq('blocker_user_id', user.id)
        .eq('blocked_user_id', userIdToUnblock);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User has been unblocked",
      });

      await fetchBlockedUsers();
      return true;
    } catch (error) {
      console.error('Error unblocking user:', error);
      toast({
        title: "Error",
        description: "Failed to unblock user",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Check if user is blocked
  const isUserBlocked = (userId: string): boolean => {
    return blockedUsers.some(blocked => blocked.blocked_user_id === userId);
  };

  // Report user
  const reportUser = async (
    userIdToReport: string,
    reportType: string,
    reason: string,
    description?: string,
    conversationId?: string
  ) => {
    if (!user) return false;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('user_reports')
        .insert({
          reporter_user_id: user.id,
          reported_user_id: userIdToReport,
          report_type: reportType,
          reason,
          description,
          conversation_id: conversationId
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Report submitted successfully",
      });

      await fetchUserReports();
      return true;
    } catch (error) {
      console.error('Error reporting user:', error);
      toast({
        title: "Error",
        description: "Failed to submit report",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update safety settings
  const updateSafetySettings = async (updates: Partial<SafetySettings>) => {
    if (!user || !safetySettings) return false;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_safety_settings')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setSafetySettings(data);
      toast({
        title: "Success",
        description: "Safety settings updated",
      });

      return true;
    } catch (error) {
      console.error('Error updating safety settings:', error);
      toast({
        title: "Error",
        description: "Failed to update safety settings",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBlockedUsers();
      fetchUserReports();
      fetchSafetySettings();
    }
  }, [user]);

  return {
    blockedUsers,
    userReports,
    safetySettings,
    loading,
    blockUser,
    unblockUser,
    isUserBlocked,
    reportUser,
    updateSafetySettings,
    refetch: {
      blockedUsers: fetchBlockedUsers,
      userReports: fetchUserReports,
      safetySettings: fetchSafetySettings
    }
  };
};