
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLocation, DistanceMode } from '@/hooks/useLocation';
import { UserProfile } from '@/hooks/useProfile';
import { useCompatibilityScoring, CompatibilityScore } from '@/hooks/useCompatibilityScoring';

export interface DiscoveryProfile extends UserProfile {
  distance?: number;
  rifProfile?: any;
  travelInfo?: Record<DistanceMode, { distance: number; time: number }>;
  neighborhood?: string;
  transitScore?: number;
  walkabilityScore?: number;
  compatibilityScore?: CompatibilityScore;
  isHighlighted?: boolean;
}

export const useDiscoveryProfiles = () => {
  const [profiles, setProfiles] = useState<DiscoveryProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { getTravelInfo } = useLocation();
  const { batchCalculateCompatibility } = useCompatibilityScoring();

  const fetchProfiles = async () => {
    if (!user) {
      setProfiles([]);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setError(null);
      // Get current user's location data
      const { data: currentUserProfile } = await supabase
        .from('user_profiles')
        .select('location_data')
        .eq('user_id', user.id)
        .single();

      const currentUserLocation = currentUserProfile?.location_data as any;

      // Fetch user profiles excluding current user
      const { data: userProfiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .neq('user_id', user.id)
        .eq('is_profile_complete', true)
        .eq('age_verified', true);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        setError('Failed to load profiles. Please try again.');
        return;
      }

      // Fetch RIF profiles for compatibility scoring
      const userIds = userProfiles?.map(p => p.user_id) || [];
      const { data: rifProfiles } = await supabase
        .from('rif_profiles')
        .select('*')
        .in('user_id', userIds)
        .eq('is_active', true);

      // Combine profile data with RIF data and calculate distances
      const enrichedProfiles: DiscoveryProfile[] = (userProfiles || [])
        .filter(profile => profile.photos && profile.photos.length > 0)
        .map(profile => {
          const rifProfile = rifProfiles?.find(rif => rif.user_id === profile.user_id);
          const profileLocation = profile.location_data as any;
          
          let distance: number | undefined;
          let travelInfo: Record<DistanceMode, { distance: number; time: number }> | undefined;
          
          // Calculate real distance if both users have location data
          if (currentUserLocation && profileLocation && 
              currentUserLocation.lat && currentUserLocation.lng && 
              profileLocation.lat && profileLocation.lng) {
            
            travelInfo = getTravelInfo(
              currentUserLocation.lat,
              currentUserLocation.lng,
              profileLocation.lat,
              profileLocation.lng
            );
            distance = travelInfo.walking.distance;
          } else {
            // Fallback to mock distance if no location data
            distance = Math.round((Math.random() * 10 + 1) * 10) / 10;
          }
          
          return {
            ...profile,
            rifProfile,
            distance,
            travelInfo,
            neighborhood: profileLocation?.neighborhood,
            transitScore: profileLocation?.transit_score,
            walkabilityScore: profileLocation?.walkability_score,
          };
        });

      // Calculate ML-based compatibility scores for all profiles
      const compatibilityScores = await batchCalculateCompatibility(enrichedProfiles);
      
      // Add compatibility scores and highlight high-compatibility profiles
      const profilesWithCompatibility = enrichedProfiles.map(profile => {
        const compatibilityScore = compatibilityScores.get(profile.user_id);
        const isHighlighted = compatibilityScore ? compatibilityScore.overall_score > 0.75 : false;
        
        return {
          ...profile,
          compatibilityScore,
          isHighlighted
        };
      });

      // Sort by compatibility score (highest first), then by distance
      profilesWithCompatibility.sort((a, b) => {
        const scoreA = a.compatibilityScore?.overall_score || 0;
        const scoreB = b.compatibilityScore?.overall_score || 0;
        
        if (Math.abs(scoreA - scoreB) > 0.1) {
          return scoreB - scoreA; // Higher scores first
        }
        
        return (a.distance || 999) - (b.distance || 999); // Then by distance
      });

      setProfiles(profilesWithCompatibility);
    } catch (error) {
      console.error('Error in fetchProfiles:', error);
      setError('An unexpected error occurred. Please refresh and try again.');
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
    error,
    refetch: fetchProfiles
  };
};
