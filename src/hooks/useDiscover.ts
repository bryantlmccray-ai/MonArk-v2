import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type {
  DiscoverInterestInsert,
  DiscoverInterestRow,
} from '@/integrations/supabase/types.extended';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

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
  distance_km?: number | null;
}

function todayKey() {
  return 'monark_discover_count_' + new Date().toISOString().split('T')[0];
}

function getViewedToday(): number {
  try { return parseInt(localStorage.getItem(todayKey()) || '0', 10); }
  catch { return 0; }
}

function incrementViewedToday(): number {
  const next = getViewedToday() + 1;
  try { localStorage.setItem(todayKey(), String(next)); } catch {}
  return next;
}

async function fetchDiscoverPool(userId: string): Promise<DiscoverProfile[]> {
  const [{ data: interests }, { data: matches }, { data: pool }] = await Promise.all([
    (supabase.from('discover_interests' as any) as any).select('target_user_id').eq('user_id', userId),
    (supabase.from('curated_matches' as any) as any).select('match_user_id').eq('user_id', userId),
    supabase.from('dating_pool').select('pool_user_id').eq('user_id', userId),
  ]);

  const seenIds: string[] = [
    userId,
    ...(interests ?? []).map((r: any) => r.target_user_id),
    ...(matches ?? []).map((r: any) => r.match_user_id),
    ...(pool ?? []).map((r: any) => r.pool_user_id),
  ];

  const { data: myProfile } = await supabase
    .from('user_profiles')
    .select('geo_lat, geo_lng, search_radius_km')
    .eq('user_id', userId)
    .maybeSingle();

  const myLat = (myProfile as any)?.geo_lat ?? null;
  const myLng = (myProfile as any)?.geo_lng ?? null;
  const radiusKm = (myProfile as any)?.search_radius_km ?? 50;

  let candidateIds: string[] = [];
  let distanceMap: Record<string, number> = {};
  let geoFiltered = false;

  if (myLat != null && myLng != null) {
    const { data: geoRows, error: geoErr } = await (supabase.rpc as any)(
      'get_candidates_within_radius',
      { center_lat: myLat, center_lng: myLng, radius_km: radiusKm, exclude_ids: seenIds }
    );
    if (!geoErr && geoRows && (geoRows as any[]).length > 0) {
      candidateIds = (geoRows as any[]).map((r: any) => r.user_id);
      distanceMap = Object.fromEntries((geoRows as any[]).map((r: any) => [r.user_id, r.distance_km]));
      geoFiltered = true;
    }
  }

  let profiles: any[] = [];
  if (geoFiltered && candidateIds.length > 0) {
    const { data } = await supabase
      .from('user_profiles')
      .select('user_id, bio, age, location, interests, photos, occupation')
      .in('user_id', candidateIds)
      .eq('is_profile_complete', true)
      .eq('age_verified', true);
    profiles = data ?? [];
  } else {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('user_id, bio, age, location, interests, photos, occupation')
      .eq('is_profile_complete', true)
      .eq('age_verified', true)
      .not('user_id', 'in', `(${seenIds.join(',')})`)
      .limit(DAILY_CAP + 5);
    if (error) throw error;
    profiles = data ?? [];
  }

  const userIds = profiles.map((p: any) => p.user_id);
  const { data: names } = await supabase.from('profiles').select('id, name').in('id', userIds);
  const nameMap = Object.fromEntries((names ?? []).map((n: any) => [n.id, n.name]));

  const enriched: DiscoverProfile[] = profiles.slice(0, DAILY_CAP).map((p: any) => ({
    user_id: p.user_id,
    name: nameMap[p.user_id] || 'Member',
    age: p.age,
    location: p.location,
    bio: p.bio,
    occupation: p.occupation,
    photos: p.photos || [],
    interests: p.interests || [],
    distance_km: distanceMap[p.user_id] ?? null,
  }));

  if (geoFiltered) enriched.sort((a, b) => (a.distance_km ?? 999) - (b.distance_km ?? 999));
  return enriched;
}

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

  const interestMutation = useMutation({
    mutationFn: async (targetUserId: string) => {
      if (!user) throw new Error('Not authenticated');
      const payload: DiscoverInterestInsert = {
        user_id: user.id, target_user_id: targetUserId, skipped: false,
        created_at: new Date().toISOString(),
      };
      const { error } = await (supabase.from('discover_interests' as any) as any).insert(payload);
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

  const skipMutation = useMutation({
    mutationFn: async (targetUserId: string) => {
      if (!user) throw new Error('Not authenticated');
      const payload: DiscoverInterestInsert = {
        user_id: user.id, target_user_id: targetUserId, skipped: true,
        created_at: new Date().toISOString(),
      };
      await (supabase.from('discover_interests' as any) as any).insert(payload).then(() => {});
      return targetUserId;
    },
    onSuccess: () => {
      const next = incrementViewedToday();
      setViewedToday(next);
      queryClient.invalidateQueries({ queryKey: ['discover-pool', user?.id] });
    },
  });

  const expressInterest = useCallback(
    (targetUserId: string) => interestMutation.mutateAsync(targetUserId), [interestMutation]
  );
  const skip = useCallback(
    (targetUserId: string) => skipMutation.mutateAsync(targetUserId), [skipMutation]
  );

  return { profiles, isLoading, capReached, viewedToday, dailyCap: DAILY_CAP,
    expressInterest, skip, isPending: interestMutation.isPending || skipMutation.isPending };
                                                                                }
