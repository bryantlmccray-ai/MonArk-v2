import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Calendar, Sparkles, MessageCircle, Settings, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { MonArkLogo } from '@/components/MonArkLogo';

interface ProfileCompleteScreenProps {
  onContinue: () => void;
  userName?: string;
}

export const ProfileCompleteScreen: React.FC<ProfileCompleteScreenProps> = ({ onContinue, userName }) => {
  const firstName = userName ? userName.split(' ')[0] : '';

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center space-y-8"
      >
        {/* Success Icon with Glow */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="relative mx-auto"
        >
          <div className="absolute inset-0 w-24 h-24 mx-auto bg-gradient-to-r from-primary/30 via-primary/20 to-primary/30 rounded-full blur-xl animate-gentle-pulse" />
          <div className="relative w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="h-12 w-12 text-primary" />
          </div>
        </motion.div>

        {/* Welcome Message */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="space-y-3"
        >
          <h1 className="text-2xl sm:text-3xl font-serif text-foreground">
            You're All Set{firstName ? `, ${firstName}` : ''}!
          </h1>
          <p className="text-muted-foreground font-body leading-relaxed">
            Your profile is complete. Now the magic begins.
          </p>
        </motion.div>

        {/* Matches Arrival Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-2xl blur-lg opacity-60" />
          <div className="relative bg-card border border-border rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Calendar className="h-6 w-6 text-primary" />
              <span className="font-serif text-foreground text-lg">Your First 3 Matches</span>
            </div>
            
            <p className="text-muted-foreground font-body">
              Arrive <span className="text-foreground font-medium">Sunday at 9 AM</span>
            </p>
            
            <div className="flex justify-center gap-3 pt-2">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7 + i * 0.1, type: "spring" }}
                  className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30"
                >
                  <span className="text-primary font-semibold">{i}</span>
                </motion.div>
              ))}
            </div>

            <p className="text-sm text-muted-foreground font-body italic pt-2">
              Hand-picked based on your RIF responses
            </p>
          </div>
        </motion.div>

        {/* What You Can Do Now */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="space-y-4"
        >
          <p className="text-sm text-muted-foreground font-body uppercase tracking-wider">
            While you wait
          </p>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center space-y-2">
              <div className="w-10 h-10 mx-auto rounded-full bg-muted/50 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground font-body">Explore the app</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-10 h-10 mx-auto rounded-full bg-muted/50 flex items-center justify-center">
                <Settings className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground font-body">Adjust preferences</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-10 h-10 mx-auto rounded-full bg-muted/50 flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground font-body">Chat with Ark AI</p>
            </div>
          </div>
        </motion.div>

        {/* Enter Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.4 }}
        >
          <Button 
            onClick={onContinue}
            className="w-full py-6 text-lg font-medium"
            size="lg"
          >
            Enter MonArk
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.4 }}
        >
          <MonArkLogo size="sm" variant="compact" className="mx-auto opacity-50" />
        </motion.div>
      </motion.div>
    </div>
  );
};
