import React from 'react';
import { Heart, Clock, Shield, Target, MessageCircle, Sparkles, Star, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DiscoveryProfile } from '@/hooks/useDiscoveryProfiles';
import { useCompatibilityScoring, CompatibilityScore } from '@/hooks/useCompatibilityScoring';
import { useMatching } from '@/hooks/useMatching';

interface EnhancedDiscoveryProfile extends DiscoveryProfile {
  compatibilityScore?: CompatibilityScore;
  isHighlighted?: boolean;
  isVeryHighlighted?: boolean;
}

interface EnhancedProfileCardProps {
  profile: EnhancedDiscoveryProfile;
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
      {/* Enhanced visual effects for highly compatible users */}
      {profile.isVeryHighlighted && (
        <>
          {/* Pulsing outer ring for exceptional compatibility */}
          <div className="absolute -inset-2 bg-gradient-to-r from-primary via-primary to-accent rounded-full animate-ping opacity-20" />
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-full animate-pulse opacity-40" />
        </>
      )}
      
      {profile.isHighlighted && !profile.isVeryHighlighted && (
        /* Subtle glow for high compatibility */
        <div className="absolute -inset-1 bg-primary/30 rounded-full animate-pulse opacity-60" />
      )}

      {/* Map Pin */}
      <div
        onClick={onClick}
        className={`relative cursor-pointer transition-all duration-300 group-hover:scale-110 ${
          profile.isVeryHighlighted 
            ? 'animate-bounce [animation-duration:2s]' 
            : profile.isHighlighted 
            ? 'animate-pulse' 
            : ''
        }`}
      >
        {/* Profile Image Pin */}
        <div className={`relative w-8 h-8 rounded-full border-2 overflow-hidden transition-all duration-300 ${
          profile.isVeryHighlighted
            ? 'border-primary shadow-2xl ring-4 ring-primary/50 scale-110' 
            : profile.isHighlighted 
            ? 'border-primary shadow-lg ring-2 ring-primary/50 scale-105' 
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

        {/* Enhanced compatibility indicator */}
        {compatibilityBadge && (
          <div className={`absolute -bottom-1 -right-1 rounded-full border border-background transition-all duration-300 ${
            profile.isVeryHighlighted
              ? 'w-4 h-4 bg-primary animate-ping'
              : compatibilityBadge.glow 
                ? 'w-3 h-3 bg-primary animate-pulse' 
                : 'w-3 h-3 bg-secondary'
          }`}>
            {profile.isVeryHighlighted && (
              <Star className="w-2 h-2 text-primary-foreground absolute top-0.5 left-0.5" />
            )}
          </div>
        )}
        
        {/* Floating compatibility score for highly compatible users */}
        {(profile.isHighlighted || profile.isVeryHighlighted) && compatibilityBadge && (
          <div className={`absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 ${
            profile.isVeryHighlighted ? 'animate-bounce [animation-duration:2s]' : ''
          }`}>
            <div className={`px-2 py-1 rounded-full text-xs font-bold ${
              profile.isVeryHighlighted
                ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg'
                : 'bg-primary/90 text-primary-foreground'
            }`}>
              {Math.round((profile.compatibilityScore?.overall_score || 0) * 100)}%
            </div>
          </div>
        )}
      </div>

      {/* Hover Tooltip - Enhanced for highly compatible users */}
      <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 ${
        profile.isVeryHighlighted ? 'scale-110' : ''
      }`}>
        <div className={`backdrop-blur-sm rounded-lg p-3 border shadow-lg w-56 ${
          profile.isVeryHighlighted
            ? 'bg-gradient-to-br from-primary/20 via-popover/95 to-accent/20 border-primary/50 shadow-primary/25'
            : profile.isHighlighted
            ? 'bg-popover/95 border-primary/30 shadow-primary/10'
            : 'bg-popover/95 border-border'
        }`}>
          <div className="space-y-2">
            {/* Header with enhanced styling for compatibility */}
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium text-sm ${
                  profile.isVeryHighlighted ? 'text-primary' : 'text-white'
                }`}>
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
                <Badge className={`text-xs ${
                  profile.isVeryHighlighted 
                    ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg' 
                    : compatibilityBadge.color
                }`}>
                  <Star className={`h-2 w-2 mr-1 ${
                    profile.isVeryHighlighted ? 'animate-spin [animation-duration:3s]' : ''
                  }`} />
                  {compatibilityBadge.label}
                  {profile.compatibilityScore && (
                    <span className="ml-1 font-bold">
                      ({Math.round(profile.compatibilityScore.overall_score * 100)}%)
                    </span>
                  )}
                </Badge>
              )}
            </div>

            {/* Bio preview */}
            {profile.bio && (
              <p className="text-xs text-gray-300 line-clamp-2">
                {profile.bio}
              </p>
            )}

            {/* Enhanced compatibility highlights */}
            {highlights.length > 0 && (
              <div className="space-y-1">
                <p className={`text-xs font-medium ${
                  profile.isVeryHighlighted ? 'text-primary' : 'text-goldenrod'
                }`}>
                  {profile.isVeryHighlighted ? '✨ Perfect Match Potential:' : 'Connection potential:'}
                </p>
                {highlights.slice(0, profile.isVeryHighlighted ? 3 : 2).map((highlight, index) => (
                  <div key={index} className="flex items-start text-gray-300 text-xs">
                    <div className={`w-1 h-1 rounded-full mr-2 mt-1.5 flex-shrink-0 ${
                      profile.isVeryHighlighted ? 'bg-primary animate-pulse' : 'bg-goldenrod'
                    }`} />
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
                    className={`px-1.5 py-0.5 text-xs rounded ${
                      profile.isVeryHighlighted 
                        ? 'bg-primary/20 text-primary border border-primary/30' 
                        : 'bg-secondary text-secondary-foreground'
                    }`}
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

            {/* Enhanced quick actions */}
            <div className="flex gap-1 pt-1">
              <button 
                onClick={handleLike}
                className={`flex-1 py-1.5 px-2 font-medium rounded text-xs transition-all duration-200 flex items-center justify-center gap-1 ${
                  profile.isVeryHighlighted
                    ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg hover:shadow-xl transform hover:scale-105'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }`}
              >
                <Heart className={`h-3 w-3 ${
                  profile.isVeryHighlighted ? 'animate-pulse' : ''
                }`} />
                Like
              </button>
              <button 
                onClick={handleMessage}
                className={`flex-1 py-1.5 px-2 font-medium rounded text-xs transition-all duration-200 flex items-center justify-center gap-1 ${
                  profile.isVeryHighlighted
                    ? 'bg-accent text-accent-foreground hover:bg-accent/90 shadow-md hover:shadow-lg'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
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