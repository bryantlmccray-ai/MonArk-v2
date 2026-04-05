import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Heart, MessageCircle, Users } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useCuratedMatches, type CuratedMatch } from '@/hooks/useCuratedMatches';
import { useDatingPool, type DatingPoolMatch } from '@/hooks/useDatingPool';
import { DatingPool } from '@/components/matching/DatingPool';
import { MatchDetailModal } from '@/components/matching/MatchDetailModal';
import { MatchRevealCeremony } from '@/components/matching/MatchRevealCeremony';
import { MutualMatchModal } from '@/components/matching/MutualMatchModal';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export const SundayMatches: React.FC = () => {
  const { setShowPaywall } = useSubscription();
  const { matches: curatedMatches, loading: curatedLoading, acceptMatch, passMatch, pendingCount } = useCuratedMatches();

  // Detail modal state
  const [selectedMatch, setSelectedMatch] = useState<CuratedMatch | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Mutual match modal state
  const [mutualMatch, setMutualMatch] = useState<{ name: string; photo?: string; conversationId?: string } | null>(null);

  const handleConnect = async (match: CuratedMatch) => {
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
  };

  const handlePass = async (match: CuratedMatch) => {
    setProcessing(true);
    await passMatch(match.id);
    setProcessing(false);
    setDetailOpen(false);
    setSelectedMatch(null);
  };

  const openDetail = (match: CuratedMatch) => {
    setSelectedMatch(match);
    setDetailOpen(true);
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Compact info bar */}
      <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
        <span>{pendingCount} curated match{pendingCount !== 1 ? 'es' : ''} · refreshes Sunday</span>
        {pendingCount > 0 && (
          <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
            New Matches
          </Badge>
        )}
      </div>

      {/* Tabs: Your 3 + Explore */}
      <Tabs defaultValue="your3" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="your3" className="flex-1">
            Your 3
          </TabsTrigger>
          <TabsTrigger value="explore" className="flex-1 gap-1.5">
            <Users className="w-3.5 h-3.5" />
            Explore
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
              <h3 className="text-lg font-semibold text-foreground mb-2">No matches yet</h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                Your curated matches arrive every Sunday. Check back soon!
              </p>
            </div>
          ) : (
            <MatchRevealCeremony matchCount={curatedMatches.length}>
              <div className="grid gap-4 md:grid-cols-3 mt-2">
                {curatedMatches.map((match) => (
                  <Card
                    key={match.id}
                    className="overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => openDetail(match)}
                  >
                    <div className="relative h-48 w-full">
                      <img
                        src={match.profile.photos?.[0] || '/placeholder.svg'}
                        alt={`${match.profile.name || 'Match'}, ${match.profile.age || ''} — MonArk member`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement?.classList.add('bg-[#A08C6E]', 'flex', 'items-center', 'justify-center');
                          const fallback = document.createElement('div');
                          fallback.className = 'text-white text-4xl font-serif';
                          fallback.textContent = (match.profile.name || 'M').slice(0, 2).toUpperCase();
                          target.parentElement?.appendChild(fallback);
                        }}
                      />
                    </div>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg font-serif">
                            {match.profile.name}{match.profile.age ? `, ${match.profile.age}` : ''}
                          </CardTitle>
                          {match.profile.location && (
                            <div className="flex items-center text-xs text-muted-foreground mt-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              {match.profile.location}
                            </div>
                          )}
                        </div>
                        {match.compatibility_score && (
                          <div className="text-right">
                            <div className="text-xs font-medium text-primary">
                              {Math.round(match.compatibility_score * 100)}%
                            </div>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Match</div>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {match.match_reason && (
                        <p className="text-xs text-muted-foreground italic">"{match.match_reason}"</p>
                      )}
                      {match.profile.interests && match.profile.interests.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {match.profile.interests.slice(0, 3).map((interest) => (
                            <Badge key={interest} variant="outline" className="text-[10px] font-normal">
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
                          <MessageCircle className="h-4 w-4" />
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
              These members didn't make your curated 3 this week — but the connection potential is still high.
            </p>
            <DatingPool />
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
