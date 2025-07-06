
import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, X, Clock, Shield, Target, MapPin, Star, Search, SlidersHorizontal, Navigation, Bell, Wifi, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { RIFProfileCard } from './RIFProfileCard';
import { EnhancedProfileCard } from './EnhancedProfileCard';
import { MLInsightsPanel } from './MLInsightsPanel';
import { RIFInsightOverlay } from '../rif/RIFInsightOverlay';
import { DiscoveryFilters, DiscoveryFilters as FilterType } from './DiscoveryFilters';
import { ProfileSelectionOverlay } from './ProfileSelectionOverlay';
import { ChatModal } from '../chat/ChatModal';
import { ActivityFeed } from './ActivityFeed';
import { LocationConsentModal } from '../location/LocationConsentModal';
import { useRIF } from '@/hooks/useRIF';
import { useProfile } from '@/hooks/useProfile';
import { useDiscoveryProfiles, DiscoveryProfile } from '@/hooks/useDiscoveryProfiles';
import { useMatching } from '@/hooks/useMatching';
import { useRealTimePresence } from '@/hooks/useRealTimePresence';
import { useActivityFeed } from '@/hooks/useActivityFeed';
import { useProximityAlerts } from '@/hooks/useProximityAlerts';

// Prototype profiles for testing - structured to match database schema
const prototypeProfiles: (DiscoveryProfile & { profiles?: { name: string } })[] = [
  {
    id: 'proto-1',
    user_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    bio: 'Software engineer who loves hiking and photography. Looking for genuine connections and meaningful conversations.',
    age: 28,
    location: null,
    interests: ['Photography', 'Hiking', 'Technology', 'Coffee'],
    photos: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face'],
    date_preferences: {},
    is_profile_complete: true,
    location_data: null,
    location_consent: false,
    show_location_on_profile: true,
    gender_identity: 'Man',
    gender_identity_custom: null,
    sexual_orientation: null,
    sexual_orientation_custom: null,
    preference_to_see: ['Women'],
    preference_to_be_seen_by: [],
    discovery_privacy_mode: 'open',
    identity_visibility: true,
    last_preference_update: new Date().toISOString(),
    date_of_birth: null,
    age_verified: true,
    age_verification_timestamp: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    distance: 2.5,
    profiles: { name: 'Alex Chen' },
    rifProfile: {
      intent_clarity: 8,
      pacing_preferences: 6,
      emotional_readiness: 7,
      boundary_respect: 9,
      user_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      is_active: true,
      id: 'rif-proto-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  },
  {
    id: 'proto-2',
    user_id: 'b2c3d4e5-f6g7-8901-bcde-f23456789012',
    bio: 'Artist and yoga instructor. I believe in taking things slow and building authentic connections.',
    age: 26,
    location: null,
    interests: ['Art', 'Yoga', 'Meditation', 'Travel'],
    photos: ['https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face'],
    date_preferences: {},
    is_profile_complete: true,
    location_data: null,
    location_consent: false,
    show_location_on_profile: true,
    gender_identity: 'Woman',
    gender_identity_custom: null,
    sexual_orientation: null,
    sexual_orientation_custom: null,
    preference_to_see: ['Men', 'Nonbinary people'],
    preference_to_be_seen_by: [],
    discovery_privacy_mode: 'open',
    identity_visibility: true,
    last_preference_update: new Date().toISOString(),
    date_of_birth: null,
    age_verified: true,
    age_verification_timestamp: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    distance: 4.1,
    profiles: { name: 'Maya Rodriguez' },
    rifProfile: {
      intent_clarity: 7,
      pacing_preferences: 4,
      emotional_readiness: 8,
      boundary_respect: 8,
      user_id: 'b2c3d4e5-f6g7-8901-bcde-f23456789012',
      is_active: true,
      id: 'rif-proto-2',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  },
  {
    id: 'proto-3',
    user_id: 'c3d4e5f6-g7h8-9012-cdef-345678901234',
    bio: 'Product designer with a passion for sustainable living. Values open communication and emotional intelligence.',
    age: 30,
    location: null,
    interests: ['Design', 'Sustainability', 'Cooking', 'Books'],
    photos: ['https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face'],
    date_preferences: {},
    is_profile_complete: true,
    location_data: null,
    location_consent: false,
    show_location_on_profile: true,
    gender_identity: 'Nonbinary',
    gender_identity_custom: null,
    sexual_orientation: null,
    sexual_orientation_custom: null,
    preference_to_see: ['Everyone open to connection'],
    preference_to_be_seen_by: [],
    discovery_privacy_mode: 'open',
    identity_visibility: true,
    last_preference_update: new Date().toISOString(),
    date_of_birth: null,
    age_verified: true,
    age_verification_timestamp: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    distance: 1.8,
    profiles: { name: 'Jordan Kim' },
    rifProfile: {
      intent_clarity: 9,
      pacing_preferences: 7,
      emotional_readiness: 9,
      boundary_respect: 9,
      user_id: 'c3d4e5f6-g7h8-9012-cdef-345678901234',
      is_active: true,
      id: 'rif-proto-3',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  },
  {
    id: 'proto-4',
    user_id: 'd4e5f6g7-h8i9-0123-defg-456789012345',
    bio: 'Teacher and weekend musician. Looking for someone who appreciates deep conversations and quiet moments.',
    age: 32,
    location: null,
    interests: ['Music', 'Education', 'Reading', 'Nature'],
    photos: ['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face'],
    date_preferences: {},
    is_profile_complete: true,
    location_data: null,
    location_consent: false,
    show_location_on_profile: true,
    gender_identity: 'Man',
    gender_identity_custom: null,
    sexual_orientation: null,
    sexual_orientation_custom: null,
    preference_to_see: ['Women', 'Nonbinary people'],
    preference_to_be_seen_by: [],
    discovery_privacy_mode: 'open',
    identity_visibility: true,
    last_preference_update: new Date().toISOString(),
    date_of_birth: null,
    age_verified: true,
    age_verification_timestamp: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    distance: 6.2,
    profiles: { name: 'Sam Thompson' },
    rifProfile: {
      intent_clarity: 8,
      pacing_preferences: 5,
      emotional_readiness: 8,
      boundary_respect: 8,
      user_id: 'd4e5f6g7-h8i9-0123-defg-456789012345',
      is_active: true,
      id: 'rif-proto-4',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }
];

export const DiscoveryMap: React.FC = () => {
  const [selectedPin, setSelectedPin] = useState<number | null>(null);
  const [showInsight, setShowInsight] = useState<boolean>(false);
  const [insightTarget, setInsightTarget] = useState<any>(null);
  const [selectedProfile, setSelectedProfile] = useState<DiscoveryProfile | null>(null);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showActivityFeed, setShowActivityFeed] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [mapCenter, setMapCenter] = useState({ x: 50, y: 50 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastPanPosition, setLastPanPosition] = useState({ x: 50, y: 50 });
  const [hasMoved, setHasMoved] = useState(false);
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
  const { profile, refetchProfile } = useProfile();
  const { profiles: realProfiles, loading } = useDiscoveryProfiles();
  const { likeUser, startConversation, loading: matchingLoading } = useMatching();
  const { onlineUsers, isUserOnline } = useRealTimePresence();
  const { activities, addProximityAlert } = useActivityFeed();

  // Add user's own profile to the map
  const userOwnProfile = profile ? {
    ...profile,
    distance: 0, // User is at distance 0 from themselves
    profiles: { name: 'You' },
    rifProfile: rifProfile
  } : null;

  // Combine real profiles with prototypes and user's own profile
  const allProfiles = [
    ...realProfiles, 
    ...prototypeProfiles,
    ...(userOwnProfile ? [userOwnProfile] : [])
  ];

  // Check if user has location enabled
  const hasLocation = profile?.location_consent && profile?.location_data;

  const locations = [
    { id: 1, name: 'DOWNTOWN', x: 48, y: 32, gridX: 3, gridY: 2 },
    { id: 2, name: 'WICKER PARK', x: 32, y: 48, gridX: 2, gridY: 3 },
    { id: 3, name: 'LINCOLN PARK', x: 48, y: 24, gridX: 3, gridY: 1.5 },
    { id: 4, name: 'BUCKTOWN', x: 32, y: 40, gridX: 2, gridY: 2.5 },
    { id: 5, name: 'LOGAN SQUARE', x: 24, y: 40, gridX: 1.5, gridY: 2.5 },
    { id: 6, name: 'RIVER NORTH', x: 56, y: 32, gridX: 3.5, gridY: 2 },
    { id: 7, name: 'GOLD COAST', x: 56, y: 24, gridX: 3.5, gridY: 1.5 },
    { id: 8, name: 'LAKEVIEW', x: 48, y: 16, gridX: 3, gridY: 1 },
  ];

  // Search locations for navigation
  const searchLocations = [
    ...locations,
    { id: 9, name: 'NORTH SIDE', x: 40, y: 20, gridX: 2.5, gridY: 1 },
    { id: 10, name: 'SOUTH SIDE', x: 40, y: 70, gridX: 2.5, gridY: 4 },
    { id: 11, name: 'WEST SIDE', x: 20, y: 40, gridX: 1, gridY: 2.5 },
    { id: 12, name: 'EAST SIDE', x: 70, y: 40, gridX: 4, gridY: 2.5 }
  ];

  // Handle location search with smooth movement
  const handleLocationSearch = (locationName: string) => {
    const location = searchLocations.find(loc => 
      loc.name.toLowerCase().includes(locationName.toLowerCase())
    );
    if (location) {
      smoothPanTo(location.x, location.y);
      setSearchQuery('');
    }
  };

  // Smooth pan to location
  const smoothPanTo = (targetX: number, targetY: number) => {
    const duration = 500;
    const startTime = Date.now();
    const startX = mapCenter.x;
    const startY = mapCenter.y;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
      const easedProgress = easeOutCubic(progress);
      
      const currentX = startX + (targetX - startX) * easedProgress;
      const currentY = startY + (targetY - startY) * easedProgress;
      
      setMapCenter({ x: currentX, y: currentY });
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  };

  // Handle map dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setHasMoved(false);
    setDragStart({ x: e.clientX, y: e.clientY });
    setLastPanPosition(mapCenter);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Only start dragging if mouse moved more than 5 pixels
    if (distance > 5) {
      setHasMoved(true);
      
      const panDeltaX = deltaX * 0.1; // Sensitivity adjustment
      const panDeltaY = deltaY * 0.1;
      
      const newX = Math.max(0, Math.min(100, lastPanPosition.x - panDeltaX));
      const newY = Math.max(0, Math.min(100, lastPanPosition.y - panDeltaY));
      
      setMapCenter({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setHasMoved(false);
  };

  // Handle zoom with wheel
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoomLevel(prev => Math.max(0.5, Math.min(3, prev + zoomDelta)));
  };
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
  const calculateDistance = (targetProfile: DiscoveryProfile): number => {
    if (!hasLocation || !targetProfile.location_data) {
      return typeof targetProfile.distance === 'number' ? targetProfile.distance : 0;
    }
    
    const userLat = profile.location_data.lat;
    const userLng = profile.location_data.lng;
    const targetLat = targetProfile.location_data.lat;
    const targetLng = targetProfile.location_data.lng;
    
    if (!targetLat || !targetLng) {
      return typeof targetProfile.distance === 'number' ? targetProfile.distance : 0;
    }
    
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

  // Enhanced filtering with search functionality
  const getFilteredProfiles = () => {
    if (loading) return [];
    
    return allProfiles.filter(targetProfile => {
      // Exclude user's own profile from filtering (but keep it for display)
      if (targetProfile.user_id === profile?.user_id) return true;
      
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = (targetProfile as any).profiles?.name?.toLowerCase().includes(query);
        const matchesBio = targetProfile.bio?.toLowerCase().includes(query);
        const matchesInterests = targetProfile.interests?.some(interest => 
          interest.toLowerCase().includes(query)
        );
        if (!matchesName && !matchesBio && !matchesInterests) return false;
      }
      
      // Identity compatibility check - this is the core filtering logic
      if (!isIdentityCompatible(targetProfile)) return false;

      // Age filter
      if (targetProfile.age && (targetProfile.age < filters.ageRange[0] || targetProfile.age > filters.ageRange[1])) return false;
      
      // Distance filter - use calculated distance if available
      const distance = hasLocation ? calculateDistance(targetProfile) : (typeof targetProfile.distance === 'number' ? targetProfile.distance : 0);
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

  // Initialize proximity alerts
  useProximityAlerts({
    profiles: filteredProfiles,
    userLocation: hasLocation ? profile.location_data : undefined,
    onProximityAlert: addProximityAlert
  });

  // Assign map positions to profiles
  const profilesWithPositions = filteredProfiles.map((profile, index) => ({
    ...profile,
    // Distribute profiles across the map with some randomization
    x: 20 + (index * 15) % 60 + Math.random() * 10,
    y: 25 + (index * 12) % 50 + Math.random() * 10,
    mapId: index + 1 // Use mapId to avoid conflict with profile.id
  }));

  const handleProfileClick = (profile: any) => {
    setSelectedProfile(profile);
    setSelectedPin(profile.mapId);
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

  const hasIdentityPreferences = profile?.preference_to_see?.length && profile.preference_to_see.length > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-jet-black flex items-center justify-center">
        <div className="text-white">Loading profiles...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-jet-black relative overflow-hidden">
      {/* Interactive Map Container */}
      <div 
        className={`absolute inset-0 transition-transform duration-200 ${hasMoved ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{
          transform: `translate(${(mapCenter.x - 50) * -2}px, ${(mapCenter.y - 50) * -2}px) scale(${zoomLevel})`,
          transformOrigin: 'center center'
        }}
        onMouseDown={(e) => {
          // Don't interfere with profile clicks
          if ((e.target as HTMLElement).closest('.z-30')) return;
          handleMouseDown(e);
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Enhanced grid background */}
        <div className="absolute inset-0">
          {/* Base dark background */}
          <div className="absolute inset-0 bg-gradient-to-br from-jet-black via-charcoal-gray/20 to-jet-black" />
          
          {/* Major grid lines */}
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,215,0,0.1) 2px, transparent 2px),
                linear-gradient(90deg, rgba(255,215,0,0.1) 2px, transparent 2px)
              `,
              backgroundSize: '8rem 8rem',
            }}
          />
          
          {/* Minor grid lines */}
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
              `,
              backgroundSize: '2rem 2rem',
            }}
          />
          
          {/* City overlay for context */}
          <div 
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1574169208507-84376144848b?w=1200&h=800&fit=crop&crop=edges')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        </div>

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
            key={profile.mapId}
            className="absolute z-30 pointer-events-auto"
            style={{
              left: `${profile.x}%`,
              top: `${profile.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleProfileClick(profile);
            }}
          >
            <EnhancedProfileCard
              profile={profile}
              currentUserRIF={rifProfile || undefined}
              onClick={() => handleProfileClick(profile)}
            />
          </div>
        ))}
      </div>
      
      {/* Elegant Floating Search */}
      <div className="absolute top-20 right-6 z-20">
        {!searchExpanded ? (
          /* Minimal Search Button */
          <button
            onClick={() => setSearchExpanded(true)}
            className="group bg-charcoal-gray/80 backdrop-blur-sm rounded-full p-3 border border-goldenrod/20 shadow-lg hover:shadow-golden-glow hover:border-goldenrod/40 transition-all duration-300"
          >
            <Search className="h-5 w-5 text-goldenrod group-hover:scale-110 transition-transform duration-200" />
          </button>
        ) : (
          /* Expanded Search Panel */
          <div className="bg-charcoal-gray/95 backdrop-blur-xl rounded-2xl border border-goldenrod/30 shadow-2xl w-80 animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-goldenrod" />
                <span className="text-sm font-medium text-white">Discover</span>
                {filteredProfiles.length > 0 && (
                  <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-goldenrod/20 text-goldenrod border-goldenrod/30">
                    {filteredProfiles.length}
                  </Badge>
                )}
              </div>
              <button
                onClick={() => {
                  setSearchExpanded(false);
                  setShowFilters(false);
                }}
                className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-700/50 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search people, interests, locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-jet-black/30 border-gray-600/50 text-white placeholder-gray-400 focus:border-goldenrod/50 focus:ring-1 focus:ring-goldenrod/20 rounded-lg"
                />
              </div>

              {/* Filter Toggle & Quick Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs transition-all duration-200 ${
                      showFilters 
                        ? 'bg-goldenrod/20 text-goldenrod border border-goldenrod/30' 
                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                    }`}
                  >
                    <SlidersHorizontal className="h-3 w-3" />
                    <span>Filters</span>
                  </button>
                </div>
                
                <button
                  onClick={() => setShowActivityFeed(!showActivityFeed)}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 transition-all duration-200"
                >
                  <Bell className="h-3 w-3" />
                  <span>Activity</span>
                </button>
              </div>

              {/* Quick Location Pills */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Navigation className="h-3 w-3 text-goldenrod" />
                  <span className="text-xs text-gray-400">Quick nav</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['Downtown', 'Wicker Park', 'Lincoln Park', 'Lakeview'].map((area) => (
                    <button
                      key={area}
                      onClick={() => handleLocationSearch(area)}
                      className="px-2.5 py-1 text-xs bg-gray-700/60 hover:bg-goldenrod hover:text-jet-black rounded-full text-gray-300 transition-all duration-200 border border-gray-600/30 hover:border-goldenrod"
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="pt-3 border-t border-gray-700/50 space-y-3 animate-fade-in">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-400 mb-1.5 block">Distance</label>
                      <Input
                        type="number"
                        placeholder="25 miles"
                        value={filters.maxDistance}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          maxDistance: parseInt(e.target.value) || 25
                        }))}
                        className="bg-jet-black/30 border-gray-600/50 text-white text-xs h-8"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1.5 block">Age Range</label>
                      <div className="text-xs text-gray-300 bg-jet-black/30 rounded px-2 py-1.5 border border-gray-600/50">
                        {filters.ageRange[0]}-{filters.ageRange[1]}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 pt-2">
                    <button
                      onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 2))}
                      className="flex-1 px-2 py-1.5 text-xs bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 rounded-lg transition-colors"
                    >
                      Zoom +
                    </button>
                    <button
                      onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.5))}
                      className="flex-1 px-2 py-1.5 text-xs bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 rounded-lg transition-colors"
                    >
                      Zoom -
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Location Prompt for new users */}
      {showLocationPrompt && !hasLocation && (
        <div className="absolute top-24 left-6 right-6 z-20">
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
                      setShowLocationModal(true);
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
            {/* Activity Feed Button */}
            <Button
              onClick={() => setShowActivityFeed(!showActivityFeed)}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:text-white hover:border-goldenrod relative"
            >
              <Bell className="h-4 w-4" />
              {activities.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-goldenrod rounded-full animate-pulse" />
              )}
            </Button>

            {/* Online Users Count */}
            <div className="bg-charcoal-gray/50 backdrop-blur-sm rounded-lg px-3 py-2 border border-green-500/30">
              <div className="flex items-center space-x-2">
                <Wifi className="h-3 w-3 text-green-400" />
                <span className="text-xs text-green-400 font-medium">{onlineUsers.length} online</span>
              </div>
            </div>

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
            id: (selectedProfile as any).mapId || 0,
            name: (selectedProfile as any).profiles?.name || 'User',
            age: selectedProfile.age || 0,
            image: selectedProfile.photos?.[0] || '',
            bio: selectedProfile.bio || '',
            interests: selectedProfile.interests || [],
            distance: hasLocation ? calculateDistance(selectedProfile) : (selectedProfile.distance || 0),
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

      {/* ML Insights Panel */}
      <MLInsightsPanel />

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

      {/* Activity Feed */}
      <ActivityFeed
        activities={activities}
        isOpen={showActivityFeed}
        onClose={() => setShowActivityFeed(false)}
      />

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

      {/* Location Consent Modal */}
      <LocationConsentModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onSuccess={async () => {
          setShowLocationModal(false);
          setShowLocationPrompt(false);
          // Refresh profile to get updated location data
          await refetchProfile();
        }}
      />
    </div>
  );
};
