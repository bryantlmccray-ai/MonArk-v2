import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'user';
  assigned_by: string;
  assigned_at: string;
  created_at: string;
  updated_at: string;
}

export interface UserAction {
  id: string;
  target_user_id: string;
  admin_user_id: string;
  action_type: 'warning' | 'suspension' | 'ban' | 'unban';
  reason: string;
  duration_hours?: number;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SafetyMetrics {
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  activeWarnings: number;
  activeSuspensions: number;
  activeBans: number;
  reportsThisWeek: number;
  reportsThisMonth: number;
}

export const useAdmin = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [safetyMetrics, setSafetyMetrics] = useState<SafetyMetrics | null>(null);

  // Check user role using the security-definer has_role function
  // This avoids trusting a client-side column read and uses server-side verification
  const checkUserRole = useCallback(async () => {
    if (!user) {
      setUserRole(null);
      setLoading(false);
      return;
    }

    try {
      // Use the server-side has_role() security definer function
      // This bypasses RLS and provides authoritative role checks
      const [adminCheck, modCheck] = await Promise.all([
        supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' }),
        supabase.rpc('has_role', { _user_id: user.id, _role: 'moderator' }),
      ]);

      if (adminCheck.error) throw adminCheck.error;
      if (modCheck.error) throw modCheck.error;

      if (adminCheck.data === true) {
        setUserRole('admin');
      } else if (modCheck.data === true) {
        setUserRole('moderator');
      } else {
        setUserRole('user');
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      // Default to unprivileged on any error — fail closed
      setUserRole('user');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Check if user is admin or moderator
  const isAdmin = useCallback(() => userRole === 'admin', [userRole]);
  const isModerator = useCallback(() => userRole === 'moderator' || userRole === 'admin', [userRole]);

  // Fetch safety metrics
  const fetchSafetyMetrics = async () => {
    if (!isModerator()) return;

    try {
      setLoading(true);
      
      const { data: reports } = await supabase
        .from('user_reports')
        .select('status, created_at');

      const { data: actions } = await supabase
        .from('user_actions')
        .select('action_type, is_active, expires_at');

      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const metrics: SafetyMetrics = {
        totalReports: reports?.length || 0,
        pendingReports: reports?.filter(r => r.status === 'pending').length || 0,
        resolvedReports: reports?.filter(r => r.status !== 'pending').length || 0,
        activeWarnings: actions?.filter(a => a.action_type === 'warning' && a.is_active).length || 0,
        activeSuspensions: actions?.filter(a => a.action_type === 'suspension' && a.is_active && (!a.expires_at || new Date(a.expires_at) > now)).length || 0,
        activeBans: actions?.filter(a => a.action_type === 'ban' && a.is_active).length || 0,
        reportsThisWeek: reports?.filter(r => new Date(r.created_at) > weekAgo).length || 0,
        reportsThisMonth: reports?.filter(r => new Date(r.created_at) > monthAgo).length || 0,
      };

      setSafetyMetrics(metrics);
    } catch (error) {
      console.error('Error fetching safety metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all reports
  const fetchAllReports = async () => {
    if (!isModerator()) return null;

    try {
      const { data, error } = await supabase
        .from('user_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: "Error",
        description: "Failed to fetch reports",
        variant: "destructive",
      });
      return null;
    }
  };

  // Update report status
  const updateReportStatus = async (reportId: string, status: string) => {
    if (!isModerator()) return false;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('user_reports')
        .update({ status })
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Report status updated",
      });

      return true;
    } catch (error) {
      console.error('Error updating report status:', error);
      toast({
        title: "Error",
        description: "Failed to update report status",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Take action against user
  const takeUserAction = async (
    targetUserId: string,
    actionType: 'warning' | 'suspension' | 'ban',
    reason: string,
    durationHours?: number
  ) => {
    if (!isModerator() || !user) return false;

    try {
      setLoading(true);
      
      const expiresAt = durationHours 
        ? new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString()
        : null;

      const { error } = await supabase
        .from('user_actions')
        .insert({
          target_user_id: targetUserId,
          admin_user_id: user.id,
          action_type: actionType,
          reason,
          duration_hours: durationHours,
          expires_at: expiresAt
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `${actionType.charAt(0).toUpperCase() + actionType.slice(1)} applied successfully`,
      });

      return true;
    } catch (error) {
      console.error('Error taking user action:', error);
      toast({
        title: "Error",
        description: "Failed to apply action",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Remove user action
  const removeUserAction = async (actionId: string) => {
    if (!isModerator()) return false;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('user_actions')
        .update({ is_active: false })
        .eq('id', actionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Action removed successfully",
      });

      return true;
    } catch (error) {
      console.error('Error removing user action:', error);
      toast({
        title: "Error",
        description: "Failed to remove action",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Fetch user actions
  const fetchUserActions = async (targetUserId?: string) => {
    if (!isModerator()) return null;

    try {
      let query = supabase
        .from('user_actions')
        .select('*')
        .order('created_at', { ascending: false });

      if (targetUserId) {
        query = query.eq('target_user_id', targetUserId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user actions:', error);
      return null;
    }
  };

  useEffect(() => {
    checkUserRole();
  }, [checkUserRole]);

  useEffect(() => {
    if (isModerator()) {
      fetchSafetyMetrics();
    }
  }, [userRole]);

  return {
    userRole,
    loading,
    isAdmin: isAdmin(),
    isModerator: isModerator(),
    safetyMetrics,
    fetchAllReports,
    updateReportStatus,
    takeUserAction,
    removeUserAction,
    fetchUserActions,
    fetchSafetyMetrics,
    refetch: {
      role: checkUserRole,
      metrics: fetchSafetyMetrics
    }
  };
};
