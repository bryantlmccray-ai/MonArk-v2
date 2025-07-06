import React from 'react';
import { DiscoveryProfile } from '@/hooks/useDiscoveryProfiles';
import { CompatibilityScore } from '@/hooks/useCompatibilityScoring';
import { ProfilePin } from '../profile/ProfilePin';
import { ProfileTooltip } from '../profile/ProfileTooltip';

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
  onClick
}) => {

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

      {/* Profile Pin */}
      <ProfilePin
        photo={profile.photos?.[0]}
        userId={profile.user_id}
        compatibilityScore={profile.compatibilityScore}
        isHighlighted={profile.isHighlighted}
        isVeryHighlighted={profile.isVeryHighlighted}
        onClick={onClick}
      />

      {/* Profile Tooltip */}
      <ProfileTooltip
        userId={profile.user_id}
        age={profile.age}
        distance={profile.distance}
        bio={profile.bio}
        interests={profile.interests}
        compatibilityScore={profile.compatibilityScore}
        isHighlighted={profile.isHighlighted}
        isVeryHighlighted={profile.isVeryHighlighted}
      />
    </div>
  );
};