import React from 'react';
import { Button } from '@/components/ui/button';
import { UserCircle, ArrowRight, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { OnboardingProgressDots } from './OnboardingProgressDots';

interface RIFCompleteProps {
  onContinueToProfile: () => void;
  onSkipProfile: () => void;
}

export const RIFComplete: React.FC<RIFCompleteProps> = ({ onContinueToProfile, onSkipProfile }) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[420px] bg-card rounded-2xl p-10 shadow-lg"
      >
        <OnboardingProgressDots currentStep={11} totalSteps={11} />

        <div className="text-center">
          {/* Success icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 rounded-full border-2 border-accent flex items-center justify-center mx-auto mb-7 bg-gradient-to-br from-card to-muted"
          >
            <span className="text-[32px]">✦</span>
          </motion.div>

          <h2 className="font-serif text-[28px] font-normal text-foreground mb-2.5 leading-tight">
            You're ready.
          </h2>

          <p className="text-sm text-muted-foreground font-light leading-relaxed mb-3">
            Every Monday, your three curated matches arrive.
          </p>
          <p className="text-[13px] text-accent leading-relaxed mb-8">
            No inbox to sort. No swiping to do.<br />
            Just three people, chosen with intention.
          </p>

          {/* Feature pills */}
          <div className="bg-muted/40 rounded-xl p-4 mb-8 flex gap-5 justify-center">
            {['Your 3', 'Discovery Map', 'Close the Loop'].map((label) => (
              <div key={label} className="text-center">
                <span className="font-serif text-[11px] text-primary tracking-wider italic">
                  {label}
                </span>
              </div>
            ))}
          </div>

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

            <div className="flex items-start gap-2 text-left p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                A complete profile helps us find better matches for you. You can always finish later.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
