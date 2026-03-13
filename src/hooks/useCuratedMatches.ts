import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useDemo } from '@/contexts/DemoContext';
import { queryKeys } from '@/lib/queryKeys';
import { toast } from 'sonner';

export interface CuratedMatch {
  id: string;
  matched_user_id: string;
  week_start: string;
  status: 'pending' | 'accepted' | 'passed';
  compatibility_score?: number;
  match_reason?: string;
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
const DEMO_MATCHES: CuratedMatch[] = [
  {
    id: 'demo-1',
    matched_user_id: 'demo-user-1',
    week_start: new Date().toISOString(),
    status: 'pending',
    compatibility_score: 0.92,
    match_reason: 'You both love hiking and value deep conversations',
    profile: {
      name: 'Emma',
      photos: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400'],
      bio: 'Coffee enthusiast, bookworm, and weekend hiker. Looking for someone to share adventures with.',
      age: 28,
      location: 'Brooklyn, NY',
      interests: ['Hiking', 'Reading', 'Coffee', 'Photography'],
      occupation: 'UX Designer',
      education_level: 'Masters'
    }
  },
  {
    id: 'demo-2',
    matched_user_id: 'demo-user-2',
    week_start: new Date().toISOString(),
    status: 'pending',
    compatibility_score: 0.87,
    match_reason: 'Shared love for art and creative expression',
    profile: {
      name: 'Marcus',
      photos: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'],
      bio: 'Artist and musician. I believe in living life with intention and finding beauty in everyday moments.',
      age: 31,
      location: 'Manhattan, NY',
      interests: ['Art', 'Music', 'Cooking', 'Travel'],
      occupation: 'Graphic Designer',
      education_level: 'Bachelors'
    }
  },
  {
    id: 'demo-3',
    matched_user_id: 'demo-user-3',
    week_start: new Date().toISOString(),
    status: 'pending',
    compatibility_score: 0.84,
    match_reason: 'Both value authenticity and meaningful connections',
    profile: {
      name: 'Sophia',
      photos: ['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400'],
      bio: 'Tech by day, yoga by night. Seeking genuine connection over endless swiping.',
      age: 29,
      location: 'Queens, NY',
      interests: ['Yoga', 'Technology', 'Meditation', 'Running'],
      occupation: 'Software Engineer',
      education_level: 'Bachelors'
    }
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

async function fetchCuratedMatches(userId: string): Promise<CuratedMatch[]> {
  const weekStart = getCurrentWeekStart();

  const { data: curatedData, error: curatedError } = await supabase
    .from('curated_matches' as any)
    .select('*')
    .eq('user_id', userId)
    .eq('week_start', weekStart)
    .eq('status', 'pending');

  if (curatedError) throw curatedError;
  if (!curatedData || curatedData.length === 0) return [];

  const matchedUserIds = curatedData.map((m: any) => m.matched_user_id);

  const [{ data: userProfiles }, { data: profiles }] = await Promise.all([
    supabase
      .from('public_user_profiles')
      .select('user_id, photos, bio, age, location, interests, occupation, education_level')
      .in('user_id', matchedUserIds),
    supabase.from('profiles').select('id, name').in('id', matchedUserIds),
  ]);

  return curatedData.map((match: any) => {
    const userProfile = userProfiles?.find((p: any) => p.user_id === match.matched_user_id);
    const profile = profiles?.find((p: any) => p.id === match.matched_user_id);
    return {
      id: match.id,
      matched_user_id: match.matched_user_id,
      week_start: match.week_start,
      status: match.status as 'pending' | 'accepted' | 'passed',
      compatibility_score: match.compatibility_score,
      match_reason: match.match_reason,
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

export const useCuratedMatches = () => {
  const { user } = useAuth();
  const { demoData } = useDemo();
  const queryClient = useQueryClient();
  const weekStart = getCurrentWeekStart();

  const { data: matches = [], isLoading: loading } = useQuery({
    queryKey: queryKeys.curatedMatches.byWeek(user?.id ?? '', weekStart),
    queryFn: () => {
      if (demoData.isInDemo) return DEMO_MATCHES;
      return fetchCuratedMatches(user!.id);
    },
    enabled: !!user || demoData.isInDemo,
    staleTime: 60_000,
  });

  const acceptMutation = useMutation({
    mutationFn: async (matchId: string) => {
      if (demoData.isInDemo) {
        const match = matches.find(m => m.id === matchId);
        const isMutual = Math.random() < 0.3;
        return { matchId, isMutual, conversationId: isMutual ? `demo_${matchId}` : undefined, matchName: match?.profile.name, matchPhoto: match?.profile.photos?.[0] };
      }

      if (!user) throw new Error('Not authenticated');
      const match = matches.find(m => m.id === matchId);
      if (!match) throw new Error('Match not found');

      const { error } = await supabase.rpc('respond_to_curated_match' as any, {
        p_match_id: matchId,
        p_status: 'accepted'
      });
      if (error) throw error;

      const { data: mutualCheck } = await supabase.rpc('check_mutual_match', {
        user_a: user.id,
        user_b: match.matched_user_id
      });

      let conversationId: string | undefined;
      if (mutualCheck) {
        conversationId = [user.id, match.matched_user_id].sort().join('_');
        await supabase.from('conversation_tracker').insert({
          conversation_id: conversationId,
          user_id: user.id,
          match_user_id: match.matched_user_id
        });

        // Auto-generate a curated date proposal for the new match
        try {
          await supabase.functions.invoke('ai-date-concierge', {
            body: {
              matchUserId: match.matched_user_id,
              conversationId,
              userInterests: [],
              matchInterests: [],
              currentUserId: user.id,
              autoGenerate: true
            }
          });
        } catch (dateErr) {
          console.warn('Auto date proposal generation failed (non-blocking):', dateErr);
        }
      }

      return { matchId, isMutual: !!mutualCheck, conversationId, matchName: match.profile.name, matchPhoto: match.profile.photos?.[0] };
    },
    onSuccess: (result) => {
      if (result.isMutual) {
        toast.success("It's a match! You can now message each other.");
        queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
      } else {
        toast.success("Interest sent! You'll be notified if it's mutual.");
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.curatedMatches.all });
    },
  });

  const passMutation = useMutation({
    mutationFn: async (matchId: string) => {
      if (demoData.isInDemo) return matchId;
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.rpc('respond_to_curated_match' as any, {
        p_match_id: matchId,
        p_status: 'declined'
      });
      if (error) throw error;
      return matchId;
    },
    onSuccess: () => {
      toast.success('Passed');
      queryClient.invalidateQueries({ queryKey: queryKeys.curatedMatches.all });
    },
    onError: () => {
      toast.error('Failed to pass');
    },
  });

  const acceptMatch = useCallback(
    async (matchId: string): Promise<{ success: boolean; isMutual?: boolean; conversationId?: string; matchName?: string; matchPhoto?: string }> => {
      try {
        const result = await acceptMutation.mutateAsync(matchId);
        return { success: true, isMutual: result.isMutual, conversationId: result.conversationId, matchName: result.matchName, matchPhoto: result.matchPhoto };
      } catch {
        toast.error('Failed to accept match');
        return { success: false };
      }
    },
    [acceptMutation]
  );

  const passMatch = useCallback(
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

  const getNextRefreshDate = () => {
    const now = new Date();
    const day = now.getDay();
    const daysUntilSunday = day === 0 ? 7 : 7 - day;
    const nextSunday = new Date(now);
    nextSunday.setDate(now.getDate() + daysUntilSunday);
    nextSunday.setHours(0, 0, 0, 0);
    return nextSunday;
  };

  return {
    matches,
    loading,
    acceptMatch,
    passMatch,
    refetch: () => queryClient.invalidateQueries({ queryKey: queryKeys.curatedMatches.all }),
    getNextRefreshDate,
    pendingCount: matches.filter(m => m.status === 'pending').length
  };
};
