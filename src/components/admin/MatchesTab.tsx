import React from 'react';
import { timeAgo } from './AdminLayout';
import type { UserProfile } from './UsersTab';

export interface MatchDelivery {
  id: string;
  user_id: string;
  week_start: string;
  delivered_at: string;
  curated_count: number | null;
  pool_count: number | null;
}

export function MatchesTab({ matches, users }: { matches: MatchDelivery[]; users: UserProfile[] }) {
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
