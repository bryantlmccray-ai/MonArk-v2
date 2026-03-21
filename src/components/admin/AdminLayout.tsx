import React from 'react';
import { Link } from 'react-router-dom';
import { Users, BarChart3, Bell, Clock, RefreshCw, ArrowRight, AlertTriangle, Shield } from 'lucide-react';

export type TabKey = 'users' | 'matches' | 'waitlist' | 'notifications' | 'reports';

export const TAB_CONFIG: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'users', label: 'Members', icon: <Users className="w-4 h-4" /> },
  { key: 'matches', label: 'Match Deliveries', icon: <BarChart3 className="w-4 h-4" /> },
  { key: 'waitlist', label: 'Waitlist', icon: <Clock className="w-4 h-4" /> },
  { key: 'reports', label: 'Reports', icon: <AlertTriangle className="w-4 h-4" /> },
  { key: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
];

export function AdminSidebar({
  activeTab,
  setActiveTab,
  badgeCounts,
  onRefresh,
  loading,
  lastRefresh,
}: {
  activeTab: TabKey;
  setActiveTab: (t: TabKey) => void;
  badgeCounts: Partial<Record<TabKey, number>>;
  onRefresh: () => void;
  loading: boolean;
  lastRefresh: Date;
}) {
  return (
    <aside className="w-[220px] min-w-[220px] bg-[#1C1F2E] flex flex-col sticky top-0 h-screen">
      <div className="flex items-center gap-3 px-5 py-7 border-b border-primary/10">
        <div className="w-9 h-9 rounded-full border-[1.5px] border-primary flex items-center justify-center font-serif text-sm text-primary shrink-0">
          MA
        </div>
        <div>
          <div className="font-serif text-[15px] text-[#F0EBE3] tracking-wide">MonArk</div>
          <div className="text-[10px] text-[#D9D0C5] tracking-[0.15em] uppercase mt-0.5">Command Center</div>
        </div>
      </div>

      <nav className="flex-1 p-3 flex flex-col gap-1">
        {TAB_CONFIG.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] tracking-wide w-full text-left transition-all duration-150 ${
              activeTab === tab.key
                ? 'bg-primary/15 text-primary'
                : 'text-[#D9D0C5] hover:bg-white/5'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {badgeCounts[tab.key] && badgeCounts[tab.key]! > 0 && (
              <span className="ml-auto bg-primary/80 text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full font-semibold">
                {badgeCounts[tab.key]}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="px-3 pb-2 space-y-1">
        <Link to="/admin/waitlist" className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] text-[#D9D0C5] hover:bg-white/5 transition-colors">
          <ArrowRight className="w-3 h-3" /> Waitlist Manager
        </Link>
        <Link to="/admin/analytics" className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] text-[#D9D0C5] hover:bg-white/5 transition-colors">
          <ArrowRight className="w-3 h-3" /> Analytics
        </Link>
        <Link to="/admin/curation" className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] text-[#D9D0C5] hover:bg-white/5 transition-colors">
          <ArrowRight className="w-3 h-3" /> Match Curation
        </Link>
      </div>

      <div className="px-5 py-5 border-t border-primary/10">
        <button
          onClick={onRefresh}
          disabled={loading}
          className="w-full py-2 bg-primary/10 border border-primary/25 rounded-lg text-primary text-xs tracking-wider hover:bg-primary/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
        <div className="text-[10px] text-muted-foreground text-center mt-2 tracking-wider">
          Updated {timeAgo(lastRefresh.toISOString())}
        </div>
      </div>
    </aside>
  );
}

export function AdminNotAuthorized() {
  return (
    <div className="min-h-screen bg-[#1C1F2E] flex items-center justify-center">
      <div className="text-center space-y-4 p-12">
        <div className="w-16 h-16 rounded-full border-[1.5px] border-primary flex items-center justify-center mx-auto">
          <Shield className="w-7 h-7 text-primary" />
        </div>
        <p className="font-serif text-xl text-[#F0EBE3]">This area is restricted.</p>
        <p className="text-sm text-muted-foreground">Sign in as an administrator to continue.</p>
      </div>
    </div>
  );
}

export function AdminLoading() {
  return (
    <div className="min-h-screen bg-[hsl(var(--sidebar-bg,220,15%,15%))] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-2 border-primary mx-auto animate-pulse" />
        <p className="text-muted-foreground text-sm tracking-widest">Loading command center…</p>
      </div>
    </div>
  );
}

export function KPICard({ label, value, alert }: { label: string; value: number; alert?: boolean }) {
  return (
    <div className="bg-[#1C1F2E] rounded-xl px-5 py-3 text-center min-w-[70px]">
      <div className={`font-serif text-[22px] leading-none ${alert ? 'text-destructive' : 'text-primary'}`}>
        {value}
      </div>
      <div className="text-[10px] text-muted-foreground tracking-[0.1em] uppercase mt-1">{label}</div>
    </div>
  );
}

export function timeAgo(date: string) {
  if (!date) return 'Never';
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
