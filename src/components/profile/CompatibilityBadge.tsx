import React from 'react';
import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CompatibilityScore } from '@/hooks/useCompatibilityScoring';

interface CompatibilityBadgeConfig {
  label: string;
  color: string;
  glow: boolean;
}

interface CompatibilityBadgeProps {
  compatibilityScore?: CompatibilityScore;
  isVeryHighlighted?: boolean;
  className?: string;
}

export const useCompatibilityBadge = (score?: number): CompatibilityBadgeConfig | null => {
  if (!score) return null;
  
  if (score > 0.8) {
    return { label: 'Exceptional', color: 'bg-primary text-primary-foreground', glow: true };
  } else if (score > 0.65) {
    return { label: 'Great', color: 'bg-secondary text-secondary-foreground', glow: false };
  } else if (score > 0.5) {
    return { label: 'Good', color: 'bg-accent text-accent-foreground', glow: false };
  }
  return null;
};

export const CompatibilityBadge: React.FC<CompatibilityBadgeProps> = ({
  compatibilityScore,
  isVeryHighlighted,
  className
}) => {
  const badge = useCompatibilityBadge(compatibilityScore?.overall_score);
  
  if (!badge) return null;

  return (
    <Badge className={`text-xs ${
      isVeryHighlighted 
        ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg' 
        : badge.color
    } ${className}`}>
      <Star className={`h-2 w-2 mr-1 ${
        isVeryHighlighted ? 'animate-spin [animation-duration:3s]' : ''
      }`} />
      {badge.label}
      {compatibilityScore && (
        <span className="ml-1 font-bold">
          ({Math.round(compatibilityScore.overall_score * 100)}%)
        </span>
      )}
    </Badge>
  );
};