import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Calendar, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { MonArkLogo } from '@/components/MonArkLogo';

interface RIFCompleteProps {
  onComplete: () => void;
}

export const RIFComplete: React.FC<RIFCompleteProps> = ({ onComplete }) => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center space-y-8"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center"
        >
          <CheckCircle2 className="h-12 w-12 text-green-500" />
        </motion.div>

        <div className="space-y-4">
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">
            Perfect!
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Your RIF is complete. We'll use your responses to find matches who fit your style—not just your type.
          </p>
        </div>

        {/* Your 3 Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="bg-card border border-border rounded-xl p-6 space-y-4"
        >
          <div className="flex items-center justify-center gap-3">
            <Calendar className="h-6 w-6 text-primary" />
            <span className="font-semibold text-foreground text-lg">Your First 3</span>
          </div>
          
          <p className="text-muted-foreground">
            Arrive <span className="text-foreground font-medium">Sunday at 9 AM</span>
          </p>
          
          <div className="flex justify-center gap-2">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6 + i * 0.1, type: "spring" }}
                className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center"
              >
                <span className="text-primary font-semibold">{i}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
        >
          <Button 
            onClick={onComplete}
            className="w-full py-6 text-lg font-medium"
            size="lg"
          >
            Enter MonArk
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.4 }}
        >
          <MonArkLogo size="sm" variant="compact" className="mx-auto opacity-50" />
        </motion.div>
      </motion.div>
    </div>
  );
};
