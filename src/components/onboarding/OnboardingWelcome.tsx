import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { OnboardingProgressDots } from './OnboardingProgressDots';

interface OnboardingWelcomeProps {
  onNext: () => void;
}

export const OnboardingWelcome: React.FC<OnboardingWelcomeProps> = ({ onNext }) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-[420px] bg-card rounded-2xl p-10 shadow-lg"
      >
        <OnboardingProgressDots currentStep={1} totalSteps={11} />

        <div className="text-center">
          {/* Monogram */}
          <div className="w-[72px] h-[72px] rounded-full border border-primary/40 flex items-center justify-center mx-auto mb-7 bg-card">
            <span className="font-serif text-[26px] text-accent tracking-tight">MA</span>
          </div>

          <h1 className="font-serif text-[32px] font-normal text-foreground mb-3 leading-tight tracking-tight">
            Welcome to MonArk.
          </h1>

          <p className="text-[15px] text-muted-foreground leading-relaxed mb-2 font-light">
            You're here because connection matters to you.
          </p>
          <p className="text-sm text-primary leading-relaxed mb-10">
            We don't do swiping. We don't do algorithms.<br />
            We do <em>intentional.</em>
          </p>

          <Button
            onClick={onNext}
            className="w-full rounded-full py-4 uppercase tracking-[0.12em] text-[13px] font-medium"
            size="lg"
          >
            Begin
          </Button>

          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/50 mt-6">
            MonArk · Date well.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
