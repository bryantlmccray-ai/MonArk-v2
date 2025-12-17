import React from 'react';
import { MonArkLogo } from '@/components/MonArkLogo';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface OnboardingWelcomeProps {
  onNext: () => void;
}

export const OnboardingWelcome: React.FC<OnboardingWelcomeProps> = ({ onNext }) => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full text-center space-y-8"
      >
        <MonArkLogo size="lg" animated={true} className="mx-auto" />
        
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-4xl font-semibold text-foreground">
            Welcome to MonArk
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            We're different. Instead of endless swiping, we send you <span className="text-foreground font-medium">3 curated matches</span> every week.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <Button 
            onClick={onNext}
            className="w-full py-6 text-lg font-medium"
            size="lg"
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};
