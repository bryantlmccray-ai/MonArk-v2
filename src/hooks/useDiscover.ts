import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { DiscoverInterestInsert } from '@/integrations/supabase/types.extended';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

// ── Daily cap: 8 profiles per day ─────────────────────────────────────────────
const DAILY_CAP = 8;

export interface DiscoverProfile {
  user_id: string;
  name: string;
  age?: number;
  location?: string;
  bio?: string;
  occupation?: string;
  photos: string[];
  interests: string[];
  compatibility_score?: number;
}

// ── Local today key for cap tracking ──────────────────────────────────────────
function todayKey() { return 'monark_discover_count_' + new Date().toISOString().split('T')[0]; }
function getViewedToday(): number { try { return parseInt(localStorage.getItem(todayKey()) || '0', 10); } catch { return 0; } }
function incrementViewedToday(): number {
  const next = getViewedToday() + 1;
  try { localStorage.setItem(todayKey(), String(next)); } catch {}
  return next;
}

// ── Fetch profiles not yet seen or interacted with ────────────────────────────
async function fetchDiscoverPool(userId: string): Promise<DiscoverProfile[]> {
  const [{ data: interests }, { data: matches }, { data: pool }] = await Promise.all([
    // discover_interests and curated_matches are not yet in generated types —
    // using (supabase.from as any) until supabase gen types is re-run.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from as any)('discover_interests').select('target_user_id').eq('user_id', userId),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from as any)('curated_matches').select('match_user_id').eq('user_id', userId),
    supabase.from('dating_pool').select('pool_user_id').eq('user_id', userId),
  ]);

  const seenIds: string[] = [
    userId,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(interests ?? []).map((r: any) => r.target_user_id),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(matches ?? []).map((r: any) => r.match_user_id),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(pool ?? []).map((r: any) => r.pool_user_id),
  ];

  const { data: profiles, error } = await supabase
    .from('user_profiles')
    .select('user_id, bio, age, location, interests, photos, occupation')
    .eq('is_profile_complete', true)
    .eq('age_verified', true)
    .not('user_id', 'in', '(' + seenIds.join(',') + ')')
    .limit(DAILY_CAP + 5);

  if (error) throw error;

  const userIds = (profiles ?? []).map((p: any) => p.user_id);
  const { data: names } = await supabase.from('profiles').select('id, name').in('id', userIds);
  const nameMap = Object.fromEntries((names ?? []).map((n: any) => [n.id, n.name]));

  return (profiles ?? []).slice(0, DAILY_CAP).map((p: any) => ({
    user_id: p.user_id,
    name: nameMap[p.user_id] || 'Member',
    age: p.age,
    location: p.location,
    bio: p.bio,
    occupation: p.occupation,
    photos: p.photos || [],
    interests: p.interests || [],
  }));
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useDiscover() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [viewedToday, setViewedToday] = useState(getViewedToday);
  const capReached = viewedToday >= DAILY_CAP;

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['discover-pool', user?.id],
    queryFn: () => fetchDiscoverPool(user!.id),
    enabled: !!user && !capReached,
    staleTime: 5 * 60_000,
  });

  // ── Express interest ────────────────────────────────────────────────────────
  const interestMutation = useMutation({
    mutationFn: async (targetUserId: string) => {
      if (!user) throw new Error('Not authenticated');
      const payload: DiscoverInterestInsert = {
        user_id: user.id,
        target_user_id: targetUserId,
        skipped: false,
        created_at: new Date().toISOString(),
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from as any)('discover_interests').insert(payload);
      if (error && !error.message?.includes('duplicate')) throw error;
      return targetUserId;
    },
    onSuccess: () => {
      const next = incrementViewedToday();
      setViewedToday(next);
      queryClient.invalidateQueries({ queryKey: ['discover-pool', user?.id] });
      toast.success("Interest noted — we'll factor this into Sunday's picks", { duration: 2500 });
    },
    onError: () => toast.error('Could not save interest'),
  });

  // ── Skip ────────────────────────────────────────────────────────────────────
  const skipMutation = useMutation({
    mutationFn: async (targetUserId: string) => {
      if (!user) throw new Error('Not authenticated');
      const payload: DiscoverInterestInsert = {
        user_id: user.id,
        target_user_id: targetUserId,
        skipped: true,
        created_at: new Date().toISOString(),
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from as any)('discover_interests').insert(payload).then(() => {});
      return targetUserId;
    },
    onSuccess: () => {
      const next = incrementViewedToday();
      setViewedToday(next);
      queryClient.invalidateQueries({ queryKey: ['discover-pool', user?.id] });
    },
  });

  const expressInterest = useCallback(
    (targetUserId: string) => interestMutation.mutateAsync(targetUserId),
    [interestMutation]
  );
  const skip = useCallback(
    (targetUserId: string) => skipMutation.mutateAsync(targetUserId),
    [skipMutation]
  );

  return {
    profiles,
    isLoading,
    capReached,
    viewedToday,
    dailyCap: DAILY_CAP,
    expressInterest,
    skip,
    isPending: interestMutation.isPending || skipMutation.isPending,
  };
}
