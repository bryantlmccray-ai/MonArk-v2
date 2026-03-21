import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { OnboardingProgressDots } from './OnboardingProgressDots';

interface RIFIntroProps {
  onNext: () => void;
  onBack: () => void;
}

const dimensions = [
  ['Intent Clarity', "What you're looking for"],
  ['Emotional Readiness', 'Where you are right now'],
  ['Pacing Preference', 'How fast you move'],
  ['Boundary Respect', 'What you need honored'],
  ['Post-Date Alignment', 'How you process connection'],
];

export const RIFIntro: React.FC<RIFIntroProps> = ({ onNext, onBack }) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[420px] bg-card rounded-2xl p-10 shadow-lg"
      >
        <OnboardingProgressDots currentStep={3} totalSteps={11} />

        <div className="text-center">
          {/* RIF icon */}
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6">
            <span className="text-[22px]">◎</span>
          </div>

          <h2 className="font-serif text-2xl font-normal text-foreground mb-2.5 leading-tight">
            Your Relational Intelligence.
          </h2>
          <p className="text-sm text-muted-foreground font-light leading-relaxed mb-7">
            The RIF Quiz takes about 4 minutes. It maps how you connect — your pacing, your
            boundaries, your emotional readiness. This is what makes your matches feel different.
          </p>
        </div>

        {/* Dimension breakdown */}
        <div className="bg-muted/40 rounded-xl p-5 mb-8">
          {dimensions.map(([dim, desc], i) => (
            <div
              key={dim}
              className={`flex justify-between items-start ${i < dimensions.length - 1 ? 'mb-2.5' : ''}`}
            >
              <span className="text-[13px] font-medium text-foreground">{dim}</span>
              <span className="text-xs text-muted-foreground text-right max-w-[45%]">{desc}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Button onClick={onBack} variant="outline" className="rounded-full uppercase tracking-wider text-xs">
            Back
          </Button>
          <Button onClick={onNext} className="flex-1 rounded-full uppercase tracking-[0.12em] text-xs py-4">
            Take the RIF Quiz
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
