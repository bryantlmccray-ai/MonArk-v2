import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Users, ArrowRight, Brain, Heart, Clock, Shield, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface RIFDimensionScores {
  intent_clarity: number;
  pacing_preferences: number;
  emotional_readiness: number;
  boundary_respect: number;
  post_date_alignment: number;
}

function getArchetype(scores: RIFDimensionScores) {
  const avg =
    (scores.intent_clarity +
      scores.emotional_readiness +
      scores.pacing_preferences +
      scores.boundary_respect +
      scores.post_date_alignment) /
    5;
  if (avg >= 7.5)
    return {
      name: 'The Intentional Partner',
      tagline: 'Clear on what you want. Ready to build something real.',
      color: 'from-primary/20 to-primary/5',
      accent: 'text-primary',
      border: 'border-primary/30',
    };
  if (avg >= 6 && scores.emotional_readiness >= 7 && scores.pacing_preferences < 6)
    return {
      name: 'The Hopeful Romantic',
      tagline: 'Your heart is wide open and you lead with feeling.',
      color: 'from-rose-500/20 to-rose-500/5',
      accent: 'text-rose-500',
      border: 'border-rose-500/30',
    };
  if (avg >= 6 && scores.pacing_preferences <= 5 && scores.boundary_respect >= 6)
    return {
      name: 'The Steady Builder',
      tagline: "Grounded, dependable, and in it for the long game.",
      color: 'from-amber-500/20 to-amber-500/5',
      accent: 'text-amber-500',
      border: 'border-amber-500/30',
    };
  if (avg >= 4 && (scores.boundary_respect < 6 || scores.emotional_readiness < 5))
    return {
      name: 'The Guarded Opener',
      tagline: 'You want connection — and you protect yourself wisely.',
      color: 'from-emerald-500/20 to-emerald-500/5',
      accent: 'text-emerald-500',
      border: 'border-emerald-500/30',
    };
  if (scores.post_date_alignment >= 7)
    return {
      name: 'The Self-Aware Seeker',
      tagline: 'Deep self-knowledge. A rare and magnetic quality.',
      color: 'from-violet-500/20 to-violet-500/5',
      accent: 'text-violet-500',
      border: 'border-violet-500/30',
    };
  return {
    name: 'The Open Explorer',
    tagline: "In discovery mode — open to all possibilities.",
    color: 'from-sky-500/20 to-sky-500/5',
    accent: 'text-sky-500',
    border: 'border-sky-500/30',
  };
}

const DIMENSION_ICONS = [
  { key: 'intent_clarity', label: 'Intent', Icon: Brain, color: 'text-primary' },
  { key: 'emotional_readiness', label: 'Heart', Icon: Heart, color: 'text-rose-500' },
  { key: 'pacing_preferences', label: 'Pace', Icon: Clock, color: 'text-amber-500' },
  { key: 'boundary_respect', label: 'Boundaries', Icon: Shield, color: 'text-emerald-500' },
  { key: 'post_date_alignment', label: 'Self-Awareness', Icon: Eye, color: 'text-violet-500' },
] as const;

interface RIFArchetypeTeaserProps {
  rifQuizAnswers: Record<number, string> | null | undefined;
  rifArchetype?: string | null;
  cityPoolCount?: number;
  refreshLabel?: string;
  onTakeQuiz?: () => void;
}

export const RIFArchetypeTeaser: React.FC<RIFArchetypeTeaserProps> = ({
  rifQuizAnswers,
  rifArchetype,
  cityPoolCount = 0,
  refreshLabel,
  onTakeQuiz,
}) => {
  // Derive scores from stored answers if available
  const scores: RIFDimensionScores | null = rifQuizAnswers
    ? (() => {
        const s: RIFDimensionScores = {
          intent_clarity: 5,
          pacing_preferences: 5,
          emotional_readiness: 5,
          boundary_respect: 5,
          post_date_alignment: 5,
        };
        // Mirror the scoring logic from RIFResultsScreen
        const a = rifQuizAnswers as Record<number, string>;
        if (a[1] === 'I speak up immediately') { s.emotional_readiness += 2; s.boundary_respect += 2; }
        else if (a[1] === 'I need time to process first') { s.emotional_readiness += 1; s.boundary_respect += 1; }
        else if (a[1] === 'I go quiet and withdraw') { s.emotional_readiness -= 1; s.boundary_respect -= 1; }
        if (a[3] === 'I prefer to build slowly and let things unfold') { s.pacing_preferences -= 2; s.boundary_respect += 1; }
        else if (a[3] === 'I usually know quickly') { s.pacing_preferences += 2; s.intent_clarity += 2; }
        if (a[8] === 'I need emotional depth and vulnerability') s.emotional_readiness += 2;
        else if (a[8] === 'I need shared goals and ambition') s.intent_clarity += 2;
        if (a[10] === 'Being honest about what I want from the start') { s.intent_clarity += 2; s.boundary_respect += 1; }
        else if (a[10] === 'Taking my time instead of rushing into things') { s.pacing_preferences -= 2; s.boundary_respect += 1; }
        const clamp = (n: number) => Math.max(0, Math.min(10, n));
        return {
          intent_clarity: clamp(s.intent_clarity),
          pacing_preferences: clamp(s.pacing_preferences),
          emotional_readiness: clamp(s.emotional_readiness),
          boundary_respect: clamp(s.boundary_respect),
          post_date_alignment: clamp(s.post_date_alignment),
        };
      })()
    : null;

  const archetype = scores ? getArchetype(scores) : null;
  const archetypeName = rifArchetype || archetype?.name;

  // If no RIF data at all, show CTA to take the quiz
  if (!archetypeName) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="rounded-2xl border border-border/60 bg-card p-5 space-y-4"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Complete your RIF Quiz</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              Your Relational Identity Framework profile unlocks curated matches. Takes about 3 minutes.
            </p>
          </div>
        </div>
        {onTakeQuiz && (
          <Button size="sm" className="w-full" onClick={onTakeQuiz}>
            Take the RIF Quiz <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        )}
      </motion.div>
    );
  }

  const display = archetype ?? {
    name: archetypeName,
    tagline: 'Your relational profile is active.',
    color: 'from-primary/20 to-primary/5',
    accent: 'text-primary',
    border: 'border-primary/30',
  };

  return (
    <div className="space-y-3">
      {/* Archetype Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className={`rounded-2xl border ${display.border} bg-gradient-to-br ${display.color} p-5 space-y-3`}
      >
        <div className="flex items-center justify-between">
          <Badge variant="outline" className={`text-[10px] font-medium border-current ${display.accent} uppercase tracking-[0.1em]`}>
            Your Archetype
          </Badge>
          <Sparkles className={`w-4 h-4 ${display.accent} opacity-70`} />
        </div>
        <div>
          <h3 className={`text-lg font-serif font-bold ${display.accent}`}>{display.name}</h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{display.tagline}</p>
        </div>

        {/* Mini dimension bars */}
        {scores && (
          <div className="grid grid-cols-5 gap-2 pt-1">
            {DIMENSION_ICONS.map(({ key, label, Icon, color }) => {
              const score = scores[key as keyof RIFDimensionScores];
              const pct = Math.round((score / 10) * 100);
              return (
                <div key={key} className="flex flex-col items-center gap-1">
                  <Icon className={`w-3.5 h-3.5 ${color}`} />
                  <div className="w-full bg-muted/50 rounded-full h-1">
                    <div
                      className={`h-1 rounded-full ${color.replace('text-', 'bg-')}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-muted-foreground text-center leading-tight">{label}</span>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* City Pool Bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.12, ease: 'easeOut' }}
        className="flex items-center gap-3 rounded-xl border border-border/50 bg-card px-4 py-3"
      >
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Users className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-foreground">
            {cityPoolCount > 0
              ? `${cityPoolCount} people in your city pool`
              : 'Your city pool is building'}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {refreshLabel
              ? `Curated matches drop ${refreshLabel}`
              : 'Curated matches drop every Sunday'}
          </p>
        </div>
        <div className="relative flex items-center justify-center flex-shrink-0">
          <span className="absolute inline-flex h-3 w-3 rounded-full bg-primary/40 animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary animate-pulse" />
        </div>
      </motion.div>
    </div>
  );
};
