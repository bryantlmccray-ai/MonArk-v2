import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface RIFIntroProps {
  onNext: () => void;
  onBack: () => void;
}

export const RIFIntro: React.FC<RIFIntroProps> = ({ onNext, onBack }) => {
  return (
    <div className="min-h-screen bg-background flex flex-col p-6">
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-8 w-full"
        >
          {/* RIF Badge */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center"
          >
            <Sparkles className="h-10 w-10 text-primary" />
          </motion.div>

          <div className="space-y-4">
            <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">
              Complete the RIF
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Our <span className="text-foreground font-medium">Relational Intelligence Form</span> goes beyond 
              demographics to understand how you communicate, connect, and date.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="bg-card border border-border rounded-xl p-6 space-y-4"
          >
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Clock className="h-5 w-5" />
              <span className="font-medium">Takes about 5 minutes</span>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-2">Your answers power:</p>
              <ul className="space-y-1 text-left">
                <li>• Who shows up in Your 3 each week</li>
                <li>• Date suggestions that match your style</li>
                <li>• Better conversations from the start</li>
              </ul>
            </div>
          </motion.div>
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
          Start the RIF
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
