import { useState } from 'react';
import { useCuratedMatches } from '@/hooks/useCuratedMatches';
import { MatchProfileCard } from './MatchProfileCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Calendar, Sparkles, Heart } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

export const CuratedMatches = () => {
  const { matches, loading, acceptMatch, passMatch, getNextRefreshDate, pendingCount } = useCuratedMatches();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleAccept = async (matchId: string) => {
    setProcessingId(matchId);
    await acceptMatch(matchId);
    setProcessingId(null);
  };

  const handlePass = async (matchId: string) => {
    setProcessingId(matchId);
    await passMatch(matchId);
    setProcessingId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  const nextRefresh = getNextRefreshDate();

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
          <Sparkles className="w-4 h-4" />
          Curated For You
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          Your 3 This Week
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Hand-picked matches based on your RIF profile and dating style. 
          Choose wisely — new matches arrive every Sunday.
        </p>
      </div>

      {/* Countdown to refresh */}
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Calendar className="w-4 h-4" />
        <span>
          New matches in {formatDistanceToNow(nextRefresh)}
        </span>
      </div>

      {/* Matches Grid or Empty State */}
      {matches.length === 0 ? (
        <div className="text-center py-12 bg-card/50 rounded-xl border border-border/50">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            All caught up!
          </h3>
          <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
            You've responded to all your matches for this week. 
            Check back on Sunday for your next 3 curated matches.
          </p>
          <p className="text-sm text-primary">
            Next batch: {format(nextRefresh, 'EEEE, MMMM d')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {matches.map((match) => (
            <MatchProfileCard
              key={match.id}
              match={match}
              onAccept={() => handleAccept(match.id)}
              onPass={() => handlePass(match.id)}
              isProcessing={processingId === match.id}
            />
          ))}
        </div>
      )}

      {/* Progress indicator */}
      {pendingCount > 0 && pendingCount < 3 && (
        <div className="text-center text-sm text-muted-foreground">
          {3 - pendingCount} of 3 reviewed this week
        </div>
      )}
    </div>
  );
};
