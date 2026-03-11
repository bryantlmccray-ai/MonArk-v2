import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';
import { queryKeys } from '@/lib/queryKeys';
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
  const queryClient = useQueryClient();

  // ── Blocked Users ────────────────────────────────────
  const { data: blockedUsers = [], isLoading: blockedLoading } = useQuery({
    queryKey: queryKeys.safety.blockedUsers(user?.id ?? ''),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blocked_users')
        .select('*')
        .eq('blocker_user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as BlockedUser[];
    },
    enabled: !!user,
    staleTime: 30_000,
  });

  // ── User Reports ─────────────────────────────────────
  const { data: userReports = [], isLoading: reportsLoading } = useQuery({
    queryKey: queryKeys.safety.reports(user?.id ?? ''),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_reports')
        .select('*')
        .eq('reporter_user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as UserReport[];
    },
    enabled: !!user,
    staleTime: 60_000,
  });

  // ── Safety Settings ──────────────────────────────────
  const { data: safetySettings = null, isLoading: settingsLoading } = useQuery({
    queryKey: queryKeys.safety.settings(user?.id ?? ''),
    queryFn: async (): Promise<SafetySettings | null> => {
      const { data, error } = await supabase
        .from('user_safety_settings')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (!data) {
        const { data: newSettings, error: createError } = await supabase
          .from('user_safety_settings')
          .insert({
            user_id: user!.id,
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
        return newSettings;
      }
      return data;
    },
    enabled: !!user,
    staleTime: 60_000,
  });

  // ── Mutations ────────────────────────────────────────

  const blockMutation = useMutation({
    mutationFn: async ({ userIdToBlock, reason }: { userIdToBlock: string; reason?: string }) => {
      const { error } = await supabase
        .from('blocked_users')
        .insert({ blocker_user_id: user!.id, blocked_user_id: userIdToBlock, reason });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'User has been blocked' });
      if (user) {
        // Invalidate everything that depends on blocked status
        queryClient.invalidateQueries({ queryKey: queryKeys.safety.blockedUsers(user.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.curatedMatches.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.datingPool.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.messages.all });
      }
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to block user', variant: 'destructive' });
    },
  });

  const unblockMutation = useMutation({
    mutationFn: async (userIdToUnblock: string) => {
      const { error } = await supabase
        .from('blocked_users')
        .delete()
        .eq('blocker_user_id', user!.id)
        .eq('blocked_user_id', userIdToUnblock);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'User has been unblocked' });
      if (user) {
        queryClient.invalidateQueries({ queryKey: queryKeys.safety.blockedUsers(user.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.curatedMatches.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.datingPool.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
      }
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to unblock user', variant: 'destructive' });
    },
  });

  const reportMutation = useMutation({
    mutationFn: async (params: { userIdToReport: string; reportType: string; reason: string; description?: string; conversationId?: string }) => {
      const { error } = await supabase
        .from('user_reports')
        .insert({
          reporter_user_id: user!.id,
          reported_user_id: params.userIdToReport,
          report_type: params.reportType,
          reason: params.reason,
          description: params.description,
          conversation_id: params.conversationId
        });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Report submitted successfully' });
      if (user) queryClient.invalidateQueries({ queryKey: queryKeys.safety.reports(user.id) });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to submit report', variant: 'destructive' });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Partial<SafetySettings>) => {
      const { data, error } = await supabase
        .from('user_safety_settings')
        .update(updates)
        .eq('user_id', user!.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({ title: 'Success', description: 'Safety settings updated' });
      if (user) {
        queryClient.setQueryData(queryKeys.safety.settings(user.id), data);
      }
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update safety settings', variant: 'destructive' });
    },
  });

  // ── Public API (preserving existing return shape) ────

  const blockUser = useCallback(
    async (userIdToBlock: string, reason?: string) => {
      if (!user) return false;
      try { await blockMutation.mutateAsync({ userIdToBlock, reason }); return true; } catch { return false; }
    },
    [user, blockMutation]
  );

  const unblockUser = useCallback(
    async (userIdToUnblock: string) => {
      if (!user) return false;
      try { await unblockMutation.mutateAsync(userIdToUnblock); return true; } catch { return false; }
    },
    [user, unblockMutation]
  );

  const isUserBlocked = useCallback(
    (userId: string): boolean => blockedUsers.some(b => b.blocked_user_id === userId),
    [blockedUsers]
  );

  const reportUser = useCallback(
    async (userIdToReport: string, reportType: string, reason: string, description?: string, conversationId?: string) => {
      if (!user) return false;
      try { await reportMutation.mutateAsync({ userIdToReport, reportType, reason, description, conversationId }); return true; } catch { return false; }
    },
    [user, reportMutation]
  );

  const updateSafetySettings = useCallback(
    async (updates: Partial<SafetySettings>) => {
      if (!user || !safetySettings) return false;
      try { await updateSettingsMutation.mutateAsync(updates); return true; } catch { return false; }
    },
    [user, safetySettings, updateSettingsMutation]
  );

  const loading = blockedLoading || reportsLoading || settingsLoading ||
    blockMutation.isPending || unblockMutation.isPending || reportMutation.isPending || updateSettingsMutation.isPending;

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
      blockedUsers: () => user && queryClient.invalidateQueries({ queryKey: queryKeys.safety.blockedUsers(user.id) }),
      userReports: () => user && queryClient.invalidateQueries({ queryKey: queryKeys.safety.reports(user.id) }),
      safetySettings: () => user && queryClient.invalidateQueries({ queryKey: queryKeys.safety.settings(user.id) }),
    }
  };
};
