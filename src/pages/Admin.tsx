import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  Users, BarChart3, Bell, Clock, RefreshCw,
  Search, Shield, ArrowRight, ChevronRight
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  is_profile_complete: boolean;
  churn_risk: string;
  matches_viewed: number;
  matches_responded: number;
  last_active_at: string;
  created_at: string;
  age_verified: boolean;
  photo_url: string | null;
}

interface MatchDelivery {
  id: string;
  user_id: string;
  week_start: string;
  delivered_at: string;
  curated_count: number | null;
  pool_count: number | null;
}

interface Notification {
  id: string;
  user_id: string;
  type: string;
  message: string;
  read_at: string | null;
  created_at: string;
}

interface WaitlistEntry {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  invited: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const timeAgo = (date: string) => {
  if (!date) return 'Never';
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

type TabKey = 'users' | 'matches' | 'waitlist' | 'notifications';

const TAB_CONFIG: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'users', label: 'Members', icon: <Users className="w-4 h-4" /> },
  { key: 'matches', label: 'Match Deliveries', icon: <BarChart3 className="w-4 h-4" /> },
  { key: 'waitlist', label: 'Waitlist', icon: <Clock className="w-4 h-4" /> },
  { key: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export const Admin: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin, isModerator, loading: roleLoading } = useAdmin();
  const [activeTab, setActiveTab] = useState<TabKey>('users');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [matches, setMatches] = useState<MatchDelivery[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
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
      ] = await Promise.all([
        supabase
          .from('user_profiles' as any)
          .select('id, full_name, email, is_profile_complete, churn_risk, matches_viewed, matches_responded, last_active_at, created_at, age_verified, photo_url')
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
      ]);

      if (usersData) setUsers(usersData as any);
      if (matchesData) setMatches(matchesData as any);
      if (notifData) setNotifications(notifData as any);
      if (waitlistData) setWaitlist(waitlistData as any);
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
  const atRisk = users.filter((u) => u.churn_risk === 'at_risk' || u.churn_risk === 'critical').length;
  const unreadNotifs = notifications.filter((n) => !n.read_at).length;
  const waitlistPending = waitlist.filter((w) => !w.invited).length;

  // ── Not authorized ─────────────────────────────────────────────────────────
  if (roleLoading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--sidebar-bg,220,15%,15%))] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-primary mx-auto animate-pulse" />
          <p className="text-muted-foreground text-sm tracking-widest">Loading command center…</p>
        </div>
      </div>
    );
  }

  if (!isAdmin && !isModerator) {
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

  return (
    <div className="flex min-h-screen bg-background font-sans text-foreground">
      {/* Sidebar */}
      <aside className="w-[220px] min-w-[220px] bg-[#1C1F2E] flex flex-col sticky top-0 h-screen">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-7 border-b border-primary/10">
          <div className="w-9 h-9 rounded-full border-[1.5px] border-primary flex items-center justify-center font-serif text-sm text-primary shrink-0">
            MA
          </div>
          <div>
            <div className="font-serif text-[15px] text-[#F0EBE3] tracking-wide">MonArk</div>
            <div className="text-[10px] text-[#D9D0C5] tracking-[0.15em] uppercase mt-0.5">Command Center</div>
          </div>
        </div>

        {/* Nav */}
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
              {tab.key === 'notifications' && unreadNotifs > 0 && (
                <span className="ml-auto bg-primary/80 text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full font-semibold">
                  {unreadNotifs}
                </span>
              )}
              {tab.key === 'waitlist' && waitlistPending > 0 && (
                <span className="ml-auto bg-primary/80 text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full font-semibold">
                  {waitlistPending}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Quick links */}
        <div className="px-3 pb-2 space-y-1">
          <Link
            to="/admin/waitlist"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] text-[#D9D0C5] hover:bg-white/5 transition-colors"
          >
            <ArrowRight className="w-3 h-3" />
            Waitlist Manager
          </Link>
          <Link
            to="/admin/analytics"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] text-[#D9D0C5] hover:bg-white/5 transition-colors"
          >
            <ArrowRight className="w-3 h-3" />
            Analytics
          </Link>
          <Link
            to="/admin/curation"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] text-[#D9D0C5] hover:bg-white/5 transition-colors"
          >
            <ArrowRight className="w-3 h-3" />
            Match Curation
          </Link>
        </div>

        {/* Refresh */}
        <div className="px-5 py-5 border-t border-primary/10">
          <button
            onClick={fetchAll}
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

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="px-9 pt-8 pb-6 border-b border-border/50 bg-card flex items-start justify-between gap-6">
          <div>
            <h1 className="font-serif text-[28px] font-normal text-foreground">
              {TAB_CONFIG.find(t => t.key === activeTab)?.label}
            </h1>
            <p className="text-sm text-muted-foreground mt-1 tracking-wide">
              {activeTab === 'users' && `${totalUsers} members · ${completeProfiles} complete profiles`}
              {activeTab === 'matches' && `${matches.length} deliveries logged`}
              {activeTab === 'waitlist' && `${waitlist.length} total · ${waitlistPending} pending invite`}
              {activeTab === 'notifications' && `${notifications.length} total · ${unreadNotifs} unread`}
            </p>
          </div>

          {/* KPI strip */}
          <div className="flex gap-3">
            <KPICard label="Members" value={totalUsers} />
            <KPICard label="Complete" value={completeProfiles} />
            <KPICard label="At Risk" value={atRisk} alert={atRisk > 0} />
            <KPICard label="Waitlist" value={waitlistPending} />
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-7 overflow-y-auto">
          {activeTab === 'users' && <UsersTab users={users} />}
          {activeTab === 'matches' && <MatchesTab matches={matches} users={users} />}
          {activeTab === 'waitlist' && <WaitlistTab waitlist={waitlist} />}
          {activeTab === 'notifications' && <NotificationsTab notifications={notifications} users={users} />}
        </div>
      </main>
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function KPICard({ label, value, alert }: { label: string; value: number; alert?: boolean }) {
  return (
    <div className="bg-[#1C1F2E] rounded-xl px-5 py-3 text-center min-w-[70px]">
      <div className={`font-serif text-[22px] leading-none ${alert ? 'text-destructive' : 'text-primary'}`}>
        {value}
      </div>
      <div className="text-[10px] text-muted-foreground tracking-[0.1em] uppercase mt-1">{label}</div>
    </div>
  );
}

function UsersTab({ users }: { users: UserProfile[] }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = users.filter((u) => {
    const matchSearch =
      !search ||
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all' ||
      (filter === 'complete' && u.is_profile_complete) ||
      (filter === 'incomplete' && !u.is_profile_complete) ||
      (filter === 'at_risk' && (u.churn_risk === 'at_risk' || u.churn_risk === 'critical'));
    return matchSearch && matchFilter;
  });

  const riskVariant = (risk: string) => {
    if (risk === 'critical') return 'bg-destructive/15 text-destructive';
    if (risk === 'at_risk') return 'bg-amber-500/15 text-amber-600';
    if (risk === 'healthy') return 'bg-emerald-500/15 text-emerald-600';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search members…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 min-w-[220px] bg-card border-border"
          />
        </div>
        <div className="flex gap-1.5">
          {['all', 'complete', 'incomplete', 'at_risk'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-full text-xs capitalize tracking-wide border transition-colors ${
                filter === f
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:border-primary/50'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="flex px-5 py-3 bg-[#1C1F2E] text-[10px] tracking-[0.12em] uppercase text-muted-foreground font-medium">
          <span className="flex-[2]">Member</span>
          <span className="flex-1">Status</span>
          <span className="flex-1">Churn Risk</span>
          <span className="flex-1">Viewed</span>
          <span className="flex-1">Responded</span>
          <span className="flex-1">Last Active</span>
          <span className="flex-1">Joined</span>
        </div>
        {filtered.map((u) => (
          <div key={u.id} className="flex items-center px-5 py-3.5 border-b border-border/50 hover:bg-muted/30 transition-colors">
            <div className="flex-[2]">
              <div className="text-[13px] font-medium text-foreground">{u.full_name || '—'}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{u.email || '—'}</div>
            </div>
            <div className="flex-1">
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                u.is_profile_complete ? 'bg-emerald-500/15 text-emerald-600' : 'bg-muted text-muted-foreground'
              }`}>
                {u.is_profile_complete ? 'Complete' : 'Incomplete'}
              </span>
            </div>
            <div className="flex-1">
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium ${riskVariant(u.churn_risk)}`}>
                {u.churn_risk ? u.churn_risk.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Unknown'}
              </span>
            </div>
            <span className="flex-1 text-[13px] text-muted-foreground">{u.matches_viewed ?? 0}</span>
            <span className="flex-1 text-[13px] text-muted-foreground">{u.matches_responded ?? 0}</span>
            <span className="flex-1 text-[13px] text-muted-foreground">{timeAgo(u.last_active_at)}</span>
            <span className="flex-1 text-[13px] text-muted-foreground">{timeAgo(u.created_at)}</span>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-10 text-center text-muted-foreground text-sm italic">No members match this filter.</div>
        )}
      </div>
    </div>
  );
}

function MatchesTab({ matches, users }: { matches: MatchDelivery[]; users: UserProfile[] }) {
  const userMap = Object.fromEntries(users.map((u) => [u.id, u.full_name || u.email]));

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="flex px-5 py-3 bg-[#1C1F2E] text-[10px] tracking-[0.12em] uppercase text-muted-foreground font-medium">
        <span className="flex-[2]">Member</span>
        <span className="flex-1">Week</span>
        <span className="flex-1">Curated</span>
        <span className="flex-1">Pool</span>
        <span className="flex-1">Delivered</span>
      </div>
      {matches.map((m) => (
        <div key={m.id} className="flex items-center px-5 py-3.5 border-b border-border/50 hover:bg-muted/30 transition-colors">
          <div className="flex-[2] text-[13px] font-medium text-foreground">
            {userMap[m.user_id] || m.user_id.slice(0, 8) + '…'}
          </div>
          <span className="flex-1 text-[13px] text-muted-foreground">
            {m.week_start ? new Date(m.week_start).toLocaleDateString() : '—'}
          </span>
          <span className="flex-1 text-[13px] text-muted-foreground">{m.curated_count ?? '—'}</span>
          <span className="flex-1 text-[13px] text-muted-foreground">{m.pool_count ?? '—'}</span>
          <span className="flex-1 text-[13px] text-muted-foreground">{timeAgo(m.delivered_at)}</span>
        </div>
      ))}
      {matches.length === 0 && (
        <div className="py-10 text-center text-muted-foreground text-sm italic">
          No match deliveries yet. First run fires Monday 8am CT.
        </div>
      )}
    </div>
  );
}

function WaitlistTab({ waitlist }: { waitlist: WaitlistEntry[] }) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="flex px-5 py-3 bg-[#1C1F2E] text-[10px] tracking-[0.12em] uppercase text-muted-foreground font-medium">
        <span className="flex-[2]">Name</span>
        <span className="flex-[2]">Email</span>
        <span className="flex-1">Status</span>
        <span className="flex-1">Joined</span>
      </div>
      {waitlist.map((w) => (
        <div key={w.id} className="flex items-center px-5 py-3.5 border-b border-border/50 hover:bg-muted/30 transition-colors">
          <div className="flex-[2] text-[13px] font-medium text-foreground">{w.full_name || '—'}</div>
          <div className="flex-[2] text-[11px] text-muted-foreground">{w.email}</div>
          <div className="flex-1">
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
              w.invited ? 'bg-emerald-500/15 text-emerald-600' : 'bg-primary/15 text-primary'
            }`}>
              {w.invited ? 'Invited' : 'Pending'}
            </span>
          </div>
          <span className="flex-1 text-[13px] text-muted-foreground">{timeAgo(w.created_at)}</span>
        </div>
      ))}
      {waitlist.length === 0 && (
        <div className="py-10 text-center text-muted-foreground text-sm italic">No waitlist entries found.</div>
      )}
    </div>
  );
}

function NotificationsTab({ notifications, users }: { notifications: Notification[]; users: UserProfile[] }) {
  const userMap = Object.fromEntries(users.map((u) => [u.id, u.full_name || u.email]));

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="flex px-5 py-3 bg-[#1C1F2E] text-[10px] tracking-[0.12em] uppercase text-muted-foreground font-medium">
        <span className="flex-[2]">Member</span>
        <span className="flex-1">Type</span>
        <span className="flex-[3]">Message</span>
        <span className="flex-1">Read</span>
        <span className="flex-1">Sent</span>
      </div>
      {notifications.map((n) => (
        <div key={n.id} className={`flex items-center px-5 py-3.5 border-b border-border/50 hover:bg-muted/30 transition-colors ${n.read_at ? 'opacity-60' : ''}`}>
          <div className="flex-[2] text-[13px] font-medium text-foreground">
            {userMap[n.user_id] || n.user_id?.slice(0, 8) + '…'}
          </div>
          <div className="flex-1">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground">
              {n.type}
            </span>
          </div>
          <div className="flex-[3] text-[13px] text-muted-foreground truncate">{n.message}</div>
          <div className="flex-1">
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
              n.read_at ? 'bg-emerald-500/15 text-emerald-600' : 'bg-destructive/15 text-destructive'
            }`}>
              {n.read_at ? 'Read' : 'Unread'}
            </span>
          </div>
          <span className="flex-1 text-[13px] text-muted-foreground">{timeAgo(n.created_at)}</span>
        </div>
      ))}
      {notifications.length === 0 && (
        <div className="py-10 text-center text-muted-foreground text-sm italic">No notifications sent yet.</div>
      )}
    </div>
  );
}
