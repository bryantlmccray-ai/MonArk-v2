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
      return { label: 'Exceptional', color: 'bg-primary text-primary-foreground', glow: true };
    } else if (score > 0.65) {
      return { label: 'Great', color: 'bg-secondary text-secondary-foreground', glow: false };
    } else if (score > 0.5) {
      return { label: 'Good', color: 'bg-accent text-accent-foreground', glow: false };
    }
    return null;
  };

  const compatibilityBadge = getCompatibilityBadge();
  const highlights = profile.compatibilityScore?.highlights || [];

  return (
    <div className="relative group">
      {/* Map Pin */}
      <div
        onClick={onClick}
        className={`relative cursor-pointer transition-all duration-300 group-hover:scale-110 ${
          profile.isHighlighted ? 'animate-pulse' : ''
        }`}
      >
        {/* Profile Image Pin */}
        <div className={`relative w-8 h-8 rounded-full border-2 overflow-hidden ${
          profile.isHighlighted 
            ? 'border-primary shadow-lg ring-2 ring-primary/50' 
            : 'border-border hover:border-primary/50'
        }`}>
          <img
            src={profile.photos?.[0] || '/placeholder.svg'}
            alt={`${profile.user_id}'s profile`}
            className="w-full h-full object-cover"
          />
          
          {/* Online indicator */}
          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-background" />
        </div>

        {/* Compatibility indicator */}
        {compatibilityBadge && (
          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${
            compatibilityBadge.glow ? 'bg-primary animate-pulse' : 'bg-secondary'
          } border border-background`} />
        )}
      </div>

      {/* Hover Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50">
        <div className="bg-popover/95 backdrop-blur-sm rounded-lg p-3 border shadow-lg w-56">
          <div className="space-y-2">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-white">
                  {profile.user_id.slice(0, 8)}, {profile.age || 25}
                </p>
                {profile.distance && (
                  <div className="flex items-center text-gray-300 text-xs">
                    <MapPin className="h-3 w-3 mr-1" />
                    {profile.distance}km away
                  </div>
                )}
              </div>
              {compatibilityBadge && (
                <Badge className={`text-xs ${compatibilityBadge.color}`}>
                  <Star className="h-2 w-2 mr-1" />
                  {compatibilityBadge.label}
                </Badge>
              )}
            </div>

            {/* Bio preview */}
            {profile.bio && (
              <p className="text-xs text-gray-300 line-clamp-2">
                {profile.bio}
              </p>
            )}

            {/* Compatibility highlights */}
            {highlights.length > 0 && (
              <div className="space-y-1">
                <p className="text-goldenrod text-xs font-medium">Connection potential:</p>
                {highlights.slice(0, 2).map((highlight, index) => (
                  <div key={index} className="flex items-start text-gray-300 text-xs">
                    <div className="w-1 h-1 bg-goldenrod rounded-full mr-2 mt-1.5 flex-shrink-0" />
                    <span className="line-clamp-1">{highlight}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Interests */}
            {profile.interests && profile.interests.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {profile.interests.slice(0, 3).map((interest, index) => (
                  <span 
                    key={index}
                    className="px-1.5 py-0.5 bg-secondary text-secondary-foreground text-xs rounded"
                  >
                    {interest}
                  </span>
                ))}
                {profile.interests.length > 3 && (
                  <span className="px-1.5 py-0.5 bg-gray-700 text-gray-300 text-xs rounded">
                    +{profile.interests.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Quick actions */}
            <div className="flex gap-1 pt-1">
              <button 
                onClick={handleLike}
                className="flex-1 py-1.5 px-2 bg-primary text-primary-foreground font-medium rounded text-xs hover:bg-primary/90 transition-colors flex items-center justify-center gap-1"
              >
                <Heart className="h-3 w-3" />
                Like
              </button>
              <button 
                onClick={handleMessage}
                className="flex-1 py-1.5 px-2 bg-secondary text-secondary-foreground font-medium rounded text-xs hover:bg-secondary/80 transition-colors flex items-center justify-center gap-1"
              >
                <MessageCircle className="h-3 w-3" />
                Chat
              </button>
            </div>
          </div>
        </div>
        
        {/* Tooltip arrow */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-border" />
      </div>
    </div>
  );
};