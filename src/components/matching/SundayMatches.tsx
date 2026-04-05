import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sparkles, Users, Calendar, Heart, MapPin, ChevronRight,
  Coffee, Wine, Palette, Music, Compass, Moon, MessageCircle
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useSubscription } from '@/hooks/useSubscription';
import { useCuratedMatches, type CuratedMatch } from '@/hooks/useCuratedMatches';
import { useDatingPool, type DatingPoolMatch } from '@/hooks/useDatingPool';
import { DatingPool } from '@/components/matching/DatingPool';
import { MatchDetailModal } from '@/components/matching/MatchDetailModal';
import { MatchRevealCeremony } from '@/components/matching/MatchRevealCeremony';
import { MutualMatchModal } from '@/components/matching/MutualMatchModal';
import { WeeklyRhythmPlans } from '@/components/weekly/WeeklyRhythmPlans';
import { ApiErrorFallback } from '@/components/common/ApiErrorFallback';
import { useActionProtection } from '@/hooks/useActionProtection';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useDemo } from '@/contexts/DemoContext';

/* ── Unified match shape used for both curated + pool demo data ── */
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

/* ── Demo: curated 3 ── */
const DEMO_CURATED: UnifiedMatch[] = [
  {
    id: 'curated-1',
    name: 'Sophia',
    age: 28,
    location: 'River North',
    occupation: 'Art Curator',
    bio: 'Strong communicator who values depth and intentionality in every connection.',
    photoUrl: '/images/matches/sophia.jpg',
    compatibilityScore: 94,
    matchReason: 'You both value slow-building trust and direct communication.',
    interests: ['Live Jazz', 'Gallery Openings', 'Hiking'],
    type: 'curated',
  },
  {
    id: 'curated-2',
    name: 'Marcus',
    age: 31,
    location: 'Lincoln Park',
    occupation: 'Music Producer',
    bio: 'Intentional dater who brings emotional presence to every conversation.',
    photoUrl: '/images/matches/marcus.jpg',
    compatibilityScore: 89,
    matchReason: 'Complementary conflict styles — he speaks up, you reflect first.',
    interests: ['Poetry', 'Yoga', 'Art Museums'],
    type: 'curated',
  },
  {
    id: 'curated-3',
    name: 'Elena',
    age: 27,
    location: 'West Loop',
    occupation: 'Architect',
    bio: 'Curious spirit with steady pacing and aligned relationship goals.',
    photoUrl: '/images/matches/elena.jpg',
    compatibilityScore: 92,
    matchReason: 'Shared pacing preference and aligned relationship goals.',
    interests: ['Film', 'Running', 'Travel'],
    type: 'curated',
  },
];

/* ── Demo: pool of potentials ── */
const DEMO_POOL: UnifiedMatch[] = [
  {
    id: 'pool-1',
    name: 'James',
    age: 30,
    location: 'Wicker Park',
    occupation: 'Filmmaker',
    bio: 'Storyteller at heart — always chasing the next great narrative.',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    compatibilityScore: 78,
    matchReason: 'Shared creative energy and curiosity-driven outlook.',
    interests: ['Cinema', 'Street Photography', 'Coffee'],
    type: 'pool',
  },
  {
    id: 'pool-2',
    name: 'Maya',
    age: 29,
    location: 'Logan Square',
    occupation: 'Interior Designer',
    bio: 'Finds beauty in details and believes spaces shape connections.',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    compatibilityScore: 82,
    matchReason: 'Both drawn to aesthetics and intentional living.',
    interests: ['Design', 'Brunch', 'Ceramics'],
    type: 'pool',
  },
  {
    id: 'pool-3',
    name: 'David',
    age: 33,
    location: 'Fulton Market',
    occupation: 'Chef',
    bio: 'Believes the best conversations happen over a shared meal.',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
    compatibilityScore: 85,
    matchReason: 'Aligned values on quality time and presence.',
    interests: ['Cooking', 'Wine Tasting', 'Farmers Markets'],
    type: 'pool',
  },
  {
    id: 'pool-4',
    name: 'Aria',
    age: 26,
    location: 'Hyde Park',
    occupation: 'Musician',
    bio: 'Classically trained with a love for spontaneous jam sessions.',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
    compatibilityScore: 80,
    matchReason: 'Complementary creative rhythms and emotional expressiveness.',
    interests: ['Music', 'Poetry Nights', 'Nature Walks'],
    type: 'pool',
  },
];

/* ── Helper: render a match card (shared by spotlight & grid) ── */
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
      <img
        src={match.photoUrl}
        alt={`${match.name}, ${match.age} — MonArk member`}
        className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
        loading="lazy"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          target.parentElement?.classList.add('bg-[#A08C6E]', 'flex', 'items-center', 'justify-center');
          const fb = document.createElement('div');
          fb.className = 'text-white text-4xl font-serif';
          fb.textContent = match.name.slice(0, 2).toUpperCase();
          target.parentElement?.appendChild(fb);
        }}
      />
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
          className="flex-1"
          size="sm"
          onClick={(e) => { e.stopPropagation(); onConnect(match); }}
        >
          <Heart className="h-4 w-4 mr-2" />
          Connect
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="px-3"
          onClick={(e) => { e.stopPropagation(); onDetail(match); }}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </CardContent>
  </Card>
);

/* ── Main component ── */
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
  const { protectedAction } = useActionProtection({ debounceMs: 600 });

  // Use demo data when in demo mode, otherwise use real curated matches
  const isDemo = demoData.isInDemo;
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

  // Detail modal state
  const [selectedMatch, setSelectedMatch] = useState<UnifiedMatch | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Mutual match modal state
  const [mutualMatch, setMutualMatch] = useState<{
    name: string;
    photo?: string;
    conversationId?: string;
  } | null>(null);

  const handleConnect = async (match: UnifiedMatch) => {
    if (isDemo) {
      setShowPaywall(true);
      return;
    }
    await protectedAction(async () => {
      setProcessing(true);
      const result = await acceptMatch(match.id);
      setProcessing(false);
      setDetailOpen(false);
      setSelectedMatch(null);
      if (result.isMutual && result.matchName) {
        setMutualMatch({
          name: result.matchName,
          photo: result.matchPhoto,
          conversationId: result.conversationId,
        });
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

  // Spotlight = first match, rest go in 2-col grid
  const spotlightMatch = displayMatches[0] || null;
  const gridMatches = displayMatches.slice(1);

  return (
    <div className="space-y-4 pb-8">
      {/* Compact info bar */}
      <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
        <span>
          {matchCount} match{matchCount !== 1 ? 'es' : ''} · refreshes {refreshLabel}
        </span>
        {matchCount > 0 && (
          <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
            <Sparkles className="w-3 h-3 mr-1" />
            New
          </Badge>
        )}
      </div>

      {/* 3-tab layout: Your 3 + Explore + Plans */}
      <Tabs defaultValue="your3" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="your3" className="flex-1">
            <Heart className="w-3.5 h-3.5 mr-1.5" />
            Your 3
          </TabsTrigger>
          <TabsTrigger value="explore" className="flex-1 gap-1.5">
            <Compass className="w-3.5 h-3.5" />
            Explore
          </TabsTrigger>
          <TabsTrigger value="plans" className="flex-1 gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Plans
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Your 3 — curated with spotlight + grid ── */}
        <TabsContent value="your3">
          {curatedLoading && !isDemo ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
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
                {/* Spotlight: top match */}
                {spotlightMatch && (
                  <MatchCard
                    match={spotlightMatch}
                    spotlight
                    onConnect={handleConnect}
                    onDetail={openDetail}
                  />
                )}

                {/* 2-col grid: remaining matches */}
                {gridMatches.length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    {gridMatches.map((match) => (
                      <MatchCard
                        key={match.id}
                        match={match}
                        onConnect={handleConnect}
                        onDetail={openDetail}
                      />
                    ))}
                  </div>
                )}
              </div>
            </MatchRevealCeremony>
          )}
        </TabsContent>

        {/* ── Tab 2: Explore / Dating Pool ── */}
        <TabsContent value="explore">
          <div className="mt-2 rounded-lg border border-border/50 bg-card/30 p-1">
            <p className="text-xs text-muted-foreground text-center py-2 px-4">
              These members didn't make your curated 3 this week — but the connection potential is still high.
            </p>
            <DatingPool />
          </div>
        </TabsContent>

        {/* ── Tab 3: Date Plans ── */}
        <TabsContent value="plans">
          <div className="mt-2">
            <WeeklyRhythmPlans />
          </div>
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
