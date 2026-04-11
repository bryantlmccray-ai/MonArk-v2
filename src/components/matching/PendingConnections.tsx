import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Clock, Heart, Hourglass, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PendingEntry {
  id: string;
  match_user_id: string;
  name: string;
  photo?: string;
  compatibility_score?: number;
  match_reason?: string;
  status: 'pending' | 'accepted' | 'passed' | 'admin_rejected' | 'admin_approved';
  created_at: string;
  source: 'curated' | 'discover';
}

async function fetchPendingConnections(userId: string): Promise<PendingEntry[]> {
  // Curated matches where this user accepted but the other hasn’t responded
  const { data: curated } = await supabase
    .from('curated_matches' as any)
    .select('id, match_user_id, compatibility_score, match_reason, status, created_at')
    .eq('user_id', userId)
    .eq('status', 'accepted'); // user accepted, waiting on other side

  // Discover interests where the user expressed interest (no instant match)
  const { data: interests } = await supabase
    .from('discover_interests' as any)
    .select('id, target_user_id, created_at')
    .eq('user_id', userId)
    .eq('skipped', false)
    .order('created_at', { ascending: false })
    .limit(20);

  const allUserIds = [
    ...(curated ?? []).map((c: any) => c.match_user_id),
    ...(interests ?? []).map((i: any) => i.target_user_id),
  ];
  if (allUserIds.length === 0) return [];

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name')
    .in('id', allUserIds);

  const { data: userProfiles } = await supabase
    .from('user_profiles')
    .select('user_id, photos')
    .in('user_id', allUserIds);

  const nameMap = Object.fromEntries((profiles ?? []).map((p: any) => [p.id, p.name]));
  const photoMap = Object.fromEntries((userProfiles ?? []).map((p: any) => [p.user_id, p.photos?.[0]]));

  const curatedEntries: PendingEntry[] = (curated ?? []).map((c: any) => ({
    id: c.id,
    match_user_id: c.match_user_id,
    name: nameMap[c.match_user_id] || 'Member',
    photo: photoMap[c.match_user_id],
    compatibility_score: c.compatibility_score,
    match_reason: c.match_reason,
    status: c.status,
    created_at: c.created_at,
    source: 'curated' as const,
  }));

  const interestEntries: PendingEntry[] = (interests ?? []).map((i: any) => ({
    id: i.id,
    match_user_id: i.target_user_id,
    name: nameMap[i.target_user_id] || 'Member',
    photo: photoMap[i.target_user_id],
    status: 'pending' as const,
    created_at: i.created_at,
    source: 'discover' as const,
  }));

  // Merge, dedupe by match_user_id (curated takes priority), sort newest first
  const seen = new Set<string>();
  return [...curatedEntries, ...interestEntries]
    .filter(e => { if (seen.has(e.match_user_id)) return false; seen.add(e.match_user_id); return true; })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

function StatusPill({ source, status }: { source: 'curated' | 'discover'; status: string }) {
  if (source === 'curated' && status === 'accepted') {
    return (
      <Badge className="bg-amber-500/10 text-amber-700 border-amber-500/30 text-[10px] flex items-center gap-1">
        <Hourglass className="w-2.5 h-2.5" />
        Awaiting their response
      </Badge>
    );
  }
  if (source === 'discover') {
    return (
      <Badge className="bg-primary/10 text-primary border-primary/30 text-[10px] flex items-center gap-1">
        <Heart className="w-2.5 h-2.5" />
        Interest noted for Sunday
      </Badge>
    );
  }
  return null;
}

export const PendingConnections: React.FC = () => {
  const { user } = useAuth();

  const { data: pending = [], isLoading } = useQuery({
    queryKey: ['pending-connections', user?.id],
    queryFn: () => fetchPendingConnections(user!.id),
    enabled: !!user,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  if (isLoading) return <div className="flex justify-center py-8"><LoadingSpinner /></div>;
  if (pending.length === 0) return null; // hide section if nothing pending

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">Pending Connections</h3>
        <Badge variant="outline" className="text-[10px] ml-auto">{pending.length}</Badge>
      </div>
      <p className="text-xs text-muted-foreground -mt-1">
        People you’ve expressed interest in. If they’re interested too, Sunday’s picks will reflect that.
      </p>
      <div className="space-y-2">
        {pending.map((entry, i) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50"
          >
            <Avatar className="w-10 h-10 shrink-0">
              <AvatarImage src={entry.photo} />
              <AvatarFallback className="bg-muted text-foreground/60 text-sm font-serif">
                {entry.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium text-sm text-foreground">{entry.name}</p>
                {entry.compatibility_score && (
                  <span className="text-[10px] text-muted-foreground">
                    {Math.round(entry.compatibility_score * 100)}% match
                  </span>
                )}
              </div>
              {entry.match_reason && (
                <p className="text-xs text-muted-foreground truncate mt-0.5 italic">
                  “{entry.match_reason}”
                </p>
              )}
              <div className="mt-1.5">
                <StatusPill source={entry.source} status={entry.status} />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground/60 shrink-0">
              {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
