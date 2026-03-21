import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Users, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { OnboardingProgressDots } from './OnboardingProgressDots';

interface OnboardingDifferenceProps {
  onNext: () => void;
  onBack: () => void;
}

const features = [
  {
    icon: Sparkles,
    title: 'Smart Matching',
    description: 'We match on how you communicate and connect, not just demographics.',
  },
  {
    icon: Users,
    title: 'Quality Over Quantity',
    description: '3 curated matches weekly beats endless swiping every time.',
  },
  {
    icon: Heart,
    title: 'Intentional Dating',
    description: 'Every match comes with a thoughtful date suggestion.',
  },
];

export const OnboardingDifference: React.FC<OnboardingDifferenceProps> = ({ onNext, onBack }) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[420px] bg-card rounded-2xl p-10 shadow-lg"
      >
        <OnboardingProgressDots currentStep={2} totalSteps={11} />

        <div className="text-center mb-6">
          <h2 className="font-serif text-2xl font-normal text-foreground mb-2.5 leading-tight">
            Why MonArk is Different
          </h2>
          <p className="text-sm text-muted-foreground font-light leading-relaxed">
            To make sure your 3 are actually a fit, we need to understand you beyond photos and bio.
          </p>
        </div>

        <div className="space-y-3 mb-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1, duration: 0.4 }}
              className="flex items-start gap-3.5 p-4 rounded-xl bg-muted/30 border border-border/50 text-left"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground text-sm">{feature.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex gap-3">
          <Button onClick={onBack} variant="outline" className="rounded-full uppercase tracking-wider text-xs">
            Back
          </Button>
          <Button onClick={onNext} className="flex-1 rounded-full uppercase tracking-[0.12em] text-xs py-4">
            Continue
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
