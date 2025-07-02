
import React from 'react';
import { Heart, Clock, Shield, Target, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface RIFProfile {
  intent_clarity: number;
  pacing_preferences: number;
  emotional_readiness: number;
  boundary_respect: number;
}

interface RIFProfileCardProps {
  userProfile: RIFProfile | null;
  currentUserProfile?: RIFProfile;
  name: string;
  age: number;
  image: string;
  onClick: () => void;
}

export const RIFProfileCard: React.FC<RIFProfileCardProps> = ({
  userProfile,
  currentUserProfile,
  name,
  age,
  image,
  onClick
}) => {
  const getRIFTags = (profile: RIFProfile | null) => {
    if (!profile) return [];
    
    const tags = [];
    
    if (profile.emotional_readiness >= 7) {
      tags.push({ label: 'Emotionally Ready', icon: Heart, color: 'text-green-400' });
    }
    
    if (profile.pacing_preferences <= 4) {
      tags.push({ label: 'Takes It Slow', icon: Clock, color: 'text-blue-400' });
    } else if (profile.pacing_preferences >= 7) {
      tags.push({ label: 'Moves Forward', icon: Target, color: 'text-orange-400' });
    }
    
    if (profile.boundary_respect >= 7) {
      tags.push({ label: 'Respects Boundaries', icon: Shield, color: 'text-purple-400' });
    }
    
    return tags.slice(0, 2); // Show max 2 tags
  };

  const getCompatibilityInsight = () => {
    if (!currentUserProfile || !userProfile) return null;
    
    const pacingDiff = Math.abs(userProfile.pacing_preferences - currentUserProfile.pacing_preferences);
    const intentDiff = Math.abs(userProfile.intent_clarity - currentUserProfile.intent_clarity);
    
    if (pacingDiff <= 2 && intentDiff <= 2) {
      return { message: 'Strong Alignment', color: 'text-green-400' };
    } else if (pacingDiff <= 4 || intentDiff <= 4) {
      return { message: 'Good Match', color: 'text-goldenrod' };
    }
    
    return { message: 'Different Approach', color: 'text-gray-400' };
  };

  const rifTags = getRIFTags(userProfile);
  const compatibility = getCompatibilityInsight();

  return (
    <div
      onClick={onClick}
      className="relative cursor-pointer group"
    >
      <div className="relative">
        <img
          src={image}
          alt={name}
          className="w-12 h-12 rounded-full border-2 border-white/30 transition-all duration-300 group-hover:border-goldenrod/50 group-hover:scale-110"
        />
        
        {/* RIF indicator dot - only show if user has RIF profile */}
        {userProfile && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-goldenrod rounded-full border border-jet-black animate-pulse" />
        )}
      </div>
      
      {/* Enhanced profile preview on hover */}
      <div className="absolute -bottom-48 left-1/2 transform -translate-x-1/2 bg-charcoal-gray/95 backdrop-blur-xl rounded-lg p-4 border border-goldenrod/30 opacity-0 group-hover:opacity-100 transition-all duration-300 w-80 z-10 shadow-2xl">
        <div className="space-y-4">
          {/* Header with name and compatibility */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium text-lg">{name}, {age}</p>
              {compatibility && (
                <span className={`text-xs ${compatibility.color} font-medium`}>
                  {compatibility.message}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Heart className="h-4 w-4 text-gray-400 hover:text-red-400 cursor-pointer transition-colors" />
              <MessageCircle className="h-4 w-4 text-gray-400 hover:text-blue-400 cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Bio preview */}
          {userProfile && (
            <div className="text-gray-300 text-sm leading-relaxed">
              <p className="line-clamp-2">
                Looking for meaningful connections and genuine conversations. Values emotional intelligence and authentic communication.
              </p>
            </div>
          )}

          {/* RIF compatibility tags */}
          {rifTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {rifTags.map((tag, index) => {
                const Icon = tag.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-gray-800/60 rounded-full text-xs border border-gray-700"
                  >
                    <Icon className={`h-3 w-3 ${tag.color}`} />
                    <span className="text-gray-200 font-medium">{tag.label}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick interests preview */}
          <div className="flex flex-wrap gap-1">
            {['Photography', 'Hiking', 'Coffee'].map((interest, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-goldenrod/20 text-goldenrod text-xs rounded-md border border-goldenrod/30"
              >
                {interest}
              </span>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex space-x-2">
            <button 
              className="flex-1 py-2 bg-goldenrod-gradient text-jet-black font-medium rounded-lg text-sm hover:shadow-golden-glow transition-all duration-300 flex items-center justify-center space-x-2"
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
            >
              <Heart className="h-4 w-4" />
              <span>Like</span>
            </button>
            <button 
              className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg text-sm transition-all duration-300 flex items-center justify-center space-x-2"
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
            >
              <MessageCircle className="h-4 w-4" />
              <span>Chat</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
