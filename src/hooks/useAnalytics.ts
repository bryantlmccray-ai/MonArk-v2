import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface KPISnapshot {
  id: string;
  snapshot_date: string;
  total_users: number;
  active_users_daily: number;
  active_users_weekly: number;
  active_users_monthly: number;
  weekly_options_view_rate: number;
  match_to_date_rate: number;
  week2_retention_rate: number;
  week4_retention_rate: number;
  week8_retention_rate: number;
  created_at: string;
}

export interface AnalyticsSummary {
  totalUsers: number;
  activeUsersDaily: number;
  activeUsersWeekly: number;
  activeUsersMonthly: number;
  weeklyOptionsViewRate: number;
  matchToDateRate: number;
  retentionWeek2: number;
  retentionWeek4: number;
  retentionWeek8: number;
}

export interface RetentionCohort {
  cohortWeek: string;
  week0: number;
  week2: number;
  week4: number;
  week8: number;
}

export function useAnalytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [kpiSnapshots, setKpiSnapshots] = useState<KPISnapshot[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);

  const fetchKPISnapshots = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('kpi_snapshots')
        .select('*')
        .order('snapshot_date', { ascending: false })
        .limit(30);

      if (error) throw error;
      
      const snapshots = (data || []) as unknown as KPISnapshot[];
      setKpiSnapshots(snapshots);
      
      // Set summary from latest snapshot
      if (snapshots.length > 0) {
        const latest = snapshots[0];
        setSummary({
          totalUsers: latest.total_users,
          activeUsersDaily: latest.active_users_daily,
          activeUsersWeekly: latest.active_users_weekly,
          activeUsersMonthly: latest.active_users_monthly,
          weeklyOptionsViewRate: Number(latest.weekly_options_view_rate),
          matchToDateRate: Number(latest.match_to_date_rate),
          retentionWeek2: Number(latest.week2_retention_rate),
          retentionWeek4: Number(latest.week4_retention_rate),
          retentionWeek8: Number(latest.week8_retention_rate),
        });
      }
    } catch (error) {
      console.error('Error fetching KPI snapshots:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const calculateLiveMetrics = useCallback(async () => {
    if (!user) return null;
    
    try {
      // Get total user profiles count
      const { count: totalProfiles } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });

      // Get users with sessions in last 24h
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { count: dailyActive } = await supabase
        .from('user_sessions')
        .select('user_id', { count: 'exact', head: true })
        .gte('session_start', yesterday.toISOString());

      // Get weekly options engagement
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      
      const { data: engagementData } = await supabase
        .from('weekly_options_engagement')
        .select('options_viewed')
        .gte('week_start', weekStart.toISOString().split('T')[0]);

      const viewRate = engagementData && totalProfiles 
        ? (engagementData.filter(e => e.options_viewed > 0).length / Math.max(totalProfiles, 1)) * 100
        : 0;

      // Get match to date conversion
      const { data: conversions } = await supabase
        .from('match_conversions')
        .select('conversion_status');

      const totalMatches = conversions?.length || 0;
      const completedDates = conversions?.filter(c => c.conversion_status === 'date_completed').length || 0;
      const matchToDateRate = totalMatches > 0 ? (completedDates / totalMatches) * 100 : 0;

      return {
        totalUsers: totalProfiles || 0,
        activeUsersDaily: dailyActive || 0,
        weeklyOptionsViewRate: viewRate,
        matchToDateRate,
      };
    } catch (error) {
      console.error('Error calculating live metrics:', error);
      return null;
    }
  }, [user]);

  const recordSession = useCallback(async () => {
    if (!user) return;
    
    try {
      await supabase
        .from('user_sessions')
        .insert({
          user_id: user.id,
          device_type: /mobile/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
        });
    } catch (error) {
      console.error('Error recording session:', error);
    }
  }, [user]);

  const recordWeeklyOptionsView = useCallback(async () => {
    if (!user) return;
    
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekStartStr = weekStart.toISOString().split('T')[0];
    
    try {
      const { data: existing } = await supabase
        .from('weekly_options_engagement')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_start', weekStartStr)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('weekly_options_engagement')
          .update({
            options_viewed: (existing.options_viewed || 0) + 1,
            viewed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('weekly_options_engagement')
          .insert({
            user_id: user.id,
            week_start: weekStartStr,
            options_viewed: 1,
            viewed_at: new Date().toISOString()
          });
      }
    } catch (error) {
      console.error('Error recording weekly options view:', error);
    }
  }, [user]);

  const updateMatchConversion = useCallback(async (
    conversationId: string,
    matchUserId: string,
    status: 'messaging' | 'date_proposed' | 'date_completed'
  ) => {
    if (!user) return;
    
    try {
      const { data: existing } = await supabase
        .from('match_conversions')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id)
        .maybeSingle();

      const updateData: Record<string, string> = {
        conversion_status: status,
        updated_at: new Date().toISOString()
      };

      if (status === 'messaging' && !existing?.first_message_at) {
        updateData.first_message_at = new Date().toISOString();
      }
      if (status === 'date_proposed' && !existing?.date_proposed_at) {
        updateData.date_proposed_at = new Date().toISOString();
      }
      if (status === 'date_completed' && !existing?.date_completed_at) {
        updateData.date_completed_at = new Date().toISOString();
      }

      if (existing) {
        await supabase
          .from('match_conversions')
          .update(updateData)
          .eq('id', existing.id);
      } else {
        await supabase
          .from('match_conversions')
          .insert({
            user_id: user.id,
            match_user_id: matchUserId,
            conversation_id: conversationId,
            conversion_status: status,
            ...updateData
          });
      }
    } catch (error) {
      console.error('Error updating match conversion:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchKPISnapshots();
    }
  }, [user, fetchKPISnapshots]);

  return {
    loading,
    kpiSnapshots,
    summary,
    fetchKPISnapshots,
    calculateLiveMetrics,
    recordSession,
    recordWeeklyOptionsView,
    updateMatchConversion,
  };
}
