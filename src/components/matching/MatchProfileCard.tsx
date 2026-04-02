import React, { useState } from 'react';
import { Heart, X, MapPin, Briefcase, GraduationCap, Loader2, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MatchDetailModal } from './MatchDetailModal';

interface MatchProfile {
  id: string;
  matched_user_id: string;
  status?: string;
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

function RIFBar({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, Math.round(score * 100)));
  const label = pct >= 80 ? 'Strong alignment' : pct >= 60 ? 'Good alignment' : 'Interesting contrast';

  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1.5">
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">RIF Compatibility</span>
        <span className="text-[10px] uppercase tracking-[0.2em] text-primary">{label}</span>
      </div>
      <div className="h-1 rounded-full bg-muted">
        <div
          className="h-1 rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function getInitials(name?: string) {
  if (!name) return 'M';
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

export const MatchProfileCard = ({ match, onAccept, onPass, isProcessing }: MatchProfileCardProps) => {
  const [showDetail, setShowDetail] = useState(false);
  const { profile, compatibility_score, match_reason } = match;
  const mainPhoto = profile.photos?.[0];
  const name = profile.name || 'Your match';
  const status = match.status || 'pending';

  return (
    <>
    <Card
      className="overflow-hidden border-border/40 bg-card shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 cursor-pointer group"
      onClick={() => setShowDetail(true)}
    >
      <CardContent className="p-6 space-y-4">
        {/* Header: avatar + name */}
        <div className="flex gap-3.5 items-center">
          <Avatar className="w-14 h-14 border border-primary/20">
            {mainPhoto ? (
              <AvatarImage src={mainPhoto} alt={name} className="object-cover" />
            ) : null}
            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-serif text-lg">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-serif text-xl text-foreground leading-tight">
              {name}
              {profile.age ? `, ${profile.age}` : ''}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              {profile.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {profile.location}
                </span>
              )}
              {profile.occupation && (
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3 h-3" />
                  {profile.occupation}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* RIF compatibility bar */}
        {compatibility_score !== undefined && compatibility_score > 0 && (
          <RIFBar score={compatibility_score} />
        )}

        {/* Bio preview */}
        {profile.bio && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 font-light">
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
                className="text-xs bg-primary/5 border-primary/20 font-normal"
              >
                {interest}
              </Badge>
            ))}
            {profile.interests.length > 4 && (
              <Badge variant="outline" className="text-xs font-normal">
                +{profile.interests.length - 4}
              </Badge>
            )}
          </div>
        )}

        {/* Match reason */}
        {match_reason && (
          <div className="bg-muted/50 rounded-xl p-3.5 border-l-[3px] border-primary">
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5">
              Why we curated this match
            </div>
            <p className="text-[13px] text-foreground leading-relaxed italic font-light">
              "{match_reason}"
            </p>
          </div>
        )}

        {/* Action buttons — only for pending */}
        {status === 'pending' && (
          <div className="flex gap-2.5 pt-1">
            <Button
              variant="outline"
              onClick={onPass}
              disabled={isProcessing}
              className="flex-1 rounded-full uppercase tracking-wider text-xs h-11"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>
                  <X className="w-3.5 h-3.5 mr-1.5" />
                  Not this week
                </>
              )}
            </Button>
            <Button
              onClick={onAccept}
              disabled={isProcessing}
              className="flex-[2] rounded-full uppercase tracking-wider text-xs h-11"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>
                  <Heart className="w-3.5 h-3.5 mr-1.5" />
                  I'm interested
                </>
              )}
            </Button>
          </div>
        )}

        {/* Status badges for non-pending */}
        {status === 'accepted' && (
          <div className="rounded-full py-3 px-4 bg-primary/10 border border-primary/20 text-center text-xs uppercase tracking-wider text-primary">
            ✓ Interest sent — waiting for alignment
          </div>
        )}

        {status === 'passed' && (
          <div className="rounded-full py-3 px-4 bg-muted text-center text-xs uppercase tracking-wider text-muted-foreground">
            Passed this week
          </div>
        )}
      </CardContent>
    </Card>
  );
};
