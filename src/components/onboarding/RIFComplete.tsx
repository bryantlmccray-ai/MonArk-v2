import React from 'react';
import { Button } from '@/components/ui/button';
import { UserCircle, ArrowRight, Heart, Zap, Shield, Calendar, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { OnboardingProgressDots } from './OnboardingProgressDots';
import { useRIF } from '@/hooks/useRIF';

interface RIFCompleteProps {
  onContinueToProfile: () => void;
  onSkipProfile: () => void;
  quizAnswers?: Record<string, any>;
}

// Map quiz answers to plain-English RIF dimension labels
function deriveRIFSummary(rifProfile: any, quizAnswers?: Record<string, any>) {
  const dims: { key: string; label: string; icon: React.ReactNode; value: number; description: string }[] = [];

  const pacing = rifProfile?.pacing_preferences ?? quizAnswers?.pacePreference;
  const emotional = rifProfile?.emotional_readiness ?? 5;
  const boundary = rifProfile?.boundary_respect ?? 5;
  const intent = rifProfile?.intent_clarity ?? 5;

  // Pacing
  const pacingScore = typeof pacing === 'number' ? pacing : (pacing === 'slow' ? 3 : pacing === 'fast' ? 8 : 5);
  dims.push({
    key: 'pacing',
    label: 'Your Pace',
    icon: <Calendar className="h-4 w-4" />,
    value: pacingScore,
    description: pacingScore <= 3 ? 'You move slowly and intentionally — we’ll respect that.' :
                 pacingScore >= 8 ? 'You’re ready to dive in — we’ll keep momentum.' :
                 'You like a steady, comfortable pace — we match that energy.',
  });

  // Emotional readiness
  dims.push({
    key: 'emotional',
    label: 'Emotional Readiness',
    icon: <Heart className="h-4 w-4" />,
    value: emotional,
    description: emotional >= 7 ? 'High emotional availability — great foundation.' :
                 emotional >= 5 ? 'Open and building — we’ll support your journey.' :
                 'Still finding your footing — we’ll take it easy.',
  });

  // Intent
  dims.push({
    key: 'intent',
    label: 'Intent Clarity',
    icon: <Sparkles className="h-4 w-4" />,
    value: intent,
    description: intent >= 7 ? 'You know what you’re looking for — that focus helps us match better.' :
                 intent >= 5 ? 'Exploring with an open mind — we like that.' :
                 'Still clarifying — totally fine, we’ll help.',
  });

  // Boundary respect
  dims.push({
    key: 'boundary',
    label: 'Boundary Comfort',
    icon: <Shield className="h-4 w-4" />,
    value: boundary,
    description: boundary >= 7 ? 'You communicate limits clearly — your matches will know where you stand.' :
                 'You’re learning to voice your needs — we only suggest people who listen.',
  });

  return dims;
}

function RIFBar({ value, color = 'bg-primary' }: { value: number; color?: string }) {
  const pct = Math.round((Math.min(10, Math.max(0, value)) / 10) * 100);
  return (
    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      />
    </div>
  );
}

export const RIFComplete: React.FC<RIFCompleteProps> = ({ onContinueToProfile, onSkipProfile, quizAnswers }) => {
  const { rifProfile } = useRIF();
  const dims = deriveRIFSummary(rifProfile, quizAnswers);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[420px] bg-card rounded-2xl p-8 shadow-lg"
      >
        <OnboardingProgressDots currentStep={11} totalSteps={11} />

        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-16 h-16 rounded-full border-2 border-accent flex items-center justify-center mx-auto mb-4 bg-gradient-to-br from-card to-muted"
          >
            <span className="text-[28px]">✦</span>
          </motion.div>
          <h2 className="font-serif text-[26px] font-normal text-foreground mb-1.5 leading-tight">
            Here’s what we learned.
          </h2>
          <p className="text-sm text-muted-foreground font-light leading-relaxed">
            Your Relational Intelligence profile shapes every introduction we make.
          </p>
        </div>

        {/* RIF dimension cards */}
        <div className="space-y-3 mb-6">
          {dims.map((dim, i) => (
            <motion.div
              key={dim.key}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + i * 0.1 }}
              className="bg-muted/40 rounded-xl p-3.5"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-foreground">
                  <span className="text-primary">{dim.icon}</span>
                  <span className="text-sm font-semibold">{dim.label}</span>
                </div>
                <span className="text-xs text-muted-foreground">{dim.value}/10</span>
              </div>
              <RIFBar value={dim.value} />
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{dim.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Sunday preview teaser */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85 }}
          className="bg-primary/8 border border-primary/20 rounded-xl p-3.5 mb-6 flex items-start gap-3"
        >
          <Zap className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-foreground mb-0.5">Your first Sunday is coming.</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every Sunday, 3 people — chosen specifically for your profile above. No swiping. No inbox overload.
            </p>
          </div>
        </motion.div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={onContinueToProfile}
            className="w-full rounded-full py-4 uppercase tracking-[0.12em] text-[13px] font-medium"
            size="lg"
          >
            <UserCircle className="mr-2 h-5 w-5" />
            Complete My Profile
          </Button>

          <Button
            onClick={onSkipProfile}
            variant="outline"
            className="w-full rounded-full py-4 uppercase tracking-wider text-xs"
            size="lg"
          >
            Skip for Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
            A complete profile helps us find better matches. You can always finish later.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
