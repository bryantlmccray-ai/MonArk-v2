import React, { useState, useEffect } from 'react';
import { RIFProfileCard } from './RIFProfileCard';
import { RIFInsightOverlay } from '../rif/RIFInsightOverlay';
import { DiscoveryFilters, DiscoveryFilters as FilterType } from './DiscoveryFilters';
import { ProfileSelectionOverlay } from './ProfileSelectionOverlay';
import { useRIF } from '@/hooks/useRIF';
import { toast } from 'sonner';
import { useProfile } from '@/hooks/useProfile';
import { MapPin } from 'lucide-react';

export const DiscoveryMap: React.FC = () => {
  const [selectedPin, setSelectedPin] = useState<number | null>(null);
  const [showInsight, setShowInsight] = useState<boolean>(false);
  const [insightTarget, setInsightTarget] = useState<any>(null);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
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

  // Enhanced profile data with interests and compatibility scoring
  const allProfilePins = [
    { 
      id: 1, x: 42, y: 35, name: 'Alex', age: 28, distance: 2.3,
      bio: "Love exploring new coffee shops and hiking trails. Always up for deep conversations about life and dreams.",
      interests: ['Coffee', 'Hiking', 'Books', 'Photography'],
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      rifProfile: { intent_clarity: 8, pacing_preferences: 3, emotional_readiness: 9, boundary_respect: 8, post_date_alignment: 7 }
    },
    { 
      id: 2, x: 58, y: 42, name: 'Maya', age: 26, distance: 1.8,
      bio: "Artist and yoga instructor seeking genuine connections. I believe in taking time to really know someone.",
      interests: ['Art', 'Yoga', 'Music', 'Nature'],
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b047?w=150&h=150&fit=crop&crop=face',
      rifProfile: { intent_clarity: 6, pacing_preferences: 7, emotional_readiness: 7, boundary_respect: 9, post_date_alignment: 8 }
    },
    { 
      id: 3, x: 30, y: 48, name: 'Jordan', age: 29, distance: 4.2,
      bio: "Tech professional who loves board games and cooking. Looking for someone to share adventures with.",
      interests: ['Technology', 'Gaming', 'Cooking', 'Travel'],
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      rifProfile: { intent_clarity: 9, pacing_preferences: 5, emotional_readiness: 8, boundary_respect: 7, post_date_alignment: 9 }
    },
    { 
      id: 4, x: 67, y: 38, name: 'Sam', age: 27, distance: 3.1,
      bio: "Fitness enthusiast and music lover. Enjoy spontaneous adventures and meaningful conversations.",
      interests: ['Fitness', 'Music', 'Dancing', 'Sports'],
      image: 'https://images.unsplash.com/photo-1539571696247-f4d8e4e47f66?w=150&h=150&fit=crop&crop=face',
      rifProfile: { intent_clarity: 5, pacing_preferences: 8, emotional_readiness: 6, boundary_respect: 6, post_date_alignment: 5 }
    },
    { 
      id: 5, x: 38, y: 32, name: 'Casey', age: 30, distance: 2.7,
      bio: "Writer and book club organizer. I appreciate the beauty in everyday moments and deep conversations.",
      interests: ['Books', 'Writing', 'Movies', 'Art'],
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      rifProfile: { intent_clarity: 7, pacing_preferences: 4, emotional_readiness: 8, boundary_respect: 9, post_date_alignment: 8 }
    },
    { 
      id: 6, x: 26, y: 52, name: 'Riley', age: 25, distance: 5.5,
      bio: "Photographer and travel enthusiast. Love capturing moments and exploring new cultures.",
      interests: ['Photography', 'Travel', 'Food', 'Nature'],
      image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
      rifProfile: { intent_clarity: 8, pacing_preferences: 6, emotional_readiness: 7, boundary_respect: 8, post_date_alignment: 7 }
    },
  ];

  // Enhanced profile distance calculation
  const calculateDistance = (profile: any) => {
    if (!hasLocation || !profile.location) return profile.distance;
    
    // If user has location but profile doesn't, use default distance
    if (!profile.location.lat || !profile.location.lng) return profile.distance;
    
    const userLat = profile.location_data.lat;
    const userLng = profile.location_data.lng;
    
    // Simple distance calculation (Haversine formula would be more accurate)
    const latDiff = Math.abs(userLat - profile.location.lat);
    const lngDiff = Math.abs(userLng - profile.location.lng);
    const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 69; // Rough miles conversion
    
    return Math.round(distance * 10) / 10;
  };

  // Filter profiles based on current filters and user location
  const getFilteredProfiles = () => {
    return allProfilePins.filter(pin => {
      // Age filter
      if (pin.age < filters.ageRange[0] || pin.age > filters.ageRange[1]) return false;
      
      // Distance filter - use calculated distance if available
      const distance = hasLocation ? calculateDistance(pin) : pin.distance;
      if (distance > filters.maxDistance) return false;
      
      // Interest filter
      if (filters.interests.length > 0) {
        const hasSharedInterest = filters.interests.some(interest => 
          pin.interests.includes(interest)
        );
        if (!hasSharedInterest) return false;
      }
      
      // RIF compatibility filters
      if (rifProfile && Object.values(filters.rifCompatibility).some(v => v)) {
        if (filters.rifCompatibility.pacing) {
          const pacingDiff = Math.abs(rifProfile.pacing_preferences - pin.rifProfile.pacing_preferences);
          if (pacingDiff > 2) return false;
        }
        if (filters.rifCompatibility.emotional) {
          const emotionalDiff = Math.abs(rifProfile.emotional_readiness - pin.rifProfile.emotional_readiness);
          if (emotionalDiff > 2) return false;
        }
        if (filters.rifCompatibility.boundaries) {
          const boundaryDiff = Math.abs(rifProfile.boundary_respect - pin.rifProfile.boundary_respect);
          if (boundaryDiff > 2) return false;
        }
        if (filters.rifCompatibility.intent) {
          const intentDiff = Math.abs(rifProfile.intent_clarity - pin.rifProfile.intent_clarity);
          if (intentDiff > 2) return false;
        }
      }
      
      // High compatibility filter
      if (filters.showOnlyHighCompatibility && rifProfile) {
        const pacingDiff = Math.abs(rifProfile.pacing_preferences - pin.rifProfile.pacing_preferences);
        const intentDiff = Math.abs(rifProfile.intent_clarity - pin.rifProfile.intent_clarity);
        const emotionalDiff = Math.abs(rifProfile.emotional_readiness - pin.rifProfile.emotional_readiness);
        const avgCompatibility = ((10 - pacingDiff) + (10 - intentDiff) + (10 - emotionalDiff)) / 30;
        if (avgCompatibility < 0.8) return false;
      }
      
      return true;
    });
  };

  const filteredProfiles = getFilteredProfiles();

  const handleProfileClick = (pin: any) => {
    setSelectedProfile(pin);
    setSelectedPin(pin.id);
  };

  const handleLike = () => {
    if (selectedProfile) {
      toast.success(`Liked ${selectedProfile.name}! We'll let you know if it's a match.`);
      setSelectedProfile(null);
      setSelectedPin(null);
    }
  };

  const handleMessage = () => {
    if (selectedProfile) {
      toast.success(`Starting conversation with ${selectedProfile.name}!`);
      setSelectedProfile(null);
      setSelectedPin(null);
      // Here you would navigate to the conversation screen
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
      const highCompatibilityPins = filteredProfiles.filter(pin => {
        const pacingDiff = Math.abs(rifProfile.pacing_preferences - pin.rifProfile.pacing_preferences);
        const intentDiff = Math.abs(rifProfile.intent_clarity - pin.rifProfile.intent_clarity);
        return pacingDiff <= 2 && intentDiff <= 2;
      });

      if (highCompatibilityPins.length > 0) {
        const randomPin = highCompatibilityPins[Math.floor(Math.random() * highCompatibilityPins.length)];
        setTimeout(() => {
          setInsightTarget(randomPin);
          setShowInsight(true);
        }, 3000);
      }
    }
  }, [rifProfile, filteredProfiles, showInsight]);

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
      {filteredProfiles.map((pin) => (
        <div
          key={pin.id}
          className="absolute"
          style={{
            left: `${pin.x}%`,
            top: `${pin.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <RIFProfileCard
            userProfile={pin.rifProfile}
            currentUserProfile={rifProfile || undefined}
            name={pin.name}
            age={pin.age}
            image={pin.image}
            onClick={() => handleProfileClick(pin)}
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
          profile={selectedProfile}
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
    </div>
  );
};
