import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { timeAgo } from './AdminLayout';
import { ShieldCheck } from 'lucide-react';

export interface UserReport {
  id: string;
  reporter_user_id: string;
  reported_user_id: string;
  report_type: string;
  reason: string;
  description: string;
  status: string;
  created_at: string;
}

export function ReportsTab({ reports, onRefresh }: { reports: UserReport[]; onRefresh: () => void }) {

  async function resolveReport(reportId: string) {
    const { error } = await supabase
      .from('user_reports' as any)
      .update({ status: 'resolved', updated_at: new Date().toISOString() })
      .eq('id', reportId);
    if (error) { toast.error('Failed to resolve report.'); return; }
    toast.success('Report resolved.');
    onRefresh();
  }

  if (reports.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-10 text-center">
        <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
        <p className="font-serif text-lg text-foreground">No pending reports.</p>
        <p className="text-sm text-muted-foreground mt-1">The community is healthy.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground tracking-[0.08em] uppercase">
        {reports.length} pending report{reports.length !== 1 ? 's' : ''}
      </p>
      {reports.map((r) => (
        <div key={r.id} className="bg-card rounded-xl border border-border p-5">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex gap-2 items-center mb-2">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/15 text-amber-600 uppercase tracking-wider">
                  {r.report_type}
                </span>
                <span className="text-[11px] text-muted-foreground">{timeAgo(r.created_at)}</span>
              </div>
              <p className="text-sm font-medium text-foreground">{r.reason}</p>
              {r.description && (
                <p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed">{r.description}</p>
              )}
              <p className="text-[11px] text-muted-foreground mt-2">
                Reporter: {r.reporter_user_id?.slice(0, 8)}… → Reported: {r.reported_user_id?.slice(0, 8)}…
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => resolveReport(r.id)}
              className="text-[10px] tracking-wider uppercase rounded-full px-4 bg-[#1C1F2E] text-primary hover:bg-[#1C1F2E]/80 shrink-0"
            >
              Resolve
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
