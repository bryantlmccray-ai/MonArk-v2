import { useState } from 'react';
import { useCuratedMatches, CuratedMatch } from '@/hooks/useCuratedMatches';
import { useDatingPool, DatingPoolMatch } from '@/hooks/useDatingPool';
import { MatchDetailModal } from './MatchDetailModal';
import { MutualMatchModal } from './MutualMatchModal';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Sparkles, Users, Calendar, Heart, MapPin, 
  ChevronRight, Target, Sun 
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface UnifiedMatch {
  id: string;
  userId: string;
  name?: string;
  photos?: string[];
  bio?: string;
  age?: number;
  location?: string;
  interests?: string[];
  occupation?: string;
  education_level?: string;
  compatibility_score?: number;
  match_reason?: string;
  isCurated: boolean;
}

export const SundayMatches = () => {
  const navigate = useNavigate();
  const { 
    matches: curatedMatches, 
    loading: curatedLoading, 
    acceptMatch: acceptCurated, 
    passMatch: passCurated,
    getNextRefreshDate 
  } = useCuratedMatches();
  
  const { 
    pool, 
    loading: poolLoading, 
    likePoolMatch, 
    passPoolMatch 
  } = useDatingPool();

  const [selectedMatch, setSelectedMatch] = useState<UnifiedMatch | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [mutualMatch, setMutualMatch] = useState<{ name: string; photo?: string; conversationId?: string } | null>(null);
  const [activeTab, setActiveTab] = useState('curated');

  const loading = curatedLoading || poolLoading;
  const nextRefresh = getNextRefreshDate();

  // Convert to unified format
  const unifiedCurated: UnifiedMatch[] = curatedMatches.map((m: CuratedMatch) => ({
    id: m.id,
    userId: m.matched_user_id,
    name: m.profile.name,
    photos: m.profile.photos,
    bio: m.profile.bio,
    age: m.profile.age,
    location: m.profile.location,
    interests: m.profile.interests,
    occupation: m.profile.occupation,
    education_level: m.profile.education_level,
    compatibility_score: m.compatibility_score,
    match_reason: m.match_reason,
    isCurated: true
  }));

  const unifiedPool: UnifiedMatch[] = pool.map((m: DatingPoolMatch) => ({
    id: m.id,
    userId: m.pool_user_id,
    name: m.profile.name,
    photos: m.profile.photos,
    bio: m.profile.bio,
    age: m.profile.age,
    location: m.profile.location,
    interests: m.profile.interests,
    occupation: m.profile.occupation,
    education_level: m.profile.education_level,
    compatibility_score: m.compatibility_score,
    isCurated: false
  }));

  const handleLike = async () => {
    if (!selectedMatch) return;
    
    setProcessingId(selectedMatch.id);
    
    let result: { success: boolean; isMutual?: boolean; conversationId?: string; matchName?: string; matchPhoto?: string };
    
    if (selectedMatch.isCurated) {
      result = await acceptCurated(selectedMatch.id);
    } else {
      result = await likePoolMatch(selectedMatch.id);
    }

    // Check for mutual match
    if (result.success && result.isMutual) {
      setMutualMatch({
        name: result.matchName || selectedMatch.name || 'Your Match',
        photo: result.matchPhoto || selectedMatch.photos?.[0],
        conversationId: result.conversationId
      });
    }

    setProcessingId(null);
    setSelectedMatch(null);
  };

  const handlePass = async () => {
    if (!selectedMatch) return;
    
    setProcessingId(selectedMatch.id);
    
    if (selectedMatch.isCurated) {
      await passCurated(selectedMatch.id);
    } else {
      await passPoolMatch(selectedMatch.id);
    }

    setProcessingId(null);
    setSelectedMatch(null);
  };

  const handleStartChat = () => {
    if (mutualMatch?.conversationId) {
      navigate(`/chat/${mutualMatch.conversationId}`);
    }
    setMutualMatch(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  const totalMatches = unifiedCurated.length + unifiedPool.length;

  // Check if this is the user's first visit to show welcome tip
  const [showWelcomeTip, setShowWelcomeTip] = useState(() => {
    return !sessionStorage.getItem('monark-welcome-tip-dismissed');
  });

  const dismissWelcomeTip = () => {
    sessionStorage.setItem('monark-welcome-tip-dismissed', 'true');
    setShowWelcomeTip(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Welcome Tip Banner */}
      {showWelcomeTip && (
        <div className="bg-primary/10 border-b border-primary/20 px-4 py-3">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-foreground">
                Welcome to MonArk! View and edit your profile anytime in the <strong>Profile</strong> tab below.
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={dismissWelcomeTip}
              className="text-muted-foreground hover:text-foreground flex-shrink-0"
            >
              Got it
            </Button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="px-4 py-4 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sun className="w-6 h-6 text-amber-500" />
              <h1 className="text-xl font-bold text-foreground">Sunday Matches</h1>
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDistanceToNow(nextRefresh, { addSuffix: true })}
            </Badge>
          </div>
          
          {totalMatches > 0 ? (
            <p className="text-sm text-muted-foreground">
              {unifiedCurated.length} curated + {unifiedPool.length} pool matches waiting for you
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              New matches arrive {format(nextRefresh, 'EEEE, MMMM d')} at 9am
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {totalMatches === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                All Caught Up!
              </h2>
              <p className="text-muted-foreground max-w-sm mx-auto mb-4">
                You've reviewed all your matches for this week. 
                Come back Sunday for your next batch!
              </p>
              <p className="text-sm text-primary font-medium">
                Next batch: {format(nextRefresh, 'EEEE, MMMM d')}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="curated" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Your 3 ({unifiedCurated.length})
              </TabsTrigger>
              <TabsTrigger value="pool" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Pool ({unifiedPool.length})
              </TabsTrigger>
            </TabsList>

            {/* Curated Matches Tab */}
            <TabsContent value="curated" className="space-y-4">
              <div className="text-center pb-4">
                <p className="text-sm text-muted-foreground">
                  Hand-picked matches based on your RIF profile and what you're looking for
                </p>
              </div>
              
              {unifiedCurated.length === 0 ? (
                <Card className="text-center py-8">
                  <CardContent>
                    <p className="text-muted-foreground">
                      You've responded to all your curated matches!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {unifiedCurated.map((match) => (
                    <MatchCard 
                      key={match.id}
                      match={match}
                      onClick={() => setSelectedMatch(match)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Pool Tab */}
            <TabsContent value="pool" className="space-y-4">
              <div className="text-center pb-4">
                <p className="text-sm text-muted-foreground">
                  More compatible people to explore this week
                </p>
              </div>
              
              {unifiedPool.length === 0 ? (
                <Card className="text-center py-8">
                  <CardContent>
                    <p className="text-muted-foreground">
                      You've browsed through your entire dating pool!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {unifiedPool.map((match) => (
                    <PoolCard 
                      key={match.id}
                      match={match}
                      onClick={() => setSelectedMatch(match)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Match Detail Modal */}
      <MatchDetailModal
        match={selectedMatch}
        isOpen={!!selectedMatch}
        onClose={() => setSelectedMatch(null)}
        onLike={handleLike}
        onPass={handlePass}
        isProcessing={processingId === selectedMatch?.id}
        isCurated={selectedMatch?.isCurated}
      />

      {/* Mutual Match Celebration */}
      <MutualMatchModal
        isOpen={!!mutualMatch}
        onClose={() => setMutualMatch(null)}
        matchName={mutualMatch?.name || ''}
        matchPhoto={mutualMatch?.photo}
        onStartChat={handleStartChat}
      />
    </div>
  );
};

// Curated match card - larger, more prominent
const MatchCard = ({ match, onClick }: { match: UnifiedMatch; onClick: () => void }) => {
  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow border-primary/20"
      onClick={onClick}
    >
      <div className="flex">
        {/* Photo */}
        <div className="w-32 h-40 flex-shrink-0">
          <img
            src={match.photos?.[0] || '/placeholder.svg'}
            alt={match.name || 'Match'}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Content */}
        <CardContent className="flex-1 p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-foreground text-lg">
                {match.name}, {match.age}
              </h3>
              {match.location && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {match.location}
                </p>
              )}
            </div>
            {match.compatibility_score && (
              <Badge className="bg-primary/10 text-primary border-none">
                <Target className="w-3 h-3 mr-1" />
                {Math.round(match.compatibility_score * 100)}%
              </Badge>
            )}
          </div>

          {/* Match reason */}
          {match.match_reason && (
            <p className="text-sm text-primary mb-2 line-clamp-1">
              <Sparkles className="w-3 h-3 inline mr-1" />
              {match.match_reason}
            </p>
          )}

          {/* Interests preview */}
          <div className="flex flex-wrap gap-1 mb-3">
            {match.interests?.slice(0, 3).map((interest) => (
              <Badge key={interest} variant="secondary" className="text-xs">
                {interest}
              </Badge>
            ))}
          </div>

          {/* View profile CTA */}
          <div className="flex items-center text-sm text-primary font-medium">
            View Full Profile
            <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

// Pool match card - compact grid style
const PoolCard = ({ match, onClick }: { match: UnifiedMatch; onClick: () => void }) => {
  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="relative aspect-[3/4]">
        <img
          src={match.photos?.[0] || '/placeholder.svg'}
          alt={match.name || 'Match'}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        
        {/* Compatibility badge */}
        {match.compatibility_score && (
          <Badge 
            className="absolute top-2 right-2 bg-black/60 text-white border-none text-xs"
          >
            {Math.round(match.compatibility_score * 100)}%
          </Badge>
        )}

        {/* Info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="font-semibold text-white text-sm">
            {match.name}, {match.age}
          </p>
          {match.location && (
            <p className="text-white/80 text-xs flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {match.location}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};