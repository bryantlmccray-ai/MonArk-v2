
import React, { useState } from 'react';
import { Heart, MessageCircle, X, Clock, Shield, Target, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRIF } from '@/hooks/useRIF';

interface ProfileSelectionOverlayProps {
  profile: {
    id: number;
    name: string;
    age: number;
    image: string;
    bio?: string;
    interests?: string[];
    distance?: number;
    rifProfile?: any;
  };
  currentUserProfile?: any;
  onClose: () => void;
  onLike: () => void;
  onMessage: () => void;
}

export const ProfileSelectionOverlay: React.FC<ProfileSelectionOverlayProps> = ({
  profile,
  currentUserProfile,
  onClose,
  onLike,
  onMessage
}) => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'compatibility'>('overview');
  const { calculateCompatibility } = useRIF();

  const getCompatibilityScore = () => {
    if (!currentUserProfile || !profile.rifProfile) return null;
    
    const pacingDiff = Math.abs(currentUserProfile.pacing_preferences - profile.rifProfile.pacing_preferences);
    const intentDiff = Math.abs(currentUserProfile.intent_clarity - profile.rifProfile.intent_clarity);
    const emotionalDiff = Math.abs(currentUserProfile.emotional_readiness - profile.rifProfile.emotional_readiness);
    const boundaryDiff = Math.abs(currentUserProfile.boundary_respect - profile.rifProfile.boundary_respect);
    
    const avgCompatibility = (
      (10 - pacingDiff) + 
      (10 - intentDiff) + 
      (10 - emotionalDiff) + 
      (10 - boundaryDiff)
    ) / 40;
    
    return Math.round(avgCompatibility * 100);
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-goldenrod';
    return 'text-orange-400';
  };

  const compatibilityScore = getCompatibilityScore();

  return (
    <div className="fixed inset-0 bg-jet-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-charcoal-gray/95 backdrop-blur-xl rounded-2xl w-full max-w-lg border border-goldenrod/30 shadow-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative">
          <img
            src={profile.image}
            alt={profile.name}
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-jet-black/80 via-transparent to-transparent" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-jet-black/50 rounded-full text-white hover:bg-jet-black/70 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white">{profile.name}, {profile.age}</h2>
                {profile.distance && (
                  <div className="flex items-center space-x-1 text-gray-300">
                    <MapPin className="h-3 w-3" />
                    <span className="text-sm">{profile.distance} miles away</span>
                  </div>
                )}
              </div>
              
              {compatibilityScore && (
                <div className="bg-jet-black/70 rounded-lg px-3 py-1">
                  <div className="flex items-center space-x-1">
                    <Star className={`h-4 w-4 ${getCompatibilityColor(compatibilityScore)}`} />
                    <span className={`text-sm font-medium ${getCompatibilityColor(compatibilityScore)}`}>
                      {compatibilityScore}% Match
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setSelectedTab('overview')}
            className={`flex-1 p-3 text-sm font-medium transition-colors ${
              selectedTab === 'overview'
                ? 'text-goldenrod border-b-2 border-goldenrod'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Overview
          </button>
          {profile.rifProfile && (
            <button
              onClick={() => setSelectedTab('compatibility')}
              className={`flex-1 p-3 text-sm font-medium transition-colors ${
                selectedTab === 'compatibility'
                  ? 'text-goldenrod border-b-2 border-goldenrod'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Compatibility
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4 max-h-60 overflow-y-auto">
          {selectedTab === 'overview' && (
            <div className="space-y-4">
              {profile.bio && (
                <div>
                  <h4 className="text-white font-medium mb-2">About</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">{profile.bio}</p>
                </div>
              )}

              {profile.interests && profile.interests.length > 0 && (
                <div>
                  <h4 className="text-white font-medium mb-2">Interests</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedTab === 'compatibility' && profile.rifProfile && currentUserProfile && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <div className={`text-3xl font-bold ${getCompatibilityColor(compatibilityScore || 0)}`}>
                  {compatibilityScore}%
                </div>
                <p className="text-gray-400 text-sm">Overall Compatibility</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-blue-400" />
                    <span className="text-sm text-gray-300">Pacing</span>
                  </div>
                  <div className={`text-sm ${
                    Math.abs(currentUserProfile.pacing_preferences - profile.rifProfile.pacing_preferences) <= 2
                      ? 'text-green-400' : 'text-orange-400'
                  }`}>
                    {Math.abs(currentUserProfile.pacing_preferences - profile.rifProfile.pacing_preferences) <= 2
                      ? 'Aligned' : 'Different'}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Heart className="h-4 w-4 text-red-400" />
                    <span className="text-sm text-gray-300">Emotional Readiness</span>
                  </div>
                  <div className={`text-sm ${
                    Math.abs(currentUserProfile.emotional_readiness - profile.rifProfile.emotional_readiness) <= 2
                      ? 'text-green-400' : 'text-orange-400'
                  }`}>
                    {Math.abs(currentUserProfile.emotional_readiness - profile.rifProfile.emotional_readiness) <= 2
                      ? 'Compatible' : 'Variable'}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-purple-400" />
                    <span className="text-sm text-gray-300">Boundaries</span>
                  </div>
                  <div className={`text-sm ${
                    Math.abs(currentUserProfile.boundary_respect - profile.rifProfile.boundary_respect) <= 2
                      ? 'text-green-400' : 'text-orange-400'
                  }`}>
                    {Math.abs(currentUserProfile.boundary_respect - profile.rifProfile.boundary_respect) <= 2
                      ? 'Respectful' : 'Different'}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-green-400" />
                    <span className="text-sm text-gray-300">Intent Clarity</span>
                  </div>
                  <div className={`text-sm ${
                    Math.abs(currentUserProfile.intent_clarity - profile.rifProfile.intent_clarity) <= 2
                      ? 'text-green-400' : 'text-orange-400'
                  }`}>
                    {Math.abs(currentUserProfile.intent_clarity - profile.rifProfile.intent_clarity) <= 2
                      ? 'Clear' : 'Varies'}
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-3 mt-4">
                <p className="text-xs text-gray-400 leading-relaxed">
                  {compatibilityScore >= 80
                    ? "High compatibility suggests you share similar relationship approaches and values."
                    : compatibilityScore >= 60
                    ? "Good compatibility with some areas to explore together."
                    : "Different approaches that could complement each other with open communication."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex space-x-3">
            <Button
              onClick={onLike}
              className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-medium py-3"
            >
              <Heart className="h-4 w-4 mr-2" />
              Like
            </Button>
            
            <Button
              onClick={onMessage}
              className="flex-1 bg-goldenrod-gradient text-jet-black font-medium py-3 hover:shadow-golden-glow transition-all duration-300"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Message
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
