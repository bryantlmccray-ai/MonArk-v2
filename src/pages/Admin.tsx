import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/hooks/useAuth';
import {
  AdminSidebar, AdminLoading, AdminNotAuthorized, KPICard,
  TAB_CONFIG, type TabKey,
} from '@/components/admin/AdminLayout';
import { UsersTab, type UserProfile } from '@/components/admin/UsersTab';
import { MatchesTab, type MatchDelivery } from '@/components/admin/MatchesTab';
import { WaitlistTab, type WaitlistEntry } from '@/components/admin/WaitlistTab';
import { NotificationsTab, type Notification } from '@/components/admin/NotificationsTab';
import { ReportsTab, type UserReport } from '@/components/admin/ReportsTab';

export const Admin: React.FC = () => {
  const { isAdmin, isModerator, loading: roleLoading } = useAdmin();
  const [activeTab, setActiveTab] = useState<TabKey>('users');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [matches, setMatches] = useState<MatchDelivery[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [reports, setReports] = useState<UserReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [
        { data: usersData },
        { data: matchesData },
        { data: notifData },
        { data: waitlistData },
        { data: reportsData },
      ] = await Promise.all([
        supabase
          .from('user_profiles' as any)
          .select('id, full_name, email, is_profile_complete, churn_risk, matches_viewed, matches_responded, last_active_at, created_at, age_verified, photo_url, account_status, pending_reports, onboarding_step')
          .order('created_at', { ascending: false }),
        supabase
          .from('match_delivery_log')
          .select('*')
          .order('delivered_at', { ascending: false })
          .limit(50),
        supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100),
        supabase
          .from('waitlist' as any)
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100),
        supabase
          .from('user_reports' as any)
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: false }),
      ]);

      if (usersData) setUsers(usersData as any);
      if (matchesData) setMatches(matchesData as any);
      if (notifData) setNotifications(notifData as any);
      if (waitlistData) setWaitlist(waitlistData as any);
      if (reportsData) setReports(reportsData as any);
    } catch (e) {
      console.error('Fetch error:', e);
    }
    setLoading(false);
    setLastRefresh(new Date());
  }, []);

  useEffect(() => {
    if (isAdmin || isModerator) fetchAll();
  }, [isAdmin, isModerator, fetchAll]);

  // Stats
  const totalUsers = users.length;
  const completeProfiles = users.filter((u) => u.is_profile_complete).length;
  const atRisk = users.filter((u) => ['at_risk', 'critical', 'high', 'medium'].includes(u.churn_risk)).length;
  const unreadNotifs = notifications.filter((n) => !n.read_at).length;
  const waitlistPending = waitlist.filter((w) => !w.invited && (!w.approval_status || w.approval_status === 'pending')).length;
  const pendingReports = reports.length;

  if (roleLoading) return <AdminLoading />;
  if (!isAdmin && !isModerator) return <AdminNotAuthorized />;

  const badgeCounts: Partial<Record<TabKey, number>> = {
    notifications: unreadNotifs,
    waitlist: waitlistPending,
    reports: pendingReports,
  };

  const subtitles: Record<TabKey, string> = {
    users: `${totalUsers} members · ${completeProfiles} complete profiles`,
    matches: `${matches.length} deliveries logged`,
    waitlist: `${waitlist.length} total · ${waitlistPending} pending invite`,
    notifications: `${notifications.length} total · ${unreadNotifs} unread`,
    reports: `${pendingReports} pending report${pendingReports !== 1 ? 's' : ''}`,
  };

  return (
    <div className="flex min-h-screen bg-background font-sans text-foreground">
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        badgeCounts={badgeCounts}
        onRefresh={fetchAll}
        loading={loading}
        lastRefresh={lastRefresh}
      />

      <main className="flex-1 flex flex-col min-w-0">
        <header className="px-9 pt-8 pb-6 border-b border-border/50 bg-card flex items-start justify-between gap-6">
          <div>
            <h1 className="font-serif text-[28px] font-normal text-foreground">
              {TAB_CONFIG.find(t => t.key === activeTab)?.label}
            </h1>
            <p className="text-sm text-muted-foreground mt-1 tracking-wide">
              {subtitles[activeTab]}
            </p>
          </div>
          <div className="flex gap-3">
            <KPICard label="Members" value={totalUsers} />
            <KPICard label="Complete" value={completeProfiles} />
            <KPICard label="At Risk" value={atRisk} alert={atRisk > 0} />
            <KPICard label="Waitlist" value={waitlistPending} />
            <KPICard label="Reports" value={pendingReports} alert={pendingReports > 0} />
          </div>
        </header>

        <div className="flex-1 p-7 overflow-y-auto">
          {activeTab === 'users' && <UsersTab users={users} onRefresh={fetchAll} />}
          {activeTab === 'matches' && <MatchesTab matches={matches} users={users} />}
          {activeTab === 'waitlist' && <WaitlistTab waitlist={waitlist} onRefresh={fetchAll} />}
          {activeTab === 'notifications' && <NotificationsTab notifications={notifications} users={users} />}
          {activeTab === 'reports' && <ReportsTab reports={reports} onRefresh={fetchAll} />}
        </div>
      </main>
    </div>
  );
};
