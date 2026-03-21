import React from 'react';
import { timeAgo } from './AdminLayout';
import type { UserProfile } from './UsersTab';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  message: string;
  read_at: string | null;
  created_at: string;
}

export function NotificationsTab({ notifications, users }: { notifications: Notification[]; users: UserProfile[] }) {
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
