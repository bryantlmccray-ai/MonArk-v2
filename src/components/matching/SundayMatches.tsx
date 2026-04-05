import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sparkles, Users, Calendar, Heart, MapPin, ChevronRight,
  Coffee, Wine, Palette, Music, Compass, Moon, MessageCircle,
  Clock, X
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
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

/* ══════════════════════════════════════════════════════════════
   Types
   ══════════════════════════════════════════════════════════════ */

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
}

/* ══════════════════════════════════════════════════════════════
   Demo Data
   ══════════════════════════════════════════════════════════════ */

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

/* ══════════════════════════════════════════════════════════════
   Sub-components
   ══════════════════════════════════════════════════════════════ */

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
      {/* Gradient vignette */}
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
    className="overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
    onClick={() => onDetail(match)}
  >
    <div className="relative aspect-[3/4] w-full">
      <ImageWithFallback
        src={match.photoUrl}
        alt={`${match.name}, ${match.age}`}
        name={match.name}
        className="h-full w-full group-hover:scale-[1.02] transition-transform duration-300"
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

      {/* Compatibility badge */}
      <Badge className="absolute top-2 right-2 bg-foreground/70 text-white border-none text-[10px] font-medium backdrop-blur-md">
        {match.compatibilityScore}%
      </Badge>

      {/* Name / age / location overlay */}
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

    {/* Quick actions */}
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
    {/* Photo */}
    <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
      <ImageWithFallback
        src={match.photoUrl}
        alt={match.name}
        name={match.name}
        className="h-full w-full"
      />
    </div>

    {/* Details */}
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

    {/* Actions */}
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
    {/* Left: counts */}
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

    {/* Right: next drop countdown with pulse */}
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
      }));

  // Modal state
  const [selectedMatch, setSelectedMatch] = useState<UnifiedMatch | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
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

  const handlePass = async (match: UnifiedMatch) => {
    if (isDemo) return;
    await protectedAction(async () => {
      setProcessing(true);
      await passMatch(match.id);
      setProcessing(false);
      setDetailOpen(false);
      setSelectedMatch(null);
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

  return (
    <div className="space-y-4 pb-8">
      {/* Status bar */}
      <StatusBar curatedCount={matchCount} poolCount={poolCount} refreshLabel={refreshLabel} />

      {/* 3-tab layout */}
      <Tabs defaultValue="your3" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="your3" className="flex-1">
            <Heart className="w-3.5 h-3.5 mr-1.5" /> Your 3
          </TabsTrigger>
          <TabsTrigger value="explore" className="flex-1 gap-1.5">
            <Compass className="w-3.5 h-3.5" /> Explore
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
            <div className="text-center py-12 bg-card/50 rounded-xl border border-border/50 mt-2">
              <Moon className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No matches yet</h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                Your curated matches arrive every Sunday. Check back {refreshLabel}.
              </p>
            </div>
          ) : (
            <MatchRevealCeremony matchCount={displayMatches.length}>
              <div className="space-y-4 mt-2">
                {spotlightMatch && (
                  <MatchCard match={spotlightMatch} spotlight onConnect={handleConnect} onDetail={openDetail} />
                )}
                {gridMatches.length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    {gridMatches.map((m) => (
                      <MatchCard key={m.id} match={m} onConnect={handleConnect} onDetail={openDetail} />
                    ))}
                  </div>
                )}
              </div>
            </MatchRevealCeremony>
          )}
        </TabsContent>

        {/* ── Tab 2: Explore — pool in 2-col PoolCard grid ── */}
        <TabsContent value="explore">
          <div className="mt-2 space-y-3">
            <p className="text-xs text-muted-foreground text-center px-4">
              These members didn't make your curated 3 this week — but the connection potential is still high.
            </p>
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
    </div>
  );
};
