import React from 'react';
import { Brain, ArrowRight, RefreshCw, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRIF } from '@/hooks/useRIF';
import { useProfile } from '@/hooks/useProfile';
import { getRIFSummary, mapQuizAnswersToRIFScores, type RIFDimensionScores } from '@/utils/rifScoreMapping';
import { cn } from '@/lib/utils';

interface RelationalProfileSectionProps {
  onNavigateToRIF: () => void;
}

const DIMENSION_META: Record<keyof RIFDimensionScores, { label: string; color: string }> = {
  intent_clarity: { label: 'Intent Clarity', color: 'bg-primary' },
  emotional_readiness: { label: 'Emotional Readiness', color: 'bg-accent' },
  pacing_preferences: { label: 'Pacing', color: 'bg-primary/80' },
  boundary_respect: { label: 'Boundary Respect', color: 'bg-accent/80' },
  post_date_alignment: { label: 'Self-Awareness', color: 'bg-primary/60' },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4 },
  }),
};

export const RelationalProfileSection: React.FC<RelationalProfileSectionProps> = ({
  onNavigateToRIF,
}) => {
  const { rifProfile, loading: rifLoading } = useRIF();
  const { profile } = useProfile();

  const hasRifScores = rifProfile && (
    rifProfile.intent_clarity > 0 ||
    rifProfile.emotional_readiness > 0 ||
    rifProfile.pacing_preferences > 0
  );

  const hasQuizAnswers = profile?.rif_quiz_answers &&
    typeof profile.rif_quiz_answers === 'object' &&
    Object.keys(profile.rif_quiz_answers).length > 0;

  const showResults = hasRifScores || hasQuizAnswers;

  // Build scores from whichever source is available
  const scores: RIFDimensionScores | null = hasRifScores
    ? {
        intent_clarity: rifProfile!.intent_clarity ?? 5,
        pacing_preferences: rifProfile!.pacing_preferences ?? 5,
        emotional_readiness: rifProfile!.emotional_readiness ?? 5,
        boundary_respect: rifProfile!.boundary_respect ?? 5,
        post_date_alignment: rifProfile!.post_date_alignment ?? 5,
      }
    : hasQuizAnswers
      ? mapQuizAnswersToRIFScores(profile!.rif_quiz_answers)
      : null;

  const insights = scores ? getRIFSummary(scores) : [];

  if (rifLoading) return null;

  // ── No RIF yet: show CTA card ──
  if (!showResults) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        custom={0.3}
        variants={fadeUp}
        className="bg-card rounded-2xl p-5 border border-border/60 shadow-[0_1px_3px_rgba(100,80,60,0.04)]"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-foreground font-serif text-lg">Relational Profile</h3>
              <p className="text-muted-foreground text-xs font-body mt-0.5">
                Take your RIF to unlock smarter matches
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToRIF}
            className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-all active:scale-95"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </motion.div>
    );
  }

  // ── Has results: show full summary ──
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      custom={0.3}
      variants={fadeUp}
      className="bg-card rounded-2xl border border-border/60 shadow-[0_1px_3px_rgba(100,80,60,0.04)] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-foreground font-serif text-lg">Relational Profile</h3>
            <p className="text-muted-foreground text-xs font-body mt-0.5">
              Your dating intelligence snapshot
            </p>
          </div>
        </div>
        <button
          onClick={onNavigateToRIF}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 rounded-lg transition-all active:scale-95"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retake
        </button>
      </div>

      {/* Dimension Bars */}
      {scores && (
        <div className="px-5 pb-4 space-y-3">
          {(Object.keys(DIMENSION_META) as (keyof RIFDimensionScores)[]).map((key, idx) => {
            const meta = DIMENSION_META[key];
            const value = scores[key];
            const pct = Math.round((value / 10) * 100);

            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground font-body">{meta.label}</span>
                  <span className="text-xs font-medium text-foreground tabular-nums">
                    {value.toFixed(1)}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className={cn('h-full rounded-full', meta.color)}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, delay: idx * 0.1, ease: 'easeOut' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <div className="px-5 pb-5 pt-1">
          <div className="rounded-xl bg-primary/5 border border-primary/10 p-4 space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Key Insights
              </span>
            </div>
            {insights.map((insight, i) => (
              <p key={i} className="text-sm text-muted-foreground leading-relaxed">
                • {insight}
              </p>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default RelationalProfileSection;
