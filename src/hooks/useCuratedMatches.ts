import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useDemo } from '@/contexts/DemoContext';
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

export const useCuratedMatches = () => {
  const { user } = useAuth();
  const { demoData } = useDemo();
  const [matches, setMatches] = useState<CuratedMatch[]>([]);
  const [loading, setLoading] = useState(true);

  const getCurrentWeekStart = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day; // Sunday = 0
    const sunday = new Date(now.setDate(diff));
    sunday.setHours(0, 0, 0, 0);
    return sunday.toISOString().split('T')[0];
  };

  const loadMatches = useCallback(async () => {
    if (demoData.isInDemo) {
      setMatches(DEMO_MATCHES);
      setLoading(false);
      return;
    }

    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const weekStart = getCurrentWeekStart();
      
      // Get curated matches for this week - use type assertion since table is new
      const { data: curatedData, error: curatedError } = await supabase
        .from('curated_matches' as any)
        .select('*')
        .eq('user_id', user.id)
        .eq('week_start', weekStart)
        .eq('status', 'pending');

      if (curatedError) throw curatedError;

      if (!curatedData || curatedData.length === 0) {
        setMatches([]);
        setLoading(false);
        return;
      }

      // Get profile data for matched users
      const matchedUserIds = curatedData.map((m: any) => m.matched_user_id);
      
      const { data: userProfiles, error: profileError } = await supabase
        .from('public_user_profiles')
        .select('user_id, photos, bio, age, location, interests, occupation, education_level')
        .in('user_id', matchedUserIds);

      if (profileError) throw profileError;

      // Get names from profiles table
      const { data: profiles, error: namesError } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', matchedUserIds);

      if (namesError) throw namesError;

      // Combine data
      const enrichedMatches: CuratedMatch[] = curatedData.map((match: any) => {
        const userProfile = userProfiles?.find(p => p.user_id === match.matched_user_id);
        const profile = profiles?.find(p => p.id === match.matched_user_id);
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

      setMatches(enrichedMatches);
    } catch (error) {
      console.error('Error loading curated matches:', error);
      toast.error('Failed to load matches');
    } finally {
      setLoading(false);
    }
  }, [user, demoData.isInDemo]);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  const acceptMatch = async (matchId: string): Promise<{ success: boolean; isMutual?: boolean; conversationId?: string; matchName?: string; matchPhoto?: string }> => {
    if (demoData.isInDemo) {
      const match = matches.find(m => m.id === matchId);
      setMatches(prev => prev.filter(m => m.id !== matchId));
      
      // 30% chance of mutual match in demo
      const isMutual = Math.random() < 0.3;
      if (isMutual) {
        toast.success('It\'s a match! You can now message each other.');
        return { 
          success: true, 
          isMutual: true, 
          conversationId: `demo_${matchId}`,
          matchName: match?.profile.name,
          matchPhoto: match?.profile.photos?.[0]
        };
      }
      
      toast.success('Interest sent! You\'ll be notified if it\'s mutual.');
      return { success: true, isMutual: false };
    }

    if (!user) return { success: false };

    try {
      const match = matches.find(m => m.id === matchId);
      if (!match) return { success: false };

      // Update status to accepted
      const { error } = await supabase
        .from('curated_matches' as any)
        .update({ 
          status: 'accepted',
          responded_at: new Date().toISOString()
        })
        .eq('id', matchId);

      if (error) throw error;

      // Check if mutual match exists
      const { data: mutualCheck } = await supabase
        .rpc('check_mutual_match', {
          user_a: user.id,
          user_b: match.matched_user_id
        });

      let conversationId: string | undefined;
      
      if (mutualCheck) {
        // Create conversation if mutual
        conversationId = [user.id, match.matched_user_id].sort().join('_');
        
        await supabase.from('conversation_tracker').insert({
          conversation_id: conversationId,
          user_id: user.id,
          match_user_id: match.matched_user_id
        });

        toast.success('It\'s a match! You can now message each other.');
      } else {
        toast.success('Interest sent! You\'ll be notified if it\'s mutual.');
      }

      setMatches(prev => prev.filter(m => m.id !== matchId));
      
      return { 
        success: true, 
        isMutual: !!mutualCheck,
        conversationId,
        matchName: match.profile.name,
        matchPhoto: match.profile.photos?.[0]
      };
    } catch (error) {
      console.error('Error accepting match:', error);
      toast.error('Failed to accept match');
      return { success: false };
    }
  };

  const passMatch = async (matchId: string) => {
    if (demoData.isInDemo) {
      setMatches(prev => prev.filter(m => m.id !== matchId));
      toast.success('Passed');
      return true;
    }

    if (!user) return false;

    try {
      const { error } = await supabase
        .from('curated_matches' as any)
        .update({ 
          status: 'passed',
          responded_at: new Date().toISOString()
        })
        .eq('id', matchId);

      if (error) throw error;

      setMatches(prev => prev.filter(m => m.id !== matchId));
      toast.success('Passed');
      return true;
    } catch (error) {
      console.error('Error passing match:', error);
      toast.error('Failed to pass');
      return false;
    }
  };

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
    refetch: loadMatches,
    getNextRefreshDate,
    pendingCount: matches.filter(m => m.status === 'pending').length
  };
};
