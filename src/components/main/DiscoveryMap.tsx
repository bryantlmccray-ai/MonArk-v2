
import React, { useState, useEffect } from 'react';
import { RIFProfileCard } from './RIFProfileCard';
import { RIFInsightOverlay } from '../rif/RIFInsightOverlay';
import { DiscoveryFilters, DiscoveryFilters as FilterType } from './DiscoveryFilters';
import { ProfileSelectionOverlay } from './ProfileSelectionOverlay';
import { ChatModal } from '../chat/ChatModal';
import { useRIF } from '@/hooks/useRIF';
import { useProfile } from '@/hooks/useProfile';
import { useDiscoveryProfiles, DiscoveryProfile } from '@/hooks/useDiscoveryProfiles';
import { useMatching } from '@/hooks/useMatching';
import { MapPin } from 'lucide-react';

export const DiscoveryMap: React.FC = () => {
  const [selectedPin, setSelectedPin] = useState<number | null>(null);
  const [showInsight, setShowInsight] = useState<boolean>(false);
  const [insightTarget, setInsightTarget] = useState<any>(null);
  const [selectedProfile, setSelectedProfile] = useState<DiscoveryProfile | null>(null);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatData, setChatData] = useState<{
    conversationId: string;
    matchUserId: string;
    matchName: string;
    matchImage?: string;
  } | null>(null);
  const [filters, setFilters] = useState<FilterType>({
    ageRange: [22, 35],
    maxDistance: 25,
    interests: [],
    rifCompatibility: {
      pacing: false,
      emotional: false,
      boundaries: false,
      intent: false
    },
    showOnlyHighCompatibility: false
  });

  const { rifProfile } = useRIF();
  const { profile } = useProfile();
  const { profiles, loading } = useDiscoveryProfiles();
  const { likeUser, startConversation, loading: matchingLoading } = useMatching();

  // Check if user has location enabled
  const hasLocation = profile?.location_consent && profile?.location_data;

  const locations = [
    { id: 1, name: 'DOWNTOWN', x: 40, y: 30 },
    { id: 2, name: 'OHIO CITY', x: 25, y: 45 },
    { id: 3, name: 'TREMONT', x: 35, y: 55 },
    { id: 4, name: 'UNIVERSITY CIRCLE', x: 65, y: 35 },
    { id: 5, name: 'LITTLE ITALY', x: 68, y: 40 },
    { id: 6, name: 'GORDON SQUARE', x: 22, y: 38 },
    { id: 7, name: 'LAKEWOOD', x: 15, y: 50 },
    { id: 8, name: 'SHAKER HEIGHTS', x: 75, y: 50 },
  ];

  // Identity-based filtering function
  const isIdentityCompatible = (targetProfile: DiscoveryProfile) => {
    if (!profile?.preference_to_see || !profile?.gender_identity) return true;
    
    // Map gender identities to preference categories
    const mapGenderToPreference = (gender: string) => {
      switch (gender) {
        case 'Man': return 'Men';
        case 'Woman': return 'Women';
        case 'Nonbinary': return 'Nonbinary people';
        case 'Genderfluid': return 'Genderfluid people';
        case 'Agender': return 'Agender people';
        case 'Demigender': return 'Demigender people';
        case 'Two-Spirit': return 'Two-Spirit people';
        default: return gender;
      }
    };

    const userGenderPref = mapGenderToPreference(profile.gender_identity);
    const targetGenderPref = mapGenderToPreference(targetProfile.gender_identity || '');

    // Check if user wants to see this person's gender
    const userWantsToSee = profile.preference_to_see.includes(targetGenderPref) || 
                          profile.preference_to_see.includes('Everyone open to connection');

    // Check if this person wants to see user's gender
    const targetWantsToSee = targetProfile.preference_to_see?.includes(userGenderPref) || 
                            targetProfile.preference_to_see?.includes('Everyone open to connection');

    return userWantsToSee && targetWantsToSee;
  };

  // Enhanced profile distance calculation
  const calculateDistance = (targetProfile: DiscoveryProfile) => {
    if (!hasLocation || !targetProfile.location_data) return targetProfile.distance;
    
    const userLat = profile.location_data.lat;
    const userLng = profile.location_data.lng;
    const targetLat = targetProfile.location_data.lat;
    const targetLng = targetProfile.location_data.lng;
    
    if (!targetLat || !targetLng) return targetProfile.distance;
    
    // Haversine formula for distance calculation
    const R = 3959; // Earth's radius in miles
    const dLat = (targetLat - userLat) * Math.PI / 180;
    const dLng = (targetLng - userLng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(userLat * Math.PI / 180) * Math.cos(targetLat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return Math.round(distance * 10) / 10;
  };

  // Filter profiles based on current filters, user location, and identity preferences
  const getFilteredProfiles = () => {
    if (loading) return [];
    
    return profiles.filter(targetProfile => {
      // Identity compatibility check - this is the core filtering logic
      if (!isIdentityCompatible(targetProfile)) return false;

      // Age filter
      if (targetProfile.age && (targetProfile.age < filters.ageRange[0] || targetProfile.age > filters.ageRange[1])) return false;
      
      // Distance filter - use calculated distance if available
      const distance = hasLocation ? calculateDistance(targetProfile) : targetProfile.distance || 0;
      if (distance > filters.maxDistance) return false;
      
      // Interest filter
      if (filters.interests.length > 0 && targetProfile.interests) {
        const hasSharedInterest = filters.interests.some(interest => 
          targetProfile.interests!.includes(interest)
        );
        if (!hasSharedInterest) return false;
      }
      
      // RIF compatibility filters
      if (rifProfile && targetProfile.rifProfile && Object.values(filters.rifCompatibility).some(v => v)) {
        if (filters.rifCompatibility.pacing) {
          const pacingDiff = Math.abs(rifProfile.pacing_preferences - targetProfile.rifProfile.pacing_preferences);
          if (pacingDiff > 2) return false;
        }
        if (filters.rifCompatibility.emotional) {
          const emotionalDiff = Math.abs(rifProfile.emotional_readiness - targetProfile.rifProfile.emotional_readiness);
          if (emotionalDiff > 2) return false;
        }
        if (filters.rifCompatibility.boundaries) {
          const boundaryDiff = Math.abs(rifProfile.boundary_respect - targetProfile.rifProfile.boundary_respect);
          if (boundaryDiff > 2) return false;
        }
        if (filters.rifCompatibility.intent) {
          const intentDiff = Math.abs(rifProfile.intent_clarity - targetProfile.rifProfile.intent_clarity);
          if (intentDiff > 2) return false;
        }
      }
      
      // High compatibility filter
      if (filters.showOnlyHighCompatibility && rifProfile && targetProfile.rifProfile) {
        const pacingDiff = Math.abs(rifProfile.pacing_preferences - targetProfile.rifProfile.pacing_preferences);
        const intentDiff = Math.abs(rifProfile.intent_clarity - targetProfile.rifProfile.intent_clarity);
        const emotionalDiff = Math.abs(rifProfile.emotional_readiness - targetProfile.rifProfile.emotional_readiness);
        const avgCompatibility = ((10 - pacingDiff) + (10 - intentDiff) + (10 - emotionalDiff)) / 30;
        if (avgCompatibility < 0.8) return false;
      }
      
      return true;
    });
  };

  const filteredProfiles = getFilteredProfiles();

  // Assign map positions to profiles
  const profilesWithPositions = filteredProfiles.map((profile, index) => ({
    ...profile,
    // Distribute profiles across the map with some randomization
    x: 20 + (index * 15) % 60 + Math.random() * 10,
    y: 25 + (index * 12) % 50 + Math.random() * 10,
    id: index + 1
  }));

  const handleProfileClick = (profile: any) => {
    setSelectedProfile(profile);
    setSelectedPin(profile.id);
  };

  const handleLike = async () => {
    if (!selectedProfile) return;
    
    const success = await likeUser(selectedProfile.user_id);
    if (success) {
      setSelectedProfile(null);
      setSelectedPin(null);
    }
  };

  const handleMessage = async () => {
    if (!selectedProfile) return;
    
    const conversationId = await startConversation(selectedProfile.user_id);
    if (conversationId) {
      // Get profile name
      const profileName = (selectedProfile as any).profiles?.name || 'User';
      const profileImage = selectedProfile.photos?.[0];
      
      setChatData({
        conversationId,
        matchUserId: selectedProfile.user_id,
        matchName: profileName,
        matchImage: profileImage
      });
      
      setSelectedProfile(null);
      setSelectedPin(null);
      setShowChat(true);
    }
  };

  // Show location prompt for first-time discovery users
  useEffect(() => {
    if (!hasLocation && !showLocationPrompt) {
      const timer = setTimeout(() => {
        setShowLocationPrompt(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasLocation, showLocationPrompt]);

  // Auto-show insights for high compatibility matches
  useEffect(() => {
    if (rifProfile && !showInsight && filteredProfiles.length > 0) {
      const highCompatibilityProfiles = filteredProfiles.filter(profile => {
        if (!profile.rifProfile) return false;
        const pacingDiff = Math.abs(rifProfile.pacing_preferences - profile.rifProfile.pacing_preferences);
        const intentDiff = Math.abs(rifProfile.intent_clarity - profile.rifProfile.intent_clarity);
        return pacingDiff <= 2 && intentDiff <= 2;
      });

      if (highCompatibilityProfiles.length > 0) {
        const randomProfile = highCompatibilityProfiles[Math.floor(Math.random() * highCompatibilityProfiles.length)];
        setTimeout(() => {
          setInsightTarget(randomProfile);
          setShowInsight(true);
        }, 3000);
      }
    }
  }, [rifProfile, filteredProfiles, showInsight]);

  const hasIdentityPreferences = profile?.preference_to_see?.length > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-jet-black flex items-center justify-center">
        <div className="text-white">Loading profiles...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-jet-black relative overflow-hidden">
      {/* Dark map background with grid overlay */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px),
            url('https://images.unsplash.com/photo-1574169208507-84376144848b?w=1200&h=800&fit=crop&crop=edges')
          `,
          backgroundSize: '2rem 2rem, 2rem 2rem, cover',
          backgroundPosition: '0 0, 0 0, center',
          opacity: 0.1
        }}
      />
      
      {/* Location Prompt for new users */}
      {showLocationPrompt && !hasLocation && (
        <div className="absolute top-20 left-6 right-6 z-20">
          <div className="bg-charcoal-gray/95 backdrop-blur-xl rounded-xl p-4 border border-goldenrod/30 shadow-2xl">
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-goldenrod mt-0.5" />
              <div className="flex-1">
                <h4 className="text-white font-medium mb-1">Discover people nearby</h4>
                <p className="text-gray-400 text-sm mb-3">
                  Share your approximate location to see better matches in your area
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setShowLocationPrompt(false);
                      // Could trigger location modal here
                    }}
                    className="px-3 py-1 bg-goldenrod-gradient text-jet-black text-sm rounded-lg font-medium"
                  >
                    Add Location
                  </button>
                  <button
                    onClick={() => setShowLocationPrompt(false)}
                    className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded-lg"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Location Labels */}
      {locations.map((location) => (
        <div
          key={location.id}
          className="absolute text-xs font-semibold text-white/40 uppercase tracking-wider pointer-events-none"
          style={{
            left: `${location.x}%`,
            top: `${location.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {location.name}
        </div>
      ))}

      {/* Profile Pins */}
      {profilesWithPositions.map((profile) => (
        <div
          key={profile.id}
          className="absolute"
          style={{
            left: `${profile.x}%`,
            top: `${profile.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <RIFProfileCard
            userProfile={profile.rifProfile}
            currentUserProfile={rifProfile || undefined}
            name={(profile as any).profiles?.name || 'User'}
            age={profile.age || 0}
            image={profile.photos?.[0] || ''}
            onClick={() => handleProfileClick(profile)}
          />
        </div>
      ))}

      {/* Header with filters */}
      <div className="absolute top-0 left-0 right-0 z-10 p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-light text-white">Discover</h1>
            <p className="text-gray-400 text-sm mt-1">
              {filteredProfiles.length} people nearby
              {hasLocation && (
                <span className="text-goldenrod"> • Location enabled</span>
              )}
              {hasIdentityPreferences && (
                <span className="text-goldenrod"> • Identity preferences active</span>
              )}
              {rifProfile && (
                <span> • Emotional compatibility enabled</span>
              )}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <DiscoveryFilters 
              onFiltersChange={setFilters}
              rifProfile={rifProfile}
            />
            
            {rifProfile && (
              <div className="bg-charcoal-gray/50 backdrop-blur-sm rounded-lg px-3 py-2 border border-goldenrod/30">
                <div className="text-xs text-goldenrod font-medium">RIF Active</div>
                <div className="text-xs text-gray-400">Enhanced matching enabled</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Selection Overlay */}
      {selectedProfile && (
        <ProfileSelectionOverlay
          profile={{
            id: selectedProfile.id || 0,
            name: (selectedProfile as any).profiles?.name || 'User',
            age: selectedProfile.age || 0,
            image: selectedProfile.photos?.[0] || '',
            bio: selectedProfile.bio || '',
            interests: selectedProfile.interests || [],
            distance: hasLocation ? calculateDistance(selectedProfile) : selectedProfile.distance,
            rifProfile: selectedProfile.rifProfile
          }}
          currentUserProfile={rifProfile}
          onClose={() => {
            setSelectedProfile(null);
            setSelectedPin(null);
          }}
          onLike={handleLike}
          onMessage={handleMessage}
        />
      )}

      {/* RIF Insight Overlay */}
      {showInsight && insightTarget && (
        <RIFInsightOverlay
          type="discovery"
          targetUser={insightTarget}
          onDismiss={() => setShowInsight(false)}
          onAction={() => {
            setShowInsight(false);
            setSelectedProfile(insightTarget);
          }}
        />
      )}

      {/* Chat Modal */}
      {showChat && chatData && (
        <ChatModal
          isOpen={showChat}
          onClose={() => setShowChat(false)}
          conversationId={chatData.conversationId}
          matchUserId={chatData.matchUserId}
          matchName={chatData.matchName}
          matchImage={chatData.matchImage}
        />
      )}
    </div>
  );
};
