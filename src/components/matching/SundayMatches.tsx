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

export const SundayMatches: React.FC = () => {
  const { setShowPaywall } = useSubscription();
  const {
    matches: curatedMatches,
    loading: curatedLoading,
    acceptMatch,
    passMatch,
    pendingCount,
    getNextRefreshDate,
  } = useCuratedMatches();
  const { protectedAction } = useActionProtection({ debounceMs: 600 });

  // Detail modal state
  const [selectedMatch, setSelectedMatch] = useState<CuratedMatch | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Mutual match modal state
  const [mutualMatch, setMutualMatch] = useState<{
    name: string;
    photo?: string;
    conversationId?: string;
  } | null>(null);

  const handleConnect = async (match: CuratedMatch) => {
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

  const handlePass = async (match: CuratedMatch) => {
    await protectedAction(async () => {
      setProcessing(true);
      await passMatch(match.id);
      setProcessing(false);
      setDetailOpen(false);
      setSelectedMatch(null);
    });
  };

  const openDetail = (match: CuratedMatch) => {
    setSelectedMatch(match);
    setDetailOpen(true);
  };

  const nextRefresh = getNextRefreshDate();
  const refreshLabel = formatDistanceToNow(nextRefresh, { addSuffix: true });

  return (
    <div className="space-y-4 pb-8">
      {/* Compact info bar */}
      <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
        <span>
          {pendingCount} match{pendingCount !== 1 ? 'es' : ''} · refreshes{' '}
          {refreshLabel}
        </span>
        {pendingCount > 0 && (
          <Badge
            variant="secondary"
            className="bg-primary/10 text-primary hover:bg-primary/20"
          >
            <Sparkles className="w-3 h-3 mr-1" />
            New
          </Badge>
        )}
      </div>

      {/* Tabs: Your 3 + Explore + Plans */}
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

        {/* ── Your 3 curated matches ── */}
        <TabsContent value="your3">
          {curatedLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : curatedMatches.length === 0 ? (
            <div className="text-center py-12 bg-card/50 rounded-xl border border-border/50 mt-2">
              <Moon className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No matches yet
              </h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                Your curated matches arrive every Sunday. Check back{' '}
                {refreshLabel}.
              </p>
            </div>
          ) : (
            <MatchRevealCeremony matchCount={curatedMatches.length}>
              <div className="grid gap-4 md:grid-cols-3 mt-2">
                {curatedMatches.map((match) => (
                  <Card
                    key={match.id}
                    className="overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                    onClick={() => openDetail(match)}
                  >
                    <div className="relative h-48 w-full">
                      <img
                        src={match.profile.photos?.[0] || '/placeholder.svg'}
                        alt={`${match.profile.name || 'Match'}, ${match.profile.age || ''} — MonArk member`}
                        className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement?.classList.add(
                            'bg-[#A08C6E]',
                            'flex',
                            'items-center',
                            'justify-center'
                          );
                          const fallback = document.createElement('div');
                          fallback.className = 'text-white text-4xl font-serif';
                          fallback.textContent = (match.profile.name || 'M')
                            .slice(0, 2)
                            .toUpperCase();
                          target.parentElement?.appendChild(fallback);
                        }}
                      />
                    </div>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg font-serif">
                            {match.profile.name}
                            {match.profile.age ? `, ${match.profile.age}` : ''}
                          </CardTitle>
                          {match.profile.location && (
                            <div className="flex items-center text-xs text-muted-foreground mt-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              {match.profile.location}
                            </div>
                          )}
                        </div>
                        {match.compatibility_score != null && (
                          <div className="text-right">
                            <div className="text-xs font-medium text-primary">
                              {Math.round(match.compatibility_score * 100)}%
                            </div>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                              Match
                            </div>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {match.match_reason && (
                        <p className="text-xs text-muted-foreground italic">
                          "{match.match_reason}"
                        </p>
                      )}
                      {match.profile.interests &&
                        match.profile.interests.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {match.profile.interests.slice(0, 3).map((interest) => (
                              <Badge
                                key={interest}
                                variant="outline"
                                className="text-[10px] font-normal"
                              >
                                {interest}
                              </Badge>
                            ))}
                          </div>
                        )}
                      <div className="flex gap-2 pt-2">
                        <Button
                          className="flex-1"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleConnect(match);
                          }}
                        >
                          <Heart className="h-4 w-4 mr-2" />
                          Connect
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="px-3"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDetail(match);
                          }}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </MatchRevealCeremony>
          )}
        </TabsContent>

        {/* ── Explore / Dating Pool ── */}
        <TabsContent value="explore">
          <div className="mt-2 rounded-lg border border-border/50 bg-card/30 p-1">
            <p className="text-xs text-muted-foreground text-center py-2 px-4">
              These members didn't make your curated 3 this week — but the
              connection potential is still high.
            </p>
            <DatingPool />
          </div>
        </TabsContent>

        {/* ── Date Plans ── */}
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
            name: selectedMatch.profile.name || 'Match',
            age: selectedMatch.profile.age,
            photos: selectedMatch.profile.photos || [],
            bio: selectedMatch.profile.bio || '',
            location: selectedMatch.profile.location || '',
            interests: selectedMatch.profile.interests || [],
            occupation: selectedMatch.profile.occupation || '',
            education_level: selectedMatch.profile.education_level || '',
            compatibility_score: selectedMatch.compatibility_score,
            match_reason: selectedMatch.match_reason,
          }}
          isOpen={detailOpen}
          onClose={() => {
            setDetailOpen(false);
            setSelectedMatch(null);
          }}
          onLike={() => handleConnect(selectedMatch)}
          onPass={() => handlePass(selectedMatch)}
          isProcessing={processing}
          isCurated
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
