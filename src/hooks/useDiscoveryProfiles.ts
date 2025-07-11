
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

      // Get user's adaptive preferences for enhanced scoring
      const { data: userPreferences } = await supabase
        .from('user_ml_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // Get user's behavioral patterns for context-aware matching
      const { data: behavioralPatterns } = await supabase
        .from('behavioral_patterns')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      // Calculate ML-based compatibility scores with adaptive learning
      const compatibilityScores = await batchCalculateCompatibility(enrichedProfiles);
      
      // Add compatibility scores and highlight high-compatibility profiles
      const profilesWithCompatibility = enrichedProfiles.map(profile => {
        const compatibilityScore = compatibilityScores.get(profile.user_id);
        
        // Use adaptive thresholds based on user's journey stage and patterns
        const adaptiveThreshold = calculateAdaptiveThreshold(behavioralPatterns || [], userPreferences);
        const isHighlighted = compatibilityScore ? compatibilityScore.overall_score > adaptiveThreshold : false;
        
        return {
          ...profile,
          compatibilityScore,
          isHighlighted
        };
      });

      // Adaptive sorting based on user's learned preferences
      profilesWithCompatibility.sort((a, b) => {
        const scoreA = a.compatibilityScore?.overall_score || 0;
        const scoreB = b.compatibilityScore?.overall_score || 0;
        
        // Use adaptive weights from user preferences
        const rifWeight = userPreferences?.rif_weight || 0.4;
        const distanceWeight = 1 - rifWeight;
        
        const adaptiveScoreA = (scoreA * rifWeight) + ((1 - (a.distance || 0) / 50) * distanceWeight);
        const adaptiveScoreB = (scoreB * rifWeight) + ((1 - (b.distance || 0) / 50) * distanceWeight);
        
        return adaptiveScoreB - adaptiveScoreA;
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

  // Helper function to calculate adaptive threshold based on user patterns
  const calculateAdaptiveThreshold = (patterns: any[], preferences: any) => {
    let baseThreshold = 0.75;
    
    // Adjust threshold based on behavioral patterns
    patterns.forEach(pattern => {
      if (pattern.pattern_type === 'preference_evolution' && pattern.confidence_score > 0.7) {
        // User has learned preferences, be more selective
        baseThreshold += 0.05;
      }
      if (pattern.pattern_type === 'dating_frequency' && pattern.pattern_data?.dating_frequency > 2) {
        // User dates frequently, can be more selective
        baseThreshold += 0.1;
      }
    });
    
    // Adjust based on user's confidence level
    if (preferences?.confidence_level > 0.8) {
      baseThreshold += 0.05;
    }
    
    return Math.min(baseThreshold, 0.9); // Cap at 0.9
  };

  return {
    profiles,
    loading,
    error,
    refetch: fetchProfiles
  };
};
