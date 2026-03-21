import { useState } from 'react';
import { useCuratedMatches } from '@/hooks/useCuratedMatches';
import { MatchProfileCard } from './MatchProfileCard';
import { MutualMatchModal } from './MutualMatchModal';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Calendar, Sparkles } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

export const CuratedMatches = () => {
  const { matches, loading, acceptMatch, passMatch, getNextRefreshDate, pendingCount } = useCuratedMatches();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [mutualMatch, setMutualMatch] = useState<{
    matchName?: string;
    matchPhoto?: string;
    conversationId?: string;
  } | null>(null);

  const handleAccept = async (matchId: string) => {
    setProcessingId(matchId);
    const result = await acceptMatch(matchId);
    setProcessingId(null);
    if (result.isMutual) {
      setMutualMatch({
        matchName: result.matchName,
        matchPhoto: result.matchPhoto,
        conversationId: result.conversationId,
      });
    }
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
  const now = new Date();
  const daysUntil = Math.ceil((nextRefresh.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1.5">
          <Sparkles className="w-3 h-3" />
          MonArk
        </div>
        <h2 className="font-serif text-3xl text-foreground font-normal tracking-tight">
          Your 3 This Week
        </h2>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="w-3.5 h-3.5" />
          <span>New matches in {formatDistanceToNow(nextRefresh)}</span>
        </div>
      </div>

      {/* Matches or Empty State */}
      {matches.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full border border-primary/30 flex items-center justify-center mx-auto mb-6 bg-card">
            <span className="font-serif text-2xl text-primary italic">3</span>
          </div>
          <h3 className="font-serif text-2xl text-foreground font-normal mb-2.5">
            Your 3 arrive Monday.
          </h3>
          <p className="text-sm text-muted-foreground font-light leading-relaxed max-w-[280px] mx-auto">
            {daysUntil <= 1
              ? "They're being curated now. Check back tomorrow morning."
              : `${daysUntil} days until your next delivery.`}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
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

      {/* Footer */}
      {matches.length > 0 && (
        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          Three matches. One week. No inbox to sort.<br />
          <em className="text-primary">Date well.</em>
        </p>
      )}

      {/* Progress */}
      {pendingCount > 0 && pendingCount < 3 && (
        <div className="text-center text-xs text-muted-foreground">
          {3 - pendingCount} of 3 reviewed this week
        </div>
      )}

      {/* Mutual match modal */}
      {mutualMatch && (
        <MutualMatchModal
          open={!!mutualMatch}
          onClose={() => setMutualMatch(null)}
          matchName={mutualMatch.matchName}
          matchPhoto={mutualMatch.matchPhoto}
          conversationId={mutualMatch.conversationId}
        />
      )}
    </div>
  );
};
