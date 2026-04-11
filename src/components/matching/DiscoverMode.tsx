import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useDiscover } from '@/hooks/useDiscover';
import { Heart, X, MapPin, Briefcase, Compass, Info, Lock } from 'lucide-react';

// ── Image fallback ──────────────────────────────────────────────────────────
const PhotoOrFallback: React.FC<{ src: string; name: string; className?: string }> = ({ src, name, className = '' }) => {
  const [failed, setFailed] = useState(false);
  if (failed || !src) {
    return (
      <div className={`flex items-center justify-center bg-[#E8DED4] ${className}`}>
        <span className="text-4xl font-serif text-foreground/50">{name.slice(0,2).toUpperCase()}</span>
      </div>
    );
  }
  return <img src={src} alt={name} className={`object-cover ${className}`} onError={() => setFailed(true)} />;
};

// ── Single profile card ─────────────────────────────────────────────────────
const DiscoverCard: React.FC<{
  profile: { user_id: string; name: string; age?: number; location?: string; bio?: string; occupation?: string; photos: string[]; interests: string[] };
  onInterest: () => void;
  onSkip: () => void;
  disabled: boolean;
}> = ({ profile, onInterest, onSkip, disabled }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, x: -40, scale: 0.95 }}
    transition={{ duration: 0.3 }}
    className="w-full"
  >
    <Card className="overflow-hidden border-border/50 shadow-sm">
      <div className="relative h-72 w-full">
        <PhotoOrFallback
          src={profile.photos[0] || ''}
          name={profile.name}
          className="h-full w-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="font-serif font-bold text-white text-xl">
            {profile.name}{profile.age ? ', ' + profile.age : ''}
          </p>
          {profile.location && (
            <p className="text-white/80 text-sm flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5" />{profile.location}
            </p>
          )}
          {profile.occupation && (
            <p className="text-white/70 text-sm flex items-center gap-1 mt-0.5">
              <Briefcase className="w-3.5 h-3.5" />{profile.occupation}
            </p>
          )}
        </div>
      </div>
      <CardContent className="p-4 space-y-3">
        {profile.bio && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{profile.bio}</p>
        )}
        {profile.interests.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {profile.interests.slice(0, 4).map(i => (
              <Badge key={i} variant="outline" className="text-xs font-normal">{i}</Badge>
            ))}
          </div>
        )}
        {/* No instant match — intentionality note */}
        <p className="text-[11px] text-muted-foreground/70 italic">
          Expressing interest tells MonArk to consider them for your Sunday picks — no instant match.
        </p>
        <div className="flex gap-3 pt-1">
          <Button
            variant="outline"
            className="flex-1 border-border/60 text-muted-foreground hover:text-foreground"
            size="sm"
            onClick={onSkip}
            disabled={disabled}
          >
            <X className="h-4 w-4 mr-1.5" />
            Skip
          </Button>
          <Button
            className="flex-1"
            size="sm"
            onClick={onInterest}
            disabled={disabled}
          >
            <Heart className="h-4 w-4 mr-1.5" />
            I’m interested
          </Button>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// ── Main component ──────────────────────────────────────────────────────────
export const DiscoverMode: React.FC = () => {
  const {
    profiles,
    isLoading,
    capReached,
    viewedToday,
    dailyCap,
    expressInterest,
    skip,
    isPending,
  } = useDiscover();

  const [currentIndex, setCurrentIndex] = useState(0);
  const current = profiles[currentIndex] || null;
  const remaining = Math.max(0, dailyCap - viewedToday);

  const handleInterest = async () => {
    if (!current) return;
    await expressInterest(current.user_id);
    setCurrentIndex(i => i + 1);
  };

  const handleSkip = async () => {
    if (!current) return;
    await skip(current.user_id);
    setCurrentIndex(i => i + 1);
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-xl font-serif font-bold text-foreground">Discover</h2>
        <p className="text-sm text-muted-foreground">
          Browse people in your city any day. Expressing interest shapes Sunday’s picks.
        </p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-2.5 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
        <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-medium text-foreground">This isn’t swiping</p>
          <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
            No instant match happens here. When two people both express interest, the AI weighs that heavily for your next Sunday drop. You browse up to {dailyCap} people per day.
          </p>
        </div>
      </div>

      {/* Progress / cap */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-muted-foreground">
          {capReached ? 'Daily limit reached' : `${remaining} profile${remaining !== 1 ? 's' : ''} left today`}
        </p>
        <div className="flex gap-1">
          {Array.from({ length: dailyCap }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-5 rounded-full transition-colors ${i < viewedToday ? 'bg-primary' : 'bg-border'}`}
            />
          ))}
        </div>
      </div>

      {/* Content area */}
      {isLoading ? (
        <div className="flex justify-center py-16"><LoadingSpinner /></div>
      ) : capReached ? (
        <div className="text-center py-14 bg-card border border-border/50 rounded-2xl">
          <Lock className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="font-semibold text-foreground">You’ve browsed {dailyCap} people today</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
            Come back tomorrow. Your interests are saved and will shape Sunday’s curated picks.
          </p>
        </div>
      ) : !current ? (
        <div className="text-center py-14 bg-card border border-border/50 rounded-2xl">
          <Compass className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="font-semibold text-foreground">You’ve seen everyone for now</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
            New people arrive every Sunday. Your expressed interests are queued for the AI.
          </p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <DiscoverCard
            key={current.user_id}
            profile={current}
            onInterest={handleInterest}
            onSkip={handleSkip}
            disabled={isPending}
          />
        </AnimatePresence>
      )}
    </div>
  );
};
