import React from 'react';
import { MapPin } from 'lucide-react';
import { CompatibilityBadge } from './CompatibilityBadge';
import { CompatibilityHighlights } from './CompatibilityHighlights';
import { ActionButtons } from './ActionButtons';
import { CompatibilityScore } from '@/hooks/useCompatibilityScoring';

interface ProfileTooltipProps {
  userId: string;
  age?: number;
  distance?: number;
  bio?: string;
  interests?: string[];
  compatibilityScore?: CompatibilityScore;
  isHighlighted?: boolean;
  isVeryHighlighted?: boolean;
}

export const ProfileTooltip: React.FC<ProfileTooltipProps> = ({
  userId,
  age,
  distance,
  bio,
  interests,
  compatibilityScore,
  isHighlighted,
  isVeryHighlighted
}) => {
  const highlights = compatibilityScore?.highlights || [];

  return (
    <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 ${
      isVeryHighlighted ? 'scale-110' : ''
    }`}>
      <div className={`backdrop-blur-sm rounded-lg p-3 border shadow-lg w-56 ${
        isVeryHighlighted
          ? 'bg-gradient-to-br from-primary/30 via-popover to-accent/30 border-primary/50 shadow-primary/25'
          : isHighlighted
          ? 'bg-popover border-primary/30 shadow-primary/10'
          : 'bg-popover border-border'
      }`}>
        <div className="space-y-2">
          {/* Header with enhanced styling for compatibility */}
          <div className="flex items-center justify-between">
            <div>
              <p className={`font-medium text-sm ${
                isVeryHighlighted ? 'text-primary' : 'text-white'
              }`}>
                {userId.slice(0, 8)}, {age || 25}
              </p>
              {distance && (
                <div className="flex items-center text-gray-300 text-xs">
                  <MapPin className="h-3 w-3 mr-1" />
                  {distance}km away
                </div>
              )}
            </div>
            <CompatibilityBadge
              compatibilityScore={compatibilityScore}
              isVeryHighlighted={isVeryHighlighted}
            />
          </div>

          {/* Bio preview */}
          {bio && (
            <p className="text-xs text-gray-300 line-clamp-2">
              {bio}
            </p>
          )}

          {/* Compatibility highlights */}
          <CompatibilityHighlights
            highlights={highlights}
            isVeryHighlighted={isVeryHighlighted}
          />

          {/* Interests */}
          {interests && interests.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {interests.slice(0, 3).map((interest, index) => (
                <span 
                  key={index}
                  className={`px-1.5 py-0.5 text-xs rounded ${
                    isVeryHighlighted 
                      ? 'bg-primary/20 text-primary border border-primary/30' 
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  {interest}
                </span>
              ))}
              {interests.length > 3 && (
                <span className="px-1.5 py-0.5 bg-gray-700 text-gray-300 text-xs rounded">
                  +{interests.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Action buttons */}
          <ActionButtons
            userId={userId}
            isVeryHighlighted={isVeryHighlighted}
          />
        </div>
      </div>
      
      {/* Tooltip arrow */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-border" />
    </div>
  );
};