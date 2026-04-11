import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sparkles, Users, Calendar, Heart, MapPin, ChevronRight,
  Coffee, Wine, Palette, Music, Compass, Moon, MessageCircle,
  Clock, X, ThumbsDown, RefreshCw, Info
} from 'lucide-react';
import { format, formatDistanceToNow, startOfWeek } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useSubscription } from '@/hooks/useSubscription';
import { useCuratedMatches, type CuratedMatch } from '@/hooks/useCuratedMatches';
import { useDatingPool, type DatingPoolMatch } from '@/hooks/useDatingPool';
import { MatchDetailModal } from '@/components/matching/MatchDetailModal';
import { MatchRevealCeremony } from '@/components/matching/MatchRevealCeremony';
import { MutualMatchModal } from '@/components/matching/MutualMatchModal';
import { WeeklyRhythmPlans } from '@/components/weekly/WeeklyRhythmPlans';
import { ApiErrorFallback } from '@/components/common/ApiErrorFallback';
import { useActionProtection } from '@/hooks/useActionProtection';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useDemo } from '@/contexts/DemoContext';
import { toast } from 'sonner';

export interface UnifiedMatch {
  id: string;
  name: string;
  age: number;
  location: string;
  occupation: string;
  bio: string;
  photoUrl: string;
  compatibilityScore: number;
  matchReason: string;
  interests: string[];
  type: 'curated' | 'pool';
  theyLiked?: boolean; // true when the other user has already expressed interest
}

const DEMO_CURATED: UnifiedMatch[] = [
  {
    id: 'curated-1', name: 'Sophia', age: 28, location: 'River North',
    occupation: 'Art Curator',
    bio: 'Strong communicator who values depth and intentionality in every connection.',
    photoUrl: '/images/matches/sophia.jpg', compatibilityScore: 94,
    matchReason: 'You both value slow-building trust and direct communication.',
    interests: ['Live Jazz', 'Gallery Openings', 'Hiking'], type: 'curated',
  },
  {
    id: 'curated-2', name: 'Marcus', age: 31, location: 'Lincoln Park',
    occupation: 'Music Producer',
    bio: 'Intentional dater who brings emotional presence to every conversation.',
    photoUrl: '/images/matches/marcus.jpg', compatibilityScore: 89,
    matchReason: 'Complementary conflict styles — he speaks up, you reflect first.',
    interests: ['Poetry', 'Yoga', 'Art Museums'], type: 'curated',
  },
  {
    id: 'curated-3', name: 'Elena', age: 27, location: 'West Loop',
    occupation: 'Architect',
    bio: 'Curious spirit with steady pacing and aligned relationship goals.',
    photoUrl: '/images/matches/elena.jpg', compatibilityScore: 92,
    matchReason: 'Shared pacing preference and aligned relationship goals.',
    interests: ['Film', 'Running', 'Travel'], type: 'curated',
  },
];

const DEMO_POOL: UnifiedMatch[] = [
  {
    id: 'pool-1', name: 'James', age: 30, location: 'Wicker Park',
    occupation: 'Filmmaker',
    bio: 'Storyteller at heart — always chasing the next great narrative.',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    compatibilityScore: 78,
    matchReason: 'Shared creative energy and curiosity-driven outlook.',
    interests: ['Cinema', 'Street Photography', 'Coffee'], type: 'pool',
  },
  {
    id: 'pool-2', name: 'Maya', age: 29, location: 'Logan Square',
    occupation: 'Interior Designer',
    bio: 'Finds beauty in details and believes spaces shape connections.',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    compatibilityScore: 82,
    matchReason: 'Both drawn to aesthetics and intentional living.',
    interests: ['Design', 'Brunch', 'Ceramics'], type: 'pool',
  },
  {
    id: 'pool-3', name: 'David', age: 33, location: 'Fulton Market',
    occupation: 'Chef',
    bio: 'Believes the best conversations happen over a shared meal.',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
    compatibilityScore: 85,
    matchReason: 'Aligned values on quality time and presence.',
    interests: ['Cooking', 'Wine Tasting', 'Farmers Markets'], type: 'pool',
  },
  {
    id: 'pool-4', name: 'Aria', age: 26, location: 'Hyde Park',
    occupation: 'Musician',
    bio: 'Classically trained with a love for spontaneous jam sessions.',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
    compatibilityScore: 80,
    matchReason: 'Complementary creative rhythms and emotional expressiveness.',
    interests: ['Music', 'Poetry Nights', 'Nature Walks'], type: 'pool',
  },
];

/** Branded image fallback — linen bg with MA compass monogram */
const ImageWithFallback: React.FC<{
  src: string;
  alt: string;
  name: string;
  className?: string;
}> = ({ src, alt, name, className = '' }) => {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div className={`flex flex-col items-center justify-center bg-[#E8DED4] ${className}`}>
        <span className="text-3xl font-serif text-foreground/60 tracking-wider">
          {name.slice(0, 2).toUpperCase()}
        </span>
        <span className="text-[10px] text-muted-foreground mt-1">Photo coming soon</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`object-cover ${className}`}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
};

/** Curated match card — used for spotlight hero and 2-col grid */
const MatchCard: React.FC<{
  match: UnifiedMatch;
  spotlight?: boolean;
  onConnect: (m: UnifiedMatch) => void;
  onDetail: (m: UnifiedMatch) => void;
}> = ({ match, spotlight, onConnect, onDetail }) => (
  <Card
    className={`overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-shadow cursor-pointer group ${
      spotlight ? 'md:col-span-2' : ''
    }`}
    onClick={() => onDetail(match)}
  >
    <div className={`relative w-full ${spotlight ? 'h-64' : 'h-48'}`}>
      <ImageWithFallback
        src={match.photoUrl}
        alt={`${match.name}, ${match.age} — MonArk member`}
        name={match.name}
        className="h-full w-full group-hover:scale-[1.02] transition-transform duration-300"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
      {spotlight && (
        <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground border-none text-xs">
          <Sparkles className="w-3 h-3 mr-1" />
          Top Match
        </Badge>
      )}
    </div>
    <CardHeader className="pb-2">
      <div className="flex justify-between items-start">
        <div>
          <CardTitle className="text-lg font-serif">
            {match.name}, {match.age}
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">{match.occupation}</p>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <MapPin className="h-3 w-3 mr-1" />
            {match.location}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs font-medium text-primary">{match.compatibilityScore}%</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Match</div>
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-3">
      <p className="text-xs text-muted-foreground italic">"{match.matchReason}"</p>
      <div className="flex flex-wrap gap-2">
        {match.interests.slice(0, 3).map((interest) => (
          <Badge key={interest} variant="outline" className="text-[10px] font-normal">
            {interest}
          </Badge>
        ))}
      </div>
      <div className="flex gap-2 pt-1">
        <Button
          className="flex-1" size="sm"
          onClick={(e) => { e.stopPropagation(); onConnect(match); }}
        >
          <Heart className="h-4 w-4 mr-2" />
          Connect
        </Button>
        <Button
          variant="ghost" size="sm" className="px-3"
          onClick={(e) => { e.stopPropagation(); onDetail(match); }}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </CardContent>
  </Card>
);

/** Pool card — compact 3:4 photo card with gradient overlay */
const PoolCard: React.FC<{
  match: UnifiedMatch;
  onConnect: (m: UnifiedMatch) => void;
  onDetail: (m: UnifiedMatch) => void;
}> = ({ match, onConnect, onDetail }) => (
  <Card
    className={`overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group ${match.theyLiked ? 'border-amber-400/60 shadow-amber-100/40 ring-1 ring-amber-400/30' : 'border-border/50'}`}
    onClick={() => onDetail(match)}
  >
    <div className="relative aspect-[3/4] w-full">
      <ImageWithFallback
        src={match.photoUrl}
        alt={`${match.name}, ${match.age}`}
        name={match.name}
        className="h-full w-full group-hover:scale-[1.02] transition-transform duration-300"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
      <Badge className="absolute top-2 right-2 bg-foreground/70 text-white border-none text-[10px] font-medium backdrop-blur-md">
        {match.compatibilityScore}%
      </Badge>
      {match.theyLiked && (
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-amber-500/90 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-1 rounded-full shadow-sm">
          <Heart className="w-2.5 h-2.5 fill-white" />
          Interested in you
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="font-semibold text-white text-sm font-serif">
          {match.name}, {match.age}
        </p>
        <p className="text-white/80 text-xs flex items-center gap-1 mt-0.5">
          <MapPin className="w-3 h-3" />
          {match.location}
        </p>
      </div>
    </div>
    <CardContent className="p-3 flex gap-2">
      <Button
        className="flex-1" size="sm"
        onClick={(e) => { e.stopPropagation(); onConnect(match); }}
      >
        <Heart className="h-3.5 w-3.5 mr-1.5" />
        Like
      </Button>
      <Button
        variant="ghost" size="sm" className="px-3"
        onClick={(e) => { e.stopPropagation(); onDetail(match); }}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </CardContent>
  </Card>
);

/** MatchChip — horizontal card with photo + details (compact list view) */
const MatchChip: React.FC<{
  match: UnifiedMatch;
  onConnect: (m: UnifiedMatch) => void;
  onDetail: (m: UnifiedMatch) => void;
  onDismiss?: (m: UnifiedMatch) => void;
}> = ({ match, onConnect, onDetail, onDismiss }) => (
  <div
    className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 hover:shadow-sm transition-shadow cursor-pointer group"
    onClick={() => onDetail(match)}
  >
    <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
      <ImageWithFallback
        src={match.photoUrl}
        alt={match.name}
        name={match.name}
        className="h-full w-full"
      />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <p className="font-serif font-semibold text-sm text-foreground truncate">
          {match.name}, {match.age}
        </p>
        <Badge variant="outline" className="text-[10px] font-medium shrink-0">
          {match.compatibilityScore}%
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground truncate">{match.occupation}</p>
      <div className="flex items-center text-xs text-muted-foreground mt-0.5">
        <MapPin className="h-2.5 w-2.5 mr-1" />
        <span className="truncate">{match.location}</span>
      </div>
    </div>
    <div className="flex items-center gap-1.5 flex-shrink-0">
      <Button
        size="sm" className="h-8 w-8 p-0"
        onClick={(e) => { e.stopPropagation(); onConnect(match); }}
      >
        <Heart className="h-3.5 w-3.5" />
      </Button>
      {onDismiss && (
        <Button
          variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground"
          onClick={(e) => { e.stopPropagation(); onDismiss(match); }}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  </div>
);

/** StatusBar — curated count + next refresh countdown with pulse */
const StatusBar: React.FC<{
  curatedCount: number;
  poolCount: number;
  refreshLabel: string;
}> = ({ curatedCount, poolCount, refreshLabel }) => (
  <div className="flex items-center justify-between rounded-xl bg-card border border-border/50 px-4 py-3">
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Heart className="w-4 h-4 text-primary" />
        <div>
          <p className="text-sm font-semibold text-foreground">{curatedCount} Curated</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">This Week</p>
        </div>
      </div>
      <div className="w-px h-8 bg-border/50" />
      <div className="flex items-center gap-2">
        <Compass className="w-4 h-4 text-muted-foreground" />
        <div>
          <p className="text-sm font-semibold text-foreground">{poolCount}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">In Pool</p>
        </div>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <div className="relative flex items-center justify-center">
        <span className="absolute inline-flex h-3 w-3 rounded-full bg-primary/40 animate-ping" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-primary animate-pulse" />
      </div>
      <div className="text-right">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Next drop</p>
        <p className="text-xs font-medium text-foreground">{refreshLabel}</p>
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════
   Main Component
   ══════════════════════════════════════════════════════════════ */

export const SundayMatches: React.FC = () => {
  const { setShowPaywall } = useSubscription();
  const { demoData } = useDemo();
  const {
    matches: curatedMatches,
    loading: curatedLoading,
    acceptMatch,
    passMatch,
    pendingCount,
    getNextRefreshDate,
  } = useCuratedMatches();
  const { pool: realPool, loading: poolLoading } = useDatingPool();
  const { protectedAction } = useActionProtection({ debounceMs: 600 });

  const isDemo = demoData.isInDemo;

  // Current week key for first-view reveal tracking
  const weekKey = useMemo(() => {
    const ws = startOfWeek(new Date(), { weekStartsOn: 0 });
    return format(ws, 'yyyy-MM-dd');
  }, []);

  const revealStorageKey = `monark_matches_revealed_${weekKey}`;
  const [isFirstReveal, setIsFirstReveal] = useState(() => {
    try { return localStorage.getItem(revealStorageKey) !== 'true'; } catch { return true; }
  });
  const [revealComplete, setRevealComplete] = useState(!isFirstReveal);

  // Mark as revealed once animation plays
  const handleRevealDone = () => {
    setRevealComplete(true);
    setIsFirstReveal(false);
    try { localStorage.setItem(revealStorageKey, 'true'); } catch {}
  };

  // Curated display matches
  const displayMatches: UnifiedMatch[] = isDemo
    ? DEMO_CURATED
    : curatedMatches.map((m) => ({
        id: m.id,
        name: m.profile.name || 'Match',
        age: m.profile.age || 0,
        location: m.profile.location || '',
        occupation: m.profile.occupation || '',
        bio: m.profile.bio || '',
        photoUrl: m.profile.photos?.[0] || '/placeholder.svg',
        compatibilityScore: m.compatibility_score ? Math.round(m.compatibility_score * 100) : 0,
        matchReason: m.match_reason || '',
        interests: m.profile.interests || [],
        type: 'curated' as const,
      }));

  // Pool display matches
  const poolMatches: UnifiedMatch[] = isDemo
    ? DEMO_POOL
    : realPool.map((m) => ({
        id: m.id,
        name: m.profile.name || 'Match',
        age: m.profile.age || 0,
        location: m.profile.location || '',
        occupation: m.profile.occupation || '',
        bio: m.profile.bio || '',
        photoUrl: m.profile.photos?.[0] || '/placeholder.svg',
        compatibilityScore: m.compatibility_score ? Math.round(m.compatibility_score * 100) : 0,
        matchReason: '',
        interests: m.profile.interests || [],
        type: 'pool' as const,
        theyLiked: m.status === 'liked',
      }));

  // Tip banner state (localStorage-persisted)
  const [tipDismissed, setTipDismissed] = useState(() => {
    try { return localStorage.getItem('monark-match-tip-dismissed') === 'true'; } catch { return false; }
  });
  const dismissTip = () => {
    setTipDismissed(true);
    try { localStorage.setItem('monark-match-tip-dismissed', 'true'); } catch {};
  };

  // Modal state
  const [selectedMatch, setSelectedMatch] = useState<UnifiedMatch | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showWhyOnly3, setShowWhyOnly3] = useState(false);
  const [passTarget, setPassTarget] = useState<UnifiedMatch | null>(null);
  const [showPassReason, setShowPassReason] = useState(false);
  const [mutualMatch, setMutualMatch] = useState<{
    name: string; photo?: string; conversationId?: string;
  } | null>(null);

  const handleConnect = async (match: UnifiedMatch) => {
    if (isDemo) { setShowPaywall(true); return; }
    await protectedAction(async () => {
      setProcessing(true);
      const result = await acceptMatch(match.id);
      setProcessing(false);
      setDetailOpen(false);
      setSelectedMatch(null);
      if (result.isMutual && result.matchName) {
        setMutualMatch({ name: result.matchName, photo: result.matchPhoto, conversationId: result.conversationId });
      }
    });
  };

  // Kick off pass: show reason picker first (for curated), or pass immediately (for pool)
  const handlePass = (match: UnifiedMatch) => {
    if (isDemo) return;
    setDetailOpen(false);
    setSelectedMatch(null);
    if (match.type === 'curated') {
      setPassTarget(match);
      setShowPassReason(true);
    } else {
      commitPass(match, null);
    }
  };

  const commitPass = async (match: UnifiedMatch, reason: string | null) => {
    setShowPassReason(false);
    setPassTarget(null);
    await protectedAction(async () => {
      setProcessing(true);
      let undone = false;
      const label = reason ? `Got it — we'll use that to tune your next batch.` : `Noted — we'll refine your next batch.`;
      const toastId = toast(label, {
        duration: 4000,
        action: { label: 'Undo', onClick: () => { undone = true; toast.dismiss(toastId); } },
      });
      await new Promise<void>((resolve) => setTimeout(resolve, 4100));
      if (!undone) {
        await passMatch(match.id);
        // Persist the pass reason as a behavior analytics event for future curation
        if (reason) {
          try {
            const { supabase } = await import('@/integrations/supabase/client');
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              await supabase.from('behavior_analytics').insert({
                user_id: user.id,
                event_type: 'pass_with_reason',
                event_data: { match_id: match.id, match_name: match.name, reason, match_type: match.type }
              });
            }
          } catch (e) { console.error('pass reason log failed', e); }
        }
      }
      setProcessing(false);
    });
  };

  const openDetail = (match: UnifiedMatch) => {
    setSelectedMatch(match);
    setDetailOpen(true);
  };

  const nextRefresh = getNextRefreshDate();
  const refreshLabel = formatDistanceToNow(nextRefresh, { addSuffix: true });
  const matchCount = isDemo ? DEMO_CURATED.length : pendingCount;
  const poolCount = poolMatches.length;

  const spotlightMatch = displayMatches[0] || null;
  const gridMatches = displayMatches.slice(1);

  // Formatted week label for reveal header
  const weekLabel = format(startOfWeek(new Date(), { weekStartsOn: 0 }), 'MMMM d');

  // Render match cards with optional staggered reveal
  const renderMatchCards = () => {
    const cards = (
      <div className="space-y-4 mt-2">
        {spotlightMatch && (
          <motion.div
            initial={isFirstReveal ? { opacity: 0, y: 30, scale: 0.95 } : false}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: isFirstReveal ? 0.6 : 0, ease: 'easeOut' }}
          >
            <MatchCard match={spotlightMatch} spotlight onConnect={handleConnect} onDetail={openDetail} />
          </motion.div>
        )}
        {gridMatches.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {gridMatches.map((m, i) => (
              <motion.div
                key={m.id}
                initial={isFirstReveal ? { opacity: 0, y: 30, scale: 0.95 } : false}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: isFirstReveal ? 0.75 + i * 0.15 : 0, ease: 'easeOut' }}
                onAnimationComplete={i === gridMatches.length - 1 ? handleRevealDone : undefined}
              >
                <MatchCard match={m} onConnect={handleConnect} onDetail={openDetail} />
              </motion.div>
            ))}
          </div>
        )}
        {gridMatches.length === 0 && isFirstReveal && spotlightMatch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            onAnimationComplete={handleRevealDone}
          />
        )}
      </div>
    );

    return cards;
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Dismissible tip banner */}
      {!tipDismissed && (
        <div className="relative bg-card border-2 border-border rounded-xl px-4 py-3 shadow-lg">
          <button
            onClick={dismissTip}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-secondary/50 transition-colors"
            aria-label="Dismiss tip"
          >
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <div className="flex items-start gap-3 pr-6">
            <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground">Your weekly matches are here</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Tap any card to view their full profile. If you both connect, you'll unlock messaging.
                Explore the pool for more compatible people beyond your curated 3.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Status bar */}
      <StatusBar curatedCount={matchCount} poolCount={poolCount} refreshLabel={refreshLabel} />

      {/* 3-tab layout */}
      <Tabs defaultValue="your3" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="your3" className="flex-1">
            <Heart className="w-3.5 h-3.5 mr-1.5" /> Your 3
            <span
              role="button"
              tabIndex={0}
              aria-label="Why only 3 matches?"
              onClick={(e) => { e.stopPropagation(); setShowWhyOnly3(true); }}
              onKeyDown={(e) => e.key === 'Enter' && setShowWhyOnly3(true)}
              className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-500/20 text-amber-600 text-[9px] font-bold cursor-pointer hover:bg-amber-500/30 transition-colors"
            >?</span>
          </TabsTrigger>
          <TabsTrigger value="explore" className="flex-1 gap-1.5">
            <Compass className="w-3.5 h-3.5" /> Explore ({poolMatches.length || 10})
          </TabsTrigger>
          <TabsTrigger value="plans" className="flex-1 gap-1.5">
            <Calendar className="w-3.5 h-3.5" /> Plans
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Your 3 — spotlight + 2-col grid ── */}
        <TabsContent value="your3">
          {curatedLoading && !isDemo ? (
            <div className="flex items-center justify-center py-12"><LoadingSpinner /></div>
          ) : displayMatches.length === 0 ? (
            <div className="text-center py-10 bg-card/50 rounded-xl border border-border/50 mt-2 px-6">
              <Calendar className="w-10 h-10 mx-auto mb-3 text-primary/50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Your matches arrive Sunday</h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-4">
                {refreshLabel ? `Next drop in ${refreshLabel} — curated just for you.` : 'Your curated matches drop every Sunday.'}
              </p>
              {poolMatches.length > 0 ? (
                <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-3 text-sm text-foreground/80">
                  <span className="font-medium text-primary">In the meantime</span> — explore {poolMatches.length} people curated for your city in the Explore tab below.
                </div>
              ) : (
                <div className="bg-muted/30 border border-border/30 rounded-lg px-4 py-3 text-sm text-muted-foreground">
                  You're on the early access list — matches are being curated for your city. We'll notify you when they're ready.
                </div>
              )}
            </div>
          ) : (
            <MatchRevealCeremony matchCount={displayMatches.length}>
              <>
                {/* First-view weekly header */}
                {isFirstReveal && displayMatches.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-center py-4 mt-2"
                  >
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mb-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-sm font-serif text-foreground font-medium">
                      Your matches for the week of {weekLabel} are ready
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Take your time with each one
                    </p>
                  </motion.div>
                )}
                {renderMatchCards()}
              </>
            </MatchRevealCeremony>
          )}
        </TabsContent>

        {/* ── Tab 2: Explore — pool in 2-col PoolCard grid ── */}
        <TabsContent value="explore">
          <div className="mt-2 space-y-3">
            <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 mb-1">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-foreground mb-0.5">Your 3 didn't feel right? Start here.</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    This pool is curated just for you — <span className="text-primary font-medium">no match required.</span> Browse freely and reach out to anyone. New people arrive every Sunday alongside your 3.
                  </p>
                </div>
              </div>
            </div>
            {poolLoading && !isDemo ? (
              <div className="flex items-center justify-center py-12"><LoadingSpinner /></div>
            ) : poolMatches.length === 0 ? (
              <div className="text-center py-12 bg-card/50 rounded-xl border border-border/50">
                <Users className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Pool Empty</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                  You've browsed through your entire dating pool. New pool arrives next Sunday!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {poolMatches.map((m) => (
                  <PoolCard key={m.id} match={m} onConnect={handleConnect} onDetail={openDetail} />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Tab 3: Date Plans ── */}
        <TabsContent value="plans">
          <div className="mt-2"><WeeklyRhythmPlans /></div>
        </TabsContent>
      </Tabs>

      {/* Match Detail Modal */}
      {selectedMatch && (
        <MatchDetailModal
          match={{
            id: selectedMatch.id,
            name: selectedMatch.name,
            age: selectedMatch.age,
            photos: [selectedMatch.photoUrl],
            bio: selectedMatch.bio,
            location: selectedMatch.location,
            interests: selectedMatch.interests,
            occupation: selectedMatch.occupation,
            compatibility_score: selectedMatch.compatibilityScore / 100,
            match_reason: selectedMatch.matchReason,
          }}
          isOpen={detailOpen}
          onClose={() => { setDetailOpen(false); setSelectedMatch(null); }}
          onLike={() => handleConnect(selectedMatch)}
          onPass={() => handlePass(selectedMatch)}
          isProcessing={processing}
          isCurated={selectedMatch.type === 'curated'}
        />
      )}

      {/* Mutual Match Modal */}
      {mutualMatch && (
        <MutualMatchModal
          isOpen={!!mutualMatch}
          onClose={() => setMutualMatch(null)}
          matchName={mutualMatch.name}
          matchPhoto={mutualMatch.photo}
          onStartChat={() => setMutualMatch(null)}
        />
      )}
      {/* Pass Reason Sheet — captures not-my-type signal */}
      {showPassReason && passTarget && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={() => { setShowPassReason(false); setPassTarget(null); }}>
          <div className="bg-card w-full max-w-lg rounded-t-2xl p-6 pb-8 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5" />
            <div className="flex items-center gap-3 mb-1">
              <span className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                <ThumbsDown className="w-4 h-4 text-muted-foreground" />
              </span>
              <h3 className="text-base font-semibold text-foreground">Why are you passing on {passTarget.name}?</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4 pl-12">Your answer helps us curate better matches next Sunday.</p>
            <div className="space-y-2">
              {[
                'Not my physical type',
                'Too far away',
                'Lifestyle doesn\'t align',
                'Occupation or life stage mismatch',
                'Vibes felt off from the bio',
                'Just not feeling it — hard to explain',
              ].map(reason => (
                <button
                  key={reason}
                  className="w-full text-left px-4 py-3 rounded-xl border border-border hover:bg-muted/50 text-sm text-foreground transition-colors"
                  onClick={() => commitPass(passTarget, reason)}
                >
                  {reason}
                </button>
              ))}
              <button
                className="w-full py-2.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => commitPass(passTarget, null)}
              >
                Skip — just pass
              </button>
            </div>
          </div>
        </div>
      )}

            {/* Why Only 3 — Intentionality Explainer */}
      {showWhyOnly3 && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowWhyOnly3(false)}>
          <div className="bg-card w-full max-w-lg rounded-t-2xl p-6 pb-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5" />
            <div className="flex items-center gap-3 mb-4">
              <span className="w-9 h-9 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-600 font-bold text-sm">3</span>
              <h3 className="text-lg font-semibold text-foreground">Why only 3 matches?</h3>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              We limit your weekly matches to 3 so you can give each person your full attention. Monark is built on intentionality — quality over endless scrolling.
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Each match is carefully curated based on your Relational Identity Framework, values, and lifestyle. Three thoughtful connections beat thirty swipes every time.
            </p>
            <button
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
              onClick={() => setShowWhyOnly3(false)}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
