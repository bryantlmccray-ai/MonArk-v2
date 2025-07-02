
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { UserProfile } from '@/hooks/useProfile';

export interface DiscoveryProfile extends UserProfile {
  distance?: number;
  rifProfile?: any;
}

export const useDiscoveryProfiles = () => {
  const [profiles, setProfiles] = useState<DiscoveryProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchProfiles = async () => {
    if (!user) {
      setProfiles([]);
      setLoading(false);
      return;
    }

    try {
      // Fetch user profiles excluding current user
      const { data: userProfiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select(`
          *,
          profiles:user_id (
            name,
            email
          )
        `)
        .neq('user_id', user.id)
        .eq('is_profile_complete', true)
        .eq('age_verified', true);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
      }

      // Fetch RIF profiles for compatibility scoring
      const userIds = userProfiles?.map(p => p.user_id) || [];
      const { data: rifProfiles } = await supabase
        .from('rif_profiles')
        .select('*')
        .in('user_id', userIds)
        .eq('is_active', true);

      // Combine profile data with RIF data
      const enrichedProfiles: DiscoveryProfile[] = (userProfiles || [])
        .filter(profile => profile.photos && profile.photos.length > 0)
        .map(profile => {
          const rifProfile = rifProfiles?.find(rif => rif.user_id === profile.user_id);
          
          return {
            ...profile,
            rifProfile,
            // Calculate mock distance for now - will be replaced with real GPS calculation
            distance: Math.round((Math.random() * 10 + 1) * 10) / 10
          };
        });

      setProfiles(enrichedProfiles);
    } catch (error) {
      console.error('Error in fetchProfiles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [user]);

  return {
    profiles,
    loading,
    refetch: fetchProfiles
  };
};
