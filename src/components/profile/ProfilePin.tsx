import React from 'react';
import { Star } from 'lucide-react';
import { useCompatibilityBadge } from './CompatibilityBadge';
import { CompatibilityScore } from '@/hooks/useCompatibilityScoring';

interface ProfilePinProps {
  photo?: string;
  userId: string;
  compatibilityScore?: CompatibilityScore;
  isHighlighted?: boolean;
  isVeryHighlighted?: boolean;
  onClick: () => void;
}

export const ProfilePin: React.FC<ProfilePinProps> = ({
  photo,
  userId,
  compatibilityScore,
  isHighlighted,
  isVeryHighlighted,
  onClick
}) => {
  const compatibilityBadge = useCompatibilityBadge(compatibilityScore?.overall_score);

  return (
    <div
      onClick={onClick}
      className={`relative cursor-pointer transition-all duration-300 group-hover:scale-110 ${
        isVeryHighlighted 
          ? 'animate-bounce [animation-duration:2s]' 
          : isHighlighted 
          ? 'animate-pulse' 
          : ''
      }`}
    >
      {/* Profile Image Pin */}
      <div className={`relative w-8 h-8 rounded-full border-2 overflow-hidden transition-all duration-300 ${
        isVeryHighlighted
          ? 'border-primary shadow-2xl ring-4 ring-primary/50 scale-110' 
          : isHighlighted 
          ? 'border-primary shadow-lg ring-2 ring-primary/50 scale-105' 
          : 'border-border hover:border-primary/50'
      }`}>
        <img
          src={photo || '/placeholder.svg'}
          alt={`${userId}'s profile`}
          className="w-full h-full object-cover"
        />
        
        {/* Online indicator */}
        <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-background" />
      </div>

      {/* Enhanced compatibility indicator */}
      {compatibilityBadge && (
        <div className={`absolute -bottom-1 -right-1 rounded-full border border-background transition-all duration-300 ${
          isVeryHighlighted
            ? 'w-4 h-4 bg-primary animate-ping'
            : compatibilityBadge.glow 
              ? 'w-3 h-3 bg-primary animate-pulse' 
              : 'w-3 h-3 bg-secondary'
        }`}>
          {isVeryHighlighted && (
            <Star className="w-2 h-2 text-primary-foreground absolute top-0.5 left-0.5" />
          )}
        </div>
      )}
      
      {/* Floating compatibility score for highly compatible users */}
      {(isHighlighted || isVeryHighlighted) && compatibilityBadge && (
        <div className={`absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 ${
          isVeryHighlighted ? 'animate-bounce [animation-duration:2s]' : ''
        }`}>
          <div className={`px-2 py-1 rounded-full text-xs font-bold ${
            isVeryHighlighted
              ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg'
              : 'bg-primary/90 text-primary-foreground'
          }`}>
            {Math.round((compatibilityScore?.overall_score || 0) * 100)}%
          </div>
        </div>
      )}
    </div>
  );
};