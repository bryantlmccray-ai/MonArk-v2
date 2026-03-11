import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useDemo } from '@/contexts/DemoContext';
import { queryKeys } from '@/lib/queryKeys';
import { toast } from 'sonner';

export interface DatingPoolMatch {
  id: string;
  pool_user_id: string;
  week_start: string;
  status: 'pending' | 'liked' | 'passed';
  compatibility_score?: number;
  profile: {
    name?: string;
    photos?: string[];
    bio?: string;
    age?: number;
    location?: string;
    interests?: string[];
    occupation?: string;
    education_level?: string;
  };
}

// Demo data for testing
const DEMO_POOL: DatingPoolMatch[] = [
  {
    id: 'pool-1', pool_user_id: 'pool-user-1', week_start: new Date().toISOString(), status: 'pending', compatibility_score: 0.78,
    profile: { name: 'Alex', photos: ['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400'], bio: 'Adventure seeker and coffee lover.', age: 30, location: 'Manhattan, NY', interests: ['Travel', 'Food', 'Photography', 'Running'], occupation: 'Marketing Manager', education_level: 'Masters' }
  },
  {
    id: 'pool-2', pool_user_id: 'pool-user-2', week_start: new Date().toISOString(), status: 'pending', compatibility_score: 0.75,
    profile: { name: 'Jordan', photos: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'], bio: 'Creative soul with a passion for music and art.', age: 27, location: 'Brooklyn, NY', interests: ['Music', 'Art', 'Cooking', 'Movies'], occupation: 'Product Designer', education_level: 'Bachelors' }
  },
  {
    id: 'pool-3', pool_user_id: 'pool-user-3', week_start: new Date().toISOString(), status: 'pending', compatibility_score: 0.72,
    profile: { name: 'Taylor', photos: ['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400'], bio: 'Fitness enthusiast who also loves a good book.', age: 32, location: 'Queens, NY', interests: ['Fitness', 'Reading', 'Hiking', 'Coffee'], occupation: 'Personal Trainer', education_level: 'Bachelors' }
  },
  {
    id: 'pool-4', pool_user_id: 'pool-user-4', week_start: new Date().toISOString(), status: 'pending', compatibility_score: 0.70,
    profile: { name: 'Casey', photos: ['https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400'], bio: 'Startup founder by day, amateur chef by night.', age: 29, location: 'Manhattan, NY', interests: ['Entrepreneurship', 'Cooking', 'Wine', 'Travel'], occupation: 'Startup Founder', education_level: 'MBA' }
  },
  {
    id: 'pool-5', pool_user_id: 'pool-user-5', week_start: new Date().toISOString(), status: 'pending', compatibility_score: 0.68,
    profile: { name: 'Riley', photos: ['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400'], bio: 'Dog mom, yoga lover, and sunset chaser.', age: 26, location: 'Brooklyn, NY', interests: ['Yoga', 'Dogs', 'Nature', 'Photography'], occupation: 'Veterinarian', education_level: 'Doctorate' }
  }
];

const getCurrentWeekStart = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day;
  const sunday = new Date(now.setDate(diff));
  sunday.setHours(0, 0, 0, 0);
  return sunday.toISOString().split('T')[0];
};

async function fetchDatingPool(userId: string): Promise<DatingPoolMatch[]> {
  const weekStart = getCurrentWeekStart();

  const { data: poolData, error: poolError } = await supabase
    .from('dating_pool' as any)
    .select('*')
    .eq('user_id', userId)
    .eq('week_start', weekStart)
    .eq('status', 'pending');

  if (poolError) throw poolError;
  if (!poolData || poolData.length === 0) return [];

  const poolUserIds = poolData.map((p: any) => p.pool_user_id);

  const [{ data: userProfiles }, { data: profiles }] = await Promise.all([
    supabase
      .from('public_user_profiles')
      .select('user_id, photos, bio, age, location, interests, occupation, education_level')
      .in('user_id', poolUserIds),
    supabase.from('profiles').select('id, name').in('id', poolUserIds),
  ]);

  return poolData.map((entry: any) => {
    const userProfile = userProfiles?.find((p: any) => p.user_id === entry.pool_user_id);
    const profile = profiles?.find((p: any) => p.id === entry.pool_user_id);
    return {
      id: entry.id,
      pool_user_id: entry.pool_user_id,
      week_start: entry.week_start,
      status: entry.status as 'pending' | 'liked' | 'passed',
      compatibility_score: entry.compatibility_score,
      profile: {
        name: profile?.name || undefined,
        photos: userProfile?.photos || [],
        bio: userProfile?.bio || '',
        age: userProfile?.age || undefined,
        location: userProfile?.location || '',
        interests: userProfile?.interests || [],
        occupation: userProfile?.occupation || '',
        education_level: userProfile?.education_level || ''
      }
    };
  });
}

export const useDatingPool = () => {
  const { user } = useAuth();
  const { demoData } = useDemo();
  const queryClient = useQueryClient();
  const weekStart = getCurrentWeekStart();

  const { data: pool = [], isLoading: loading } = useQuery({
    queryKey: queryKeys.datingPool.byWeek(user?.id ?? '', weekStart),
    queryFn: () => {
      if (demoData.isInDemo) return DEMO_POOL;
      return fetchDatingPool(user!.id);
    },
    enabled: !!user || demoData.isInDemo,
    staleTime: 60_000,
  });

  const likeMutation = useMutation({
    mutationFn: async (matchId: string) => {
      if (demoData.isInDemo) {
        const match = pool.find(m => m.id === matchId);
        const isMutual = Math.random() < 0.2;
        return { matchId, isMutual, conversationId: isMutual ? `demo_pool_${matchId}` : undefined, matchName: match?.profile.name, matchPhoto: match?.profile.photos?.[0] };
      }

      if (!user) throw new Error('Not authenticated');
      const match = pool.find(m => m.id === matchId);
      if (!match) throw new Error('Match not found');

      const { error } = await supabase
        .from('dating_pool' as any)
        .update({ status: 'liked', responded_at: new Date().toISOString() })
        .eq('id', matchId);
      if (error) throw error;

      const { data: matchData } = await supabase
        .from('matches')
        .insert({ user_id: user.id, liked_user_id: match.pool_user_id })
        .select()
        .single();

      const isMutual = matchData?.is_mutual || false;
      let conversationId: string | undefined;
      if (isMutual) {
        conversationId = [user.id, match.pool_user_id].sort().join('_');
      }

      return { matchId, isMutual, conversationId, matchName: match.profile.name, matchPhoto: match.profile.photos?.[0] };
    },
    onSuccess: (result) => {
      if (result.isMutual) {
        toast.success("It's a match!");
        queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
      } else {
        toast.success('Interest sent!');
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.datingPool.all });
    },
  });

  const passMutation = useMutation({
    mutationFn: async (matchId: string) => {
      if (demoData.isInDemo) return matchId;
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('dating_pool' as any)
        .update({ status: 'passed', responded_at: new Date().toISOString() })
        .eq('id', matchId);
      if (error) throw error;
      return matchId;
    },
    onSuccess: () => {
      toast.success('Passed');
      queryClient.invalidateQueries({ queryKey: queryKeys.datingPool.all });
    },
    onError: () => toast.error('Failed to pass'),
  });

  const likePoolMatch = useCallback(
    async (matchId: string): Promise<{ success: boolean; isMutual?: boolean; conversationId?: string; matchName?: string; matchPhoto?: string }> => {
      try {
        const result = await likeMutation.mutateAsync(matchId);
        return { success: true, isMutual: result.isMutual, conversationId: result.conversationId, matchName: result.matchName, matchPhoto: result.matchPhoto };
      } catch {
        toast.error('Failed to send interest');
        return { success: false };
      }
    },
    [likeMutation]
  );

  const passPoolMatch = useCallback(
    async (matchId: string) => {
      try {
        await passMutation.mutateAsync(matchId);
        return true;
      } catch {
        return false;
      }
    },
    [passMutation]
  );

  return {
    pool,
    loading,
    likePoolMatch,
    passPoolMatch,
    refetch: () => queryClient.invalidateQueries({ queryKey: queryKeys.datingPool.all }),
    pendingCount: pool.filter(m => m.status === 'pending').length
  };
};
