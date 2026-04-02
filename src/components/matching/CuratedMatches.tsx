import { useState } from 'react';
import { useCuratedMatches } from '@/hooks/useCuratedMatches';
import { MatchProfileCard } from './MatchProfileCard';
import { MutualMatchModal } from './MutualMatchModal';
import { MatchRevealCeremony } from './MatchRevealCeremony';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

const CountdownRing = ({ daysUntil, totalDays = 7 }: { daysUntil: number; totalDays?: number }) => {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, 1 - daysUntil / totalDays));
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="relative w-24 h-24 mx-auto">
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth="3" opacity="0.3" />
        <circle
          cx="44" cy="44" r={radius} fill="none"
          stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-serif text-2xl text-foreground leading-none">{daysUntil}</span>
        <span className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground mt-0.5">
          {daysUntil === 1 ? 'day' : 'days'}
        </span>
      </div>
    </div>
  );
};

export const CuratedMatches = () => {
  const { matches, loading, acceptMatch, passMatch, getNextRefreshDate, pendingCount } = useCuratedMatches();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [mutualMatch, setMutualMatch] = useState<{

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
          <CountdownRing daysUntil={daysUntil} />
          <h3 className="font-serif text-2xl text-foreground font-normal mb-2.5 mt-6">
            {daysUntil <= 1 ? "Your 3 are being curated." : "Your next drop is coming."}
          </h3>
          <p className="text-sm text-muted-foreground font-light leading-relaxed max-w-[280px] mx-auto">
            {daysUntil <= 1
              ? "Hand-selected matches arrive tomorrow morning."
              : "Hand-selected just for you, every Sunday."}
          </p>
        </div>
      ) : (
        <MatchRevealCeremony matchCount={matches.length} storageKey="monark-curated-reveal">
          <div className="flex flex-col gap-5">
            {/* Staggered card reveal */}
            {matches.map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.15, ease: 'easeOut' }}
              >
                <MatchProfileCard
                  match={match}
                  onAccept={() => handleAccept(match.id)}
                  onPass={() => handlePass(match.id)}
                  isProcessing={processingId === match.id}
                />
              </motion.div>
            ))}
          </div>
        </MatchRevealCeremony>
      )}

      {/* Footer */}
      {matches.length > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-xs text-muted-foreground text-center leading-relaxed"
        >
          Three matches. One week. No inbox to sort.<br />
          <em className="text-primary">Date well.</em>
        </motion.p>
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
