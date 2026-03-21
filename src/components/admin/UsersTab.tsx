import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { timeAgo } from './AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UserProfile {
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
  account_status?: string;
  pending_reports?: number;
  onboarding_step?: number;
}

function riskVariant(risk: string) {
  if (risk === 'critical' || risk === 'high') return 'bg-destructive/15 text-destructive';
  if (risk === 'at_risk' || risk === 'medium') return 'bg-amber-500/15 text-amber-600';
  if (risk === 'healthy' || risk === 'none' || risk === 'low') return 'bg-emerald-500/15 text-emerald-600';
  return 'bg-muted text-muted-foreground';
}

function statusVariant(status: string) {
  if (status === 'suspended') return 'bg-destructive/15 text-destructive';
  if (status === 'flagged') return 'bg-amber-500/15 text-amber-600';
  return 'bg-emerald-500/15 text-emerald-600';
}

export function UsersTab({ users, onRefresh }: { users: UserProfile[]; onRefresh: () => void }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const filtered = users.filter((u) => {
    const matchSearch =
      !search ||
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all' ||
      (filter === 'complete' && u.is_profile_complete) ||
      (filter === 'incomplete' && !u.is_profile_complete) ||
      (filter === 'at_risk' && (u.churn_risk === 'at_risk' || u.churn_risk === 'critical' || u.churn_risk === 'high' || u.churn_risk === 'medium')) ||
      (filter === 'flagged' && u.account_status === 'flagged') ||
      (filter === 'suspended' && u.account_status === 'suspended');
    return matchSearch && matchFilter;
  });

  async function getAdminId() {
    return (await supabase.auth.getUser()).data.user?.id;
  }

  async function suspendUser(userId: string) {
    if (!confirm('Suspend this user? They will lose access to their account.')) return;
    setActionLoading(userId);
    const { error } = await supabase.rpc('admin_suspend_user' as any, {
      p_admin_id: await getAdminId(),
      p_target_user_id: userId,
      p_reason: 'Admin action via dashboard',
      p_duration_hours: null,
    });
    setActionLoading(null);
    if (error) { toast.error(`Failed: ${error.message}`); return; }
    toast.success('User suspended.');
    onRefresh();
  }

  async function unsuspendUser(userId: string) {
    setActionLoading(userId);
    const { error } = await supabase.rpc('admin_unsuspend_user' as any, {
      p_admin_id: await getAdminId(),
      p_target_user_id: userId,
    });
    setActionLoading(null);
    if (error) { toast.error(`Failed: ${error.message}`); return; }
    toast.success('User reinstated.');
    onRefresh();
  }

  async function flagUser(userId: string) {
    setActionLoading(userId);
    const { error } = await supabase.rpc('admin_flag_user' as any, {
      p_admin_id: await getAdminId(),
      p_target_user_id: userId,
      p_reason: 'Flagged for review via dashboard',
    });
    setActionLoading(null);
    if (error) { toast.error(`Failed: ${error.message}`); return; }
    toast.success('User flagged for review.');
    onRefresh();
  }

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
        <div className="flex gap-1.5 flex-wrap">
          {['all', 'complete', 'incomplete', 'at_risk', 'flagged', 'suspended'].map((f) => (
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
          <span className="w-8" />
        </div>
        {filtered.map((u) => (
          <div key={u.id}>
            <div
              className="flex items-center px-5 py-3.5 border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer"
              onClick={() => setExpandedUser(expandedUser === u.id ? null : u.id)}
            >
              <div className="flex-[2]">
                <div className="text-[13px] font-medium text-foreground">{u.full_name || '—'}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{u.email || '—'}</div>
              </div>
              <div className="flex-1">
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                  u.account_status ? statusVariant(u.account_status) :
                  u.is_profile_complete ? 'bg-emerald-500/15 text-emerald-600' : 'bg-muted text-muted-foreground'
                }`}>
                  {u.account_status
                    ? u.account_status.charAt(0).toUpperCase() + u.account_status.slice(1)
                    : u.is_profile_complete ? 'Complete' : 'Incomplete'}
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
              <div className="w-8 flex items-center justify-center">
                {expandedUser === u.id
                  ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </div>
            </div>

            {/* Expanded detail panel */}
            {expandedUser === u.id && (
              <div className="px-5 py-4 bg-muted/20 border-b border-border/50">
                <div className="flex gap-8 mb-4 flex-wrap">
                  {[
                    ['Matches Viewed', u.matches_viewed ?? 0],
                    ['Matches Responded', u.matches_responded ?? 0],
                    ['Profile Complete', u.is_profile_complete ? 'Yes' : 'No'],
                    ['Age Verified', u.age_verified ? 'Yes' : 'No'],
                    ['Member Since', u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'],
                  ].map(([label, value]) => (
                    <div key={label as string}>
                      <p className="text-[10px] tracking-[0.12em] uppercase text-primary mb-1">{label}</p>
                      <p className="text-sm font-medium text-foreground">{String(value)}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {u.account_status !== 'suspended' ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); suspendUser(u.id); }}
                      disabled={actionLoading === u.id}
                      className="text-xs tracking-wider uppercase rounded-full px-5"
                    >
                      Suspend
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); unsuspendUser(u.id); }}
                      disabled={actionLoading === u.id}
                      className="text-xs tracking-wider uppercase rounded-full px-5 bg-emerald-600 hover:bg-emerald-700"
                    >
                      Reinstate
                    </Button>
                  )}
                  {u.account_status !== 'flagged' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); flagUser(u.id); }}
                      disabled={actionLoading === u.id}
                      className="text-xs tracking-wider uppercase rounded-full px-5 border-amber-500 text-amber-600 hover:bg-amber-500/10"
                    >
                      Flag for Review
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-10 text-center text-muted-foreground text-sm italic">No members match this filter.</div>
        )}
      </div>
    </div>
  );
}
