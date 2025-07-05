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
      return { label: 'Exceptional Match', color: 'bg-primary/20 text-primary border-primary/30' };
    } else if (score > 0.65) {
      return { label: 'Great Match', color: 'bg-secondary/80 text-secondary-foreground border-secondary' };
    } else if (score > 0.5) {
      return { label: 'Good Match', color: 'bg-accent/20 text-accent-foreground border-accent/30' };
    }
    return null;
  };

  const compatibilityBadge = getCompatibilityBadge();
  const highlights = profile.compatibilityScore?.highlights || [];

  return (
    <div
      onClick={onClick}
      className={`relative cursor-pointer group ${
        profile.isHighlighted ? 'ring-2 ring-primary/50 shadow-lg' : ''
      }`}
    >
      {/* Profile image with indicators */}
      <div className="relative">
        <img
          src={profile.photos?.[0] || '/placeholder.svg'}
          alt={`${profile.user_id}'s profile`}
          className={`w-16 h-16 rounded-full border-2 transition-all duration-300 group-hover:scale-105 ${
            profile.isHighlighted 
              ? 'border-primary/70 shadow-md' 
              : 'border-muted-foreground/30 group-hover:border-primary/50'
          }`}
        />
        
        {/* Compatibility badge */}
        {compatibilityBadge && (
          <div className="absolute -top-2 -right-2">
            <Badge className={`text-xs font-medium ${compatibilityBadge.color} shadow-sm`}>
              <Star className="h-2 w-2 mr-1" />
              {compatibilityBadge.label.split(' ')[0]}
            </Badge>
          </div>
        )}

        {/* Highlight indicator */}
        {profile.isHighlighted && (
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-primary rounded-full border-2 border-background animate-pulse" />
        )}

        {/* RIF indicator */}
        {profile.rifProfile && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-accent rounded-full border-2 border-background" />
        )}
      </div>

      {/* Compact hover tooltip */}
      <div className="absolute top-0 left-full ml-2 bg-popover/95 backdrop-blur-sm rounded-lg p-3 border opacity-0 group-hover:opacity-100 transition-all duration-200 w-64 z-30 shadow-lg pointer-events-none">
        <div className="space-y-2">
          {/* Header */}
          <div className="flex items-center justify-between">
            <p className="text-popover-foreground font-medium text-sm">
              {profile.user_id.slice(0, 8)}, {profile.age || 25}
            </p>
            {profile.distance && (
              <div className="flex items-center text-muted-foreground text-xs">
                <MapPin className="h-3 w-3 mr-1" />
                {profile.distance}km
              </div>
            )}
          </div>

          {/* Compatibility highlights */}
          {highlights.length > 0 && (
            <div className="space-y-1">
              <p className="text-primary text-xs font-medium">Why you might connect:</p>
              {highlights.slice(0, 2).map((highlight, index) => (
                <div key={index} className="flex items-center text-muted-foreground text-xs">
                  <div className="w-1 h-1 bg-primary rounded-full mr-2" />
                  {highlight}
                </div>
              ))}
            </div>
          )}

          {/* Interests preview */}
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
                <span className="px-1.5 py-0.5 bg-muted text-muted-foreground text-xs rounded">
                  +{profile.interests.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-1 pt-1">
            <button 
              onClick={handleLike}
              className="flex-1 py-1 px-2 bg-primary text-primary-foreground font-medium rounded text-xs hover:bg-primary/90 transition-colors flex items-center justify-center gap-1"
            >
              <Heart className="h-3 w-3" />
              Like
            </button>
            <button 
              onClick={handleMessage}
              className="flex-1 py-1 px-2 bg-secondary text-secondary-foreground font-medium rounded text-xs hover:bg-secondary/80 transition-colors flex items-center justify-center gap-1"
            >
              <MessageCircle className="h-3 w-3" />
              Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};