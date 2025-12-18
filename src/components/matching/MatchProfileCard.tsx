import { Heart, X, MapPin, Briefcase, GraduationCap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MatchProfile {
  id: string;
  matched_user_id: string;
  compatibility_score?: number;
  match_reason?: string;
  profile: {
    name?: string;
    photos?: string[];
    bio?: string;
    age?: number;
    location?: string;
    interests?: string[];
    occupation?: string;
    education_level?: string;
  };
}

interface MatchProfileCardProps {
  match: MatchProfile;
  onAccept: () => void;
  onPass: () => void;
  isProcessing?: boolean;
}

export const MatchProfileCard = ({ match, onAccept, onPass, isProcessing }: MatchProfileCardProps) => {
  const { profile, compatibility_score, match_reason } = match;
  const mainPhoto = profile.photos?.[0] || '/placeholder.svg';
  
  return (
    <Card className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm group">
      {/* Photo */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img 
          src={mainPhoto} 
          alt="Profile"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/20 to-transparent" />
        
        {/* Compatibility badge */}
        {compatibility_score && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-primary/90 text-primary-foreground">
              {Math.round(compatibility_score * 100)}% Match
            </Badge>
          </div>
        )}
        
        {/* Name & Age overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="text-2xl font-bold">
            {profile.name || 'Someone Special'}{profile.age ? `, ${profile.age}` : ''}
          </h3>
          
          {/* Location */}
          {profile.location && (
            <div className="flex items-center gap-1 text-sm text-white/80 mt-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{profile.location}</span>
            </div>
          )}
        </div>
      </div>
      
      <CardContent className="p-4 space-y-3">
        {/* Quick info */}
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {profile.occupation && (
            <div className="flex items-center gap-1">
              <Briefcase className="w-3 h-3" />
              <span>{profile.occupation}</span>
            </div>
          )}
          {profile.education_level && (
            <div className="flex items-center gap-1">
              <GraduationCap className="w-3 h-3" />
              <span>{profile.education_level}</span>
            </div>
          )}
        </div>
        
        {/* Bio preview */}
        {profile.bio && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {profile.bio}
          </p>
        )}
        
        {/* Interests */}
        {profile.interests && profile.interests.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {profile.interests.slice(0, 4).map((interest, idx) => (
              <Badge 
                key={idx} 
                variant="outline"
                className="text-xs bg-primary/5 border-primary/20"
              >
                {interest}
              </Badge>
            ))}
            {profile.interests.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{profile.interests.length - 4}
              </Badge>
            )}
          </div>
        )}
        
        {/* Match reason */}
        {match_reason && (
          <p className="text-xs text-primary/80 italic">
            "{match_reason}"
          </p>
        )}
        
        {/* Action buttons */}
        <div className="flex gap-3 pt-2">
          <Button 
            variant="outline"
            onClick={onPass}
            disabled={isProcessing}
            className="flex-1 group/btn"
          >
            <X className="w-5 h-5 mr-1 group-hover/btn:text-destructive transition-colors" />
            Pass
          </Button>
          <Button 
            onClick={onAccept}
            disabled={isProcessing}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            <Heart className="w-5 h-5 mr-1" />
            Accept
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
