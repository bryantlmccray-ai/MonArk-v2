import React from 'react';
import { Heart, Clock, Shield, Target, MessageCircle, Sparkles, Star, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DiscoveryProfile } from '@/hooks/useDiscoveryProfiles';
import { useCompatibilityScoring } from '@/hooks/useCompatibilityScoring';
import { useMatching } from '@/hooks/useMatching';

interface EnhancedProfileCardProps {
  profile: DiscoveryProfile;
  currentUserRIF?: any;
  onClick: () => void;
}

export const EnhancedProfileCard: React.FC<EnhancedProfileCardProps> = ({
  profile,
  currentUserRIF,
  onClick
}) => {
  const { submitFeedback } = useCompatibilityScoring();
  const { likeUser, startConversation } = useMatching();

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await likeUser(profile.user_id);
    if (success) {
      // Submit positive feedback for ML learning
      await submitFeedback({
        target_user_id: profile.user_id,
        interaction_type: 'like',
        feedback_score: 8,
        interaction_context: 'profile_discovery'
      });
    }
  };

  const handleMessage = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const conversationId = await startConversation(profile.user_id);
    if (conversationId) {
      // Submit positive feedback for messaging
      await submitFeedback({
        target_user_id: profile.user_id,
        interaction_type: 'message',
        feedback_score: 9,
        interaction_context: 'direct_message'
      });
    }
  };

  const getCompatibilityBadge = () => {
    const score = profile.compatibilityScore?.overall_score || 0;
    if (score > 0.8) {
      return { label: 'Exceptional Match', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
    } else if (score > 0.65) {
      return { label: 'Great Match', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
    } else if (score > 0.5) {
      return { label: 'Good Match', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
    }
    return null;
  };

  const compatibilityBadge = getCompatibilityBadge();
  const highlights = profile.compatibilityScore?.highlights || [];

  return (
    <div
      onClick={onClick}
      className={`relative cursor-pointer group ${
        profile.isHighlighted ? 'ring-2 ring-goldenrod/50 shadow-golden-glow' : ''
      }`}
    >
      <div className="relative">
        <img
          src={profile.photos?.[0] || '/placeholder.svg'}
          alt={`${profile.user_id}'s profile`}
          className={`w-12 h-12 rounded-full border-2 transition-all duration-300 group-hover:scale-110 ${
            profile.isHighlighted 
              ? 'border-goldenrod/70 shadow-lg' 
              : 'border-white/30 group-hover:border-goldenrod/50'
          }`}
        />
        
        {/* Highlight indicators */}
        {profile.isHighlighted && (
          <>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-goldenrod rounded-full border border-jet-black flex items-center justify-center">
              <Sparkles className="h-2 w-2 text-jet-black" />
            </div>
            <div className="absolute -top-1 -left-1 w-3 h-3 bg-emerald-500 rounded-full border border-jet-black animate-pulse" />
          </>
        )}

        {/* RIF indicator */}
        {profile.rifProfile && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-purple-500 rounded-full border border-jet-black" />
        )}
      </div>
      
      {/* Enhanced profile preview on hover */}
      <div className="absolute -bottom-64 left-1/2 transform -translate-x-1/2 bg-charcoal-gray/95 backdrop-blur-xl rounded-lg p-6 border border-goldenrod/30 opacity-0 group-hover:opacity-100 transition-all duration-300 w-96 z-20 shadow-2xl">
        <div className="space-y-4">
          {/* Header with name and compatibility */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-white font-medium text-lg">
                  {profile.user_id.slice(0, 8)}, {profile.age || 25}
                </p>
                {profile.distance && (
                  <div className="flex items-center text-gray-400 text-sm">
                    <MapPin className="h-3 w-3 mr-1" />
                    {profile.distance}km
                  </div>
                )}
              </div>
              
              {/* Compatibility score */}
              {compatibilityBadge && (
                <Badge className={`text-xs font-medium ${compatibilityBadge.color}`}>
                  <Star className="h-3 w-3 mr-1" />
                  {compatibilityBadge.label}
                </Badge>
              )}
            </div>
          </div>

          {/* Compatibility highlights */}
          {highlights.length > 0 && (
            <div className="space-y-2">
              <p className="text-goldenrod text-sm font-medium">Why you might connect:</p>
              <div className="space-y-1">
                {highlights.slice(0, 3).map((highlight, index) => (
                  <div key={index} className="flex items-center text-gray-300 text-sm">
                    <div className="w-1.5 h-1.5 bg-goldenrod rounded-full mr-2" />
                    {highlight}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RIF compatibility details */}
          {profile.compatibilityScore && (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-400">Emotional Alignment</span>
                  <span className="text-white">{Math.round(profile.compatibilityScore.rif_compatibility * 100)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Shared Interests</span>
                  <span className="text-white">{Math.round(profile.compatibilityScore.interest_similarity * 100)}%</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-400">Communication Style</span>
                  <span className="text-white">{Math.round(profile.compatibilityScore.behavioral_alignment * 100)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Proximity</span>
                  <span className="text-white">{Math.round(profile.compatibilityScore.location_proximity * 100)}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Interests preview */}
          {profile.interests && profile.interests.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {profile.interests.slice(0, 4).map((interest, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-goldenrod/20 text-goldenrod text-xs rounded-md border border-goldenrod/30"
                >
                  {interest}
                </span>
              ))}
              {profile.interests.length > 4 && (
                <span className="px-2 py-1 bg-gray-700/50 text-gray-400 text-xs rounded-md">
                  +{profile.interests.length - 4} more
                </span>
              )}
            </div>
          )}

          {/* Confidence indicator */}
          {profile.compatibilityScore?.confidence_level && (
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Match Confidence</span>
              <div className="flex items-center">
                <div className="w-16 h-1 bg-gray-700 rounded-full overflow-hidden mr-2">
                  <div 
                    className="h-full bg-goldenrod transition-all duration-300"
                    style={{ width: `${profile.compatibilityScore.confidence_level * 100}%` }}
                  />
                </div>
                <span>{Math.round(profile.compatibilityScore.confidence_level * 100)}%</span>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex space-x-2 pt-2">
            <button 
              onClick={handleLike}
              className="flex-1 py-2.5 bg-goldenrod-gradient text-jet-black font-medium rounded-lg text-sm hover:shadow-golden-glow transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <Heart className="h-4 w-4" />
              <span>Show Interest</span>
            </button>
            <button 
              onClick={handleMessage}
              className="flex-1 py-2.5 bg-primary/20 border border-primary/30 hover:bg-primary/30 text-primary font-medium rounded-lg text-sm transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Start Chat</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};