import React, { useState, useCallback, useEffect } from 'react';
import { AdminSidebar, AdminNotAuthorized, AdminLoading, KPICard, timeAgo, type TabKey } from './AdminLayout';
import { UsersTab, type UserProfile } from './UsersTab';
import { MatchesTab, type MatchDelivery } from './MatchesTab';
import { WaitlistTab, type WaitlistEntry } from './WaitlistTab';
import { NotificationsTab, type Notification } from './NotificationsTab';
import { ReportsTab, type UserReport } from './ReportsTab';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('users');
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [matches, setMatches] = useState<MatchDelivery[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [reports, setReports] = useState<UserReport[]>([]);

  const { isAdmin, loading, safetyMetrics } = useAdmin();

  const fetchData = useCallback(async () => {
    setRefreshing(true);
    try {
      const [usersRes, matchesRes, waitlistRes, notificationsRes, reportsRes] = await Promise.all([
        supabase.from('user_profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('match_delivery_log').select('*').order('delivered_at', { ascending: false }).limit(100),
        supabase.from('waitlist_entries' as any).select('*').order('created_at', { ascending: false }),
        supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('user_reports' as any).select('*').order('created_at', { ascending: false }),
      ]);

      if (usersRes.data) setUsers(usersRes.data as unknown as UserProfile[]);
      if (matchesRes.data) setMatches(matchesRes.data as unknown as MatchDelivery[]);
      if (waitlistRes.data) setWaitlist(waitlistRes.data as unknown as WaitlistEntry[]);
      if (notificationsRes.data) setNotifications(notificationsRes.data as unknown as Notification[]);
      if (reportsRes.data) setReports(reportsRes.data as unknown as UserReport[]);
    } catch (e) {
      console.error('Admin data fetch error:', e);
    } finally {
      setRefreshing(false);
      setLastRefresh(new Date());
    }
  }, []);

  useEffect(() => {
    if (isAdmin) fetchData();
  }, [isAdmin, fetchData]);

  const handleRefresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <AdminLoading />;
  if (!isAdmin) return <AdminNotAuthorized />;

  const badgeCounts: Partial<Record<TabKey, number>> = {
    reports: safetyMetrics?.pendingReports ?? 0,
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'users':
        return <UsersTab users={users} onRefresh={handleRefresh} />;
      case 'matches':
        return <MatchesTab matches={matches} users={users} />;
      case 'waitlist':
        return <WaitlistTab waitlist={waitlist} onRefresh={handleRefresh} />;
      case 'notifications':
        return <NotificationsTab notifications={notifications} users={users} />;
      case 'reports':
        return <ReportsTab reports={reports} onRefresh={handleRefresh} />;
      default:
        return <UsersTab users={users} onRefresh={handleRefresh} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#14161F] flex">
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        badgeCounts={badgeCounts}
        onRefresh={handleRefresh}
        loading={refreshing}
        lastRefresh={lastRefresh}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="px-8 py-6 border-b border-primary/10 flex items-center gap-4">
          <KPICard label="Pending Reports" value={safetyMetrics?.pendingReports ?? 0} alert={(safetyMetrics?.pendingReports ?? 0) > 0} />
          <KPICard label="Active Suspensions" value={safetyMetrics?.activeSuspensions ?? 0} />
          <KPICard label="This Week" value={safetyMetrics?.reportsThisWeek ?? 0} />
        </div>

        <div className="p-8">
          {renderTab()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
