import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { timeAgo } from './AdminLayout';

export interface WaitlistEntry {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  invited: boolean;
  first_name?: string;
  last_name?: string;
  submitted_at?: string;
  approval_status?: string;
  city?: string;
  age_range?: string;
  relationship_goal?: string;
  why_monark?: string;
}

export function WaitlistTab({ waitlist, onRefresh }: { waitlist: WaitlistEntry[]; onRefresh: () => void }) {

  async function getAdminId() {
    return (await supabase.auth.getUser()).data.user?.id;
  }

  async function approveWaitlist(id: string) {
    const { error } = await supabase.rpc('admin_approve_waitlist' as any, {
      p_admin_id: await getAdminId(),
      p_submission_id: id,
      p_notes: 'Approved via admin dashboard',
    });
    if (error) { toast.error(`Failed: ${error.message}`); return; }
    toast.success('Approved — invite queued.');
    onRefresh();
  }

  async function rejectWaitlist(id: string) {
    if (!confirm('Reject this waitlist application?')) return;
    const { error } = await supabase.rpc('admin_reject_waitlist' as any, {
      p_admin_id: await getAdminId(),
      p_submission_id: id,
      p_notes: 'Rejected via admin dashboard',
    });
    if (error) { toast.error(`Failed: ${error.message}`); return; }
    toast.success('Application rejected.');
    onRefresh();
  }

  const isPending = (w: WaitlistEntry) => !w.invited && (!w.approval_status || w.approval_status === 'pending');

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="flex px-5 py-3 bg-[#1C1F2E] text-[10px] tracking-[0.12em] uppercase text-muted-foreground font-medium">
        <span className="flex-[2]">Name</span>
        <span className="flex-[2]">Email</span>
        <span className="flex-1">Details</span>
        <span className="flex-1">Status</span>
        <span className="flex-1">Joined</span>
        <span className="flex-1">Actions</span>
      </div>
      {waitlist.map((w) => (
        <div
          key={w.id}
          className={`flex items-center px-5 py-3.5 border-b border-border/50 hover:bg-muted/30 transition-colors ${
            !isPending(w) ? 'opacity-60' : ''
          }`}
        >
          <div className="flex-[2]">
            <div className="text-[13px] font-medium text-foreground">
              {w.full_name || `${w.first_name || ''} ${w.last_name || ''}`.trim() || '—'}
            </div>
            {w.why_monark && (
              <p className="text-[11px] text-muted-foreground mt-1 italic border-l-2 border-primary pl-2 line-clamp-2">
                "{w.why_monark}"
              </p>
            )}
          </div>
          <div className="flex-[2] text-[11px] text-muted-foreground">{w.email}</div>
          <div className="flex-1">
            {w.city && <span className="text-[11px] text-muted-foreground">{w.city}</span>}
            {w.age_range && <span className="text-[11px] text-muted-foreground ml-1">· {w.age_range}</span>}
          </div>
          <div className="flex-1">
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
              w.invited || w.approval_status === 'approved'
                ? 'bg-emerald-500/15 text-emerald-600'
                : w.approval_status === 'rejected'
                  ? 'bg-destructive/15 text-destructive'
                  : 'bg-primary/15 text-primary'
            }`}>
              {w.approval_status || (w.invited ? 'Invited' : 'Pending')}
            </span>
          </div>
          <span className="flex-1 text-[13px] text-muted-foreground">
            {timeAgo(w.submitted_at || w.created_at)}
          </span>
          <div className="flex-1 flex gap-1.5">
            {isPending(w) && (
              <>
                <Button
                  size="sm"
                  onClick={() => approveWaitlist(w.id)}
                  className="text-[10px] tracking-wider uppercase rounded-full px-3 py-1 h-auto bg-[#1C1F2E] text-primary hover:bg-[#1C1F2E]/80"
                >
                  Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => rejectWaitlist(w.id)}
                  className="text-[10px] tracking-wider uppercase rounded-full px-3 py-1 h-auto border-destructive/50 text-destructive hover:bg-destructive/10"
                >
                  Reject
                </Button>
              </>
            )}
          </div>
        </div>
      ))}
      {waitlist.length === 0 && (
        <div className="py-10 text-center text-muted-foreground text-sm italic">No waitlist entries found.</div>
      )}
    </div>
  );
}
