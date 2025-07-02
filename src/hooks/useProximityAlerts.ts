import { useEffect, useRef } from 'react';
import { useRIF } from '@/hooks/useRIF';
import { DiscoveryProfile } from '@/hooks/useDiscoveryProfiles';
import { toast } from 'sonner';

interface ProximityAlertsProps {
  profiles: DiscoveryProfile[];
  userLocation?: { lat: number; lng: number };
  onProximityAlert: (userId: string, userName: string, userImage: string, distance: number, compatibilityScore: number) => void;
}

export const useProximityAlerts = ({ 
  profiles, 
  userLocation, 
  onProximityAlert 
}: ProximityAlertsProps) => {
  const { rifProfile } = useRIF();
  const alertedUsers = useRef<Set<string>>(new Set());

  // Calculate compatibility score between two RIF profiles
  const calculateCompatibility = (profile1: any, profile2: any): number => {
    if (!profile1 || !profile2) return 0;

    const pacingDiff = Math.abs(profile1.pacing_preferences - profile2.pacing_preferences);
    const intentDiff = Math.abs(profile1.intent_clarity - profile2.intent_clarity);
    const emotionalDiff = Math.abs(profile1.emotional_readiness - profile2.emotional_readiness);
    const boundaryDiff = Math.abs(profile1.boundary_respect - profile2.boundary_respect);

    // Convert differences to compatibility scores (lower difference = higher compatibility)
    const pacingCompat = Math.max(0, 10 - pacingDiff) / 10;
    const intentCompat = Math.max(0, 10 - intentDiff) / 10;
    const emotionalCompat = Math.max(0, 10 - emotionalDiff) / 10;
    const boundaryCompat = Math.max(0, 10 - boundaryDiff) / 10;

    // Average compatibility score as percentage
    return Math.round(((pacingCompat + intentCompat + emotionalCompat + boundaryCompat) / 4) * 100);
  };

  // Calculate distance between two points (simplified for demo)
  const calculateDistance = (profile: DiscoveryProfile): number => {
    if (!userLocation || !profile.location_data) {
      return typeof profile.distance === 'number' ? profile.distance : Math.random() * 5;
    }

    // In a real app, you'd use proper geolocation calculations
    // For now, using the mock distance or random value
    return typeof profile.distance === 'number' ? profile.distance : Math.random() * 5;
  };

  useEffect(() => {
    if (!rifProfile || !profiles.length) return;

    const checkProximityAlerts = () => {
      profiles.forEach(profile => {
        // Skip if already alerted for this user
        if (alertedUsers.current.has(profile.user_id)) return;

        const distance = calculateDistance(profile);
        const compatibility = calculateCompatibility(rifProfile, profile.rifProfile);

        // Trigger alert for high compatibility users within 2 miles
        if (compatibility >= 80 && distance <= 2) {
          const userName = (profile as any).profiles?.name || 'Someone';
          const userImage = profile.photos?.[0] || '';

          // Add to alerted users to prevent duplicate alerts
          alertedUsers.current.add(profile.user_id);

          // Show toast notification
          toast.success(
            `High compatibility match nearby! ${userName} (${compatibility}% match) is ${distance.toFixed(1)}mi away`,
            {
              duration: 5000,
              action: {
                label: 'View',
                onClick: () => {
                  // Could navigate to profile here
                  console.log('Navigate to profile:', profile.user_id);
                }
              }
            }
          );

          // Trigger activity feed update
          onProximityAlert(profile.user_id, userName, userImage, distance, compatibility);
        }
      });
    };

    // Check on initial load and then every 30 seconds
    checkProximityAlerts();
    const interval = setInterval(checkProximityAlerts, 30000);

    return () => clearInterval(interval);
  }, [profiles, rifProfile, userLocation, onProximityAlert]);

  // Clear alerted users when profiles change significantly
  useEffect(() => {
    alertedUsers.current.clear();
  }, [profiles.length]);

  return {
    calculateCompatibility,
    calculateDistance
  };
};