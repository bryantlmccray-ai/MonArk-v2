import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Calendar, ArrowRight, UserCircle, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { MonArkLogo } from '@/components/MonArkLogo';

interface RIFCompleteProps {
  onContinueToProfile: () => void;
  onSkipProfile: () => void;
}

export const RIFComplete: React.FC<RIFCompleteProps> = ({ onContinueToProfile, onSkipProfile }) => {
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

        {/* Choice Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="space-y-4"
        >
          <p className="text-sm text-muted-foreground">
            What would you like to do next?
          </p>
          
          {/* Continue to Profile Button */}
          <Button 
            onClick={onContinueToProfile}
            className="w-full py-6 text-lg font-medium"
            size="lg"
          >
            <UserCircle className="mr-2 h-5 w-5" />
            Complete My Profile
          </Button>
          
          {/* Skip Button */}
          <Button 
            onClick={onSkipProfile}
            variant="outline"
            className="w-full py-5"
            size="lg"
          >
            Skip for Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          {/* Warning */}
          <div className="flex items-start gap-2 text-left p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              A complete profile helps us find better matches for you. You can always finish later.
            </p>
          </div>
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
