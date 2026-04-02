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
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/15">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/40 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary/60"></span>
            </span>
            <span className="text-xs font-medium text-primary tracking-wide">
              Next drop {formatDistanceToNow(nextRefresh, { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>

      {/* Matches or Empty State */}
      {matches.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 rounded-full border-2 border-primary/20 flex items-center justify-center mx-auto mb-6 bg-gradient-to-br from-primary/5 to-transparent animate-[gentle-pulse_2s_ease-in-out_infinite]">
            <span className="font-serif text-3xl text-primary italic">3</span>
          </div>
          <h3 className="font-serif text-2xl text-foreground font-normal mb-2.5">
            {daysUntil <= 1 ? "Your 3 are being curated." : "Your next drop is coming."}
          </h3>
          <p className="text-sm text-muted-foreground font-light leading-relaxed max-w-[280px] mx-auto mb-4">
            {daysUntil <= 1
              ? "Hand-selected matches arrive tomorrow morning."
              : "Hand-selected just for you, every Sunday."}
          </p>
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-card border border-border/60 shadow-sm">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="font-serif text-lg text-foreground">{daysUntil}</span>
            <span className="text-xs uppercase tracking-widest text-muted-foreground">{daysUntil === 1 ? 'day' : 'days'} to go</span>
          </div>
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
          isOpen={!!mutualMatch}
          onClose={() => setMutualMatch(null)}
          matchName={mutualMatch.matchName || 'Your match'}
          matchPhoto={mutualMatch.matchPhoto}
          onStartChat={() => setMutualMatch(null)}
        />
      )}
    </div>
  );
};
