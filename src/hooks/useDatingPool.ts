import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useDemo } from '@/contexts/DemoContext';
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
    id: 'pool-1',
    pool_user_id: 'pool-user-1',
    week_start: new Date().toISOString(),
    status: 'pending',
    compatibility_score: 0.78,
    profile: {
      name: 'Alex',
      photos: ['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400'],
      bio: 'Adventure seeker and coffee lover. Always up for trying new restaurants.',
      age: 30,
      location: 'Manhattan, NY',
      interests: ['Travel', 'Food', 'Photography', 'Running'],
      occupation: 'Marketing Manager',
      education_level: 'Masters'
    }
  },
  {
    id: 'pool-2',
    pool_user_id: 'pool-user-2',
    week_start: new Date().toISOString(),
    status: 'pending',
    compatibility_score: 0.75,
    profile: {
      name: 'Jordan',
      photos: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'],
      bio: 'Creative soul with a passion for music and art. Looking for genuine connection.',
      age: 27,
      location: 'Brooklyn, NY',
      interests: ['Music', 'Art', 'Cooking', 'Movies'],
      occupation: 'Product Designer',
      education_level: 'Bachelors'
    }
  },
  {
    id: 'pool-3',
    pool_user_id: 'pool-user-3',
    week_start: new Date().toISOString(),
    status: 'pending',
    compatibility_score: 0.72,
    profile: {
      name: 'Taylor',
      photos: ['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400'],
      bio: 'Fitness enthusiast who also loves a good book. Balance is key!',
      age: 32,
      location: 'Queens, NY',
      interests: ['Fitness', 'Reading', 'Hiking', 'Coffee'],
      occupation: 'Personal Trainer',
      education_level: 'Bachelors'
    }
  },
  {
    id: 'pool-4',
    pool_user_id: 'pool-user-4',
    week_start: new Date().toISOString(),
    status: 'pending',
    compatibility_score: 0.70,
    profile: {
      name: 'Casey',
      photos: ['https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400'],
      bio: 'Startup founder by day, amateur chef by night. Life is an adventure.',
      age: 29,
      location: 'Manhattan, NY',
      interests: ['Entrepreneurship', 'Cooking', 'Wine', 'Travel'],
      occupation: 'Startup Founder',
      education_level: 'MBA'
    }
  },
  {
    id: 'pool-5',
    pool_user_id: 'pool-user-5',
    week_start: new Date().toISOString(),
    status: 'pending',
    compatibility_score: 0.68,
    profile: {
      name: 'Riley',
      photos: ['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400'],
      bio: 'Dog mom, yoga lover, and sunset chaser. Looking for my adventure partner.',
      age: 26,
      location: 'Brooklyn, NY',
      interests: ['Yoga', 'Dogs', 'Nature', 'Photography'],
      occupation: 'Veterinarian',
      education_level: 'Doctorate'
    }
  }
];

export const useDatingPool = () => {
  const { user } = useAuth();
  const { demoData } = useDemo();
  const [pool, setPool] = useState<DatingPoolMatch[]>([]);
  const [loading, setLoading] = useState(true);

  const getCurrentWeekStart = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day;
    const sunday = new Date(now.setDate(diff));
    sunday.setHours(0, 0, 0, 0);
    return sunday.toISOString().split('T')[0];
  };

  const loadPool = useCallback(async () => {
    if (demoData.isInDemo) {
      setPool(DEMO_POOL);
      setLoading(false);
      return;
    }

    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const weekStart = getCurrentWeekStart();
      
      const { data: poolData, error: poolError } = await supabase
        .from('dating_pool' as any)
        .select('*')
        .eq('user_id', user.id)
        .eq('week_start', weekStart)
        .eq('status', 'pending');

      if (poolError) throw poolError;

      if (!poolData || poolData.length === 0) {
        setPool([]);
        setLoading(false);
        return;
      }

      // Get profile data for pool users
      const poolUserIds = poolData.map((p: any) => p.pool_user_id);
      
      const { data: userProfiles, error: profileError } = await supabase
        .from('public_user_profiles')
        .select('user_id, photos, bio, age, location, interests, occupation, education_level')
        .in('user_id', poolUserIds);

      if (profileError) throw profileError;

      const { data: profiles, error: namesError } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', poolUserIds);

      if (namesError) throw namesError;

      const enrichedPool: DatingPoolMatch[] = poolData.map((entry: any) => {
        const userProfile = userProfiles?.find(p => p.user_id === entry.pool_user_id);
        const profile = profiles?.find(p => p.id === entry.pool_user_id);
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

      setPool(enrichedPool);
    } catch (error) {
      console.error('Error loading dating pool:', error);
      toast.error('Failed to load dating pool');
    } finally {
      setLoading(false);
    }
  }, [user, demoData.isInDemo]);

  useEffect(() => {
    loadPool();
  }, [loadPool]);

  const likePoolMatch = async (matchId: string): Promise<{ success: boolean; isMutual?: boolean; conversationId?: string; matchName?: string; matchPhoto?: string }> => {
    if (demoData.isInDemo) {
      const match = pool.find(m => m.id === matchId);
      setPool(prev => prev.filter(m => m.id !== matchId));
      
      // 20% chance of mutual match in demo for pool
      const isMutual = Math.random() < 0.2;
      if (isMutual) {
        toast.success('It\'s a match!');
        return { 
          success: true, 
          isMutual: true, 
          conversationId: `demo_pool_${matchId}`,
          matchName: match?.profile.name,
          matchPhoto: match?.profile.photos?.[0]
        };
      }
      
      toast.success('Interest sent!');
      return { success: true, isMutual: false };
    }

    if (!user) return { success: false };

    try {
      const match = pool.find(m => m.id === matchId);
      if (!match) return { success: false };

      const { error } = await supabase
        .from('dating_pool' as any)
        .update({ 
          status: 'liked',
          responded_at: new Date().toISOString()
        })
        .eq('id', matchId);

      if (error) throw error;

      // Create a match entry - this triggers the handle_new_like function
      const { data: matchData } = await supabase
        .from('matches')
        .insert({
          user_id: user.id,
          liked_user_id: match.pool_user_id
        })
        .select()
        .single();

      // Check if it became mutual
      const isMutual = matchData?.is_mutual || false;
      let conversationId: string | undefined;
      
      if (isMutual) {
        conversationId = [user.id, match.pool_user_id].sort().join('_');
        toast.success('It\'s a match!');
      } else {
        toast.success('Interest sent!');
      }

      setPool(prev => prev.filter(m => m.id !== matchId));
      
      return { 
        success: true, 
        isMutual,
        conversationId,
        matchName: match.profile.name,
        matchPhoto: match.profile.photos?.[0]
      };
    } catch (error) {
      console.error('Error liking pool match:', error);
      toast.error('Failed to send interest');
      return { success: false };
    }
  };

  const passPoolMatch = async (matchId: string) => {
    if (demoData.isInDemo) {
      setPool(prev => prev.filter(m => m.id !== matchId));
      toast.success('Passed');
      return true;
    }

    if (!user) return false;

    try {
      const { error } = await supabase
        .from('dating_pool' as any)
        .update({ 
          status: 'passed',
          responded_at: new Date().toISOString()
        })
        .eq('id', matchId);

      if (error) throw error;

      setPool(prev => prev.filter(m => m.id !== matchId));
      toast.success('Passed');
      return true;
    } catch (error) {
      console.error('Error passing pool match:', error);
      toast.error('Failed to pass');
      return false;
    }
  };

  return {
    pool,
    loading,
    likePoolMatch,
    passPoolMatch,
    refetch: loadPool,
    pendingCount: pool.filter(m => m.status === 'pending').length
  };
};