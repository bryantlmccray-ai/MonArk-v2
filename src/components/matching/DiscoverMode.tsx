import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useDiscover } from '@/hooks/useDiscover';
import { Heart, X, MapPin, Briefcase, Compass, Info, Lock, CheckCircle } from 'lucide-react';

// ── Image fallback ────────────────────────────────────────────────────────────
const PhotoOrFallback: React.FC<{ src: string; name: string; clasName?: string }> = ({
  src,
  name,
  className = '',
}) => {
  const [failed, setFailed] = useState(false);
  if (failed || !src) {
    return (
      <div className={`flex items-center justify-center bg-[#E8DED4] ${className}`}>
        <span className="text-4xl font-serif text-foreground/50">{name.slice(0, 2).toUpperCase()}</span>
      </div>
    );
  }
  return <img src={src} alt={name} className={`object-cover ${className}`} onError={() => setFailed(true)} />;
};

// ── Grid profile card ─────────────────────────────────────────────────────────
const DiscoverGridCard: React.FC<{
  profile: {
    user_id: string;
    name: string;
    age?: number;
    location?: string;
    bio?: string;
    occupation?: string;
    photos: string[];
    interests: string[];
  };
  onInterest: () => void;
  onSkip: () => void;
  disabled: boolean;
  expressed?: boolean;
}> = ({ profile, onInterest, onSkip, disabled, expressed }) => (
  <Card
    className={`overflow-hidden border-border/50 shadow-sm transition-shadow ${
      expressed ? 'ring-2 ring-primary/40 shadow-primary/10' : 'hover:shadow-md'
    }`}
  >
    <div className="relative aspect-[3/4] w-full">
      <PhotoOrFallback
        src={profile.photos[0] || ''}
        name={profile.name}
        className="h-full w-full"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

      {expressed && (
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-primary/90 backdrop-blur-sm text-primary-foreground text-[10px] font-semibold px-2 py-1 rounded-full shadow-sm">
          <CheckCircle className="w-3 h-3" />
          Interested
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="font-serif font-bold text-white text-base leading-tight">
          {profile.name}{profile.age ? ', ' + profile.age : ''}
        </p>
        {profile.location && (
          <p className="text-white/75 text-xs flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3" />{profile.location}
          </p>
        )}
      </div>
    </div>

    <CardContent className="p-3 space-y-2">
      {profile.occupation && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Briefcase className="w-3 h-3 shrink-0" />
          <span className="truncate">{profile.occupation}</span>
        </p>
      )}
      {profile.bio && (
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{profile.bio}</p>
      )}
      {profile.interests.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {profile.interests.slice(0, 3).map((i) => (
            <Badge key={i} variant="outline" className="text-[10px] font-normal px-1.5 py-0">
              {i}
            </Badge>
          ))}
        </div>
      )}

      <p className="text-[10px] text-muted-foreground/60 italic leading-tight">
        Expressing interest shapes your Sunday picks — not an instant match.
      </p>

      {expressed ? (
        <div className="flex items-center justify-center gap-2 pt-1 text-xs text-primary font-medium">
          <CheckCircle className="w-3.5 h-3.5" />
          Interest noted
        </div>
      ) : (
        <div className="flex gap-2 pt-1">
          <Button
            variant="outline"
            className="flex-1 border-border/60 text-muted-foreground hover:text-foreground text-xs h-8"
            size="sm"
            onClick={onSkip}
            disabled={disabled}
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Skip
          </Button>
          <Button className="flex-1 text-xs h-8" size="sm" onClick={onInterest} disabled={disabled}>
            <Heart className="h-3.5 w-3.5 mr-1" />
            Interested
          </Button>
        </div>
      )}
    </CardContent>
  </Card>
);

// ── Main component ────────────────────────────────────────────────────────────
export const DiscoverMode: React.FC = () => {
  const { profiles, isLoading, capReached, viewedToday, dailyCap, expressInterest, skip, isPending } =
    useDiscover();

  // Track which profiles the user has expressed interest in (within this session)
  const [expressedIds, setExpressedIds] = useState<Set<string>>(new Set());
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set());

  const visibleProfiles = profiles.filter((p) => !skippedIds.has(p.user_id));
  const remaining = Math.max(0, dailyCap - viewedToday);
  const progressPct = dailyCap > 0 ? Math.min(100, (viewedToday / dailyCap) * 100) : 0;

  const handleInterest = async (userId: string) => {
    await expressInterest(userId);
    setExpressedIds((prev) => new Set([...prev, userId]));
  };

  const handleSkip = async (userId: string) => {
    await skip(userId);
    setSkippedIds((prev) => new Set([...prev, userId]));
  };

  return (
    <div className="space-y-4 pb-8 px-5 pt-3">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-xl font-serif font-bold text-foreground">Discover</h2>
        <p className="text-sm text-muted-foreground">
          Browse people in your city any day. Expressing interest shapes Sunday's picks.
        </p>
      </div>

      {/* How it works banner */}
      <div className="flex items-start gap-2.5 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
        <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-medium text-foreground">This isn't swiping</p>
          <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
            No instant match happens here. When two people both express interest, smart matching weighs that
            heavily for your next Sunday drop. You can browse up to{' '}
            <span className="font-semibold text-foreground">{dailyCap} people per day</span> — take
            your time with each one.
          </p>
        </div>
      </div>

      {/* Daily progress bar */}
      <div className="bg-card border border-border/50 rounded-xl px-4 py-3 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-foreground">
            {capReached ? "Daily limit reached — come back tomorrow" : `${remaining} profile${remaining !== 1 ? 's' : ''} left today`}
          </p>
          <span className="text-xs text-muted-foreground">
            {viewedToday} / {dailyCap}
          </span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Content area */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner />
        </div>
      ) : capReached ? (
        /* Cap reached — give users something to do */
        <div className="space-y-4">
          <div className="text-center py-10 bg-card border border-border/50 rounded-2xl">
            <Lock className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="font-semibold text-foreground">You've browsed {dailyCap} people today</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
              Your interests are saved and will shape Sunday's curated picks.
            </p>
          </div>
          {/* Engagement prompt when cap reached */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-4">
            <p className="text-sm font-medium text-foreground mb-1">While you wait for Sunday…</p>
            <ul className="text-xs text-muted-foreground space-y-1.5 mt-2">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">→</span>
                Answer today's daily question — it sharpens your matches
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">→</span>
                Add a new photo or update your bio
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">→</span>
                Check your Relational Profile — see what your scores mean
              </li>
            </ul>
          </div>
        </div>
      ) : visibleProfiles.length === 0 ? (
        <div className="text-center py-14 bg-card border border-border/50 rounded-2xl">
          <Compass className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="font-semibold text-foreground">You've seen everyone for now</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
            New people arrive every Sunday. Your expressed interests are queued for Smart Matching.
          </p>
        </div>
      ) : (
        /* Grid of profiles — intentional browsing, not one-at-a-time swiping */
        <AnimatePresence>
          <motion.div
            className="grid grid-cols-2 gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {visibleProfiles.map((profile) => (
              <motion.div
                key={profile.user_id}
                layout
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <DiscoverGridCard
                  profile={profile}
                  onInterest={() => handleInterest(profile.user_id)}
                  onSkip={() => handleSkip(profile.user_id)}
                  disabled={isPending}
                  expressed={expressedIds.has(profile.user_id)}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};
