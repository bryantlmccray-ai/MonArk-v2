import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Users, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

interface OnboardingDifferenceProps {
  onNext: () => void;
  onBack: () => void;
}

export const OnboardingDifference: React.FC<OnboardingDifferenceProps> = ({ onNext, onBack }) => {
  const features = [
    {
      icon: Sparkles,
      title: "Smart Matching",
      description: "We match on how you communicate and connect, not just demographics."
    },
    {
      icon: Users,
      title: "Quality Over Quantity",
      description: "3 curated matches weekly beats endless swiping every time."
    },
    {
      icon: Heart,
      title: "Intentional Dating",
      description: "Every match comes with a thoughtful date suggestion."
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col p-6">
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-8 w-full"
        >
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">
              Why MonArk is Different
            </h1>
            <p className="text-muted-foreground">
              To make sure your 3 are actually a fit, we need to understand you beyond photos and bio.
            </p>
          </div>

          <div className="space-y-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1, duration: 0.4 }}
                className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border text-left"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="max-w-md mx-auto w-full space-y-3"
      >
        <Button 
          onClick={onNext}
          className="w-full py-6 text-lg font-medium"
          size="lg"
        >
          Continue
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
        <Button 
          onClick={onBack}
          variant="ghost"
          className="w-full"
        >
          Back
        </Button>
      </motion.div>
    </div>
  );
};
