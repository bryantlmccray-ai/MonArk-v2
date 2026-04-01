import React, { useState, useCallback } from 'react';
import { AdminSidebar, AdminNotAuthorized, AdminLoading, KPICard, timeAgo, type TabKey } from './AdminLayout';
import { UsersTab } from './UsersTab';
import { MatchesTab } from './MatchesTab';
import { WaitlistTab } from './WaitlistTab';
import { NotificationsTab } from './NotificationsTab';
import { ReportsTab } from './ReportsTab';
import { useAdmin } from '@/hooks/useAdmin';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('users');
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const { isAdmin, loading, safetyMetrics } = useAdmin();

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setLastRefresh(new Date());
    // Allow children to react to the timestamp change, then clear spinner
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  if (loading) return <AdminLoading />;
  if (!isAdmin) return <AdminNotAuthorized />;

  const badgeCounts: Partial<Record<TabKey, number>> = {
    reports: safetyMetrics?.pendingReports ?? 0,
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'users':
        return <UsersTab />;
      case 'matches':
        return <MatchesTab />;
      case 'waitlist':
        return <WaitlistTab />;
      case 'notifications':
        return <NotificationsTab />;
      case 'reports':
        return <ReportsTab />;
      default:
        return <UsersTab />;
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
