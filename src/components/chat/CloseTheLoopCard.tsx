import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Meh, 
  X, 
  Coffee, 
  MessageCircle, 
  Sparkles,
  CheckCircle2,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface CloseTheLoopCardProps {
  matchName: string;
  onAdvance?: (suggestion: string) => void;
  onClose?: (message: string) => void;
  onDismiss?: () => void;
}

type FeelingType = 'great' | 'neutral' | 'not-a-fit' | null;

const FEELING_OPTIONS = [
  { 
    id: 'great' as const, 
    label: 'Great energy', 
    icon: Heart, 
    iconClass: 'text-rosegold-deep',
    btnClass: 'bg-secondary border-2 border-border hover:border-rosegold-deep/40 hover:shadow-md'
  },
  { 
    id: 'neutral' as const, 
    label: 'Neutral', 
    icon: Meh, 
    iconClass: 'text-gold-dark',
    btnClass: 'bg-secondary border-2 border-border hover:border-goldenrod/40 hover:shadow-md'
  },
  { 
    id: 'not-a-fit' as const, 
    label: 'Not a fit', 
    icon: X, 
    iconClass: 'text-destructive',
    btnClass: 'bg-secondary border-2 border-border hover:border-destructive/40 hover:shadow-md'
  }
];

const NEXT_STEP_SUGGESTIONS = [
  { icon: Coffee, text: 'Coffee Sunday 11:00?' },
  { icon: MessageCircle, text: 'Call this week?' },
  { icon: Sparkles, text: 'Dinner Friday?' }
];

export const CloseTheLoopCard: React.FC<CloseTheLoopCardProps> = ({
  matchName,
  onAdvance,
  onClose,
  onDismiss
}) => {
  const [feeling, setFeeling] = useState<FeelingType>(null);
  const [step, setStep] = useState<'feeling' | 'action' | 'done'>('feeling');
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const handleFeelingSelect = (selectedFeeling: FeelingType) => {
    setFeeling(selectedFeeling);
    setStep('action');
  };

  const handleAdvance = (suggestion: string) => {
    setSelectedAction(suggestion);
    setStep('done');
    onAdvance?.(suggestion);
  };

  const handleGracefulClose = () => {
    const message = `Thanks for meeting up! Wishing you the best.`;
    setSelectedAction(message);
    setStep('done');
    onClose?.(message);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className="my-4"
    >
      <Card className="bg-card border-2 border-border shadow-elevated overflow-hidden rounded-2xl">
        {/* Anti-Ghosting Badge Header */}
        <div className="px-4 py-3 bg-secondary border-b-2 border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-foreground" />
            <span className="text-xs font-semibold text-foreground tracking-wide uppercase">Anti-Ghosting</span>
            <span className="text-[10px] font-medium text-muted-foreground bg-card border border-border rounded-full px-2 py-0.5">
              Close the Loop
            </span>
          </div>
          {onDismiss && step !== 'done' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-6 w-6 p-0 text-foreground/60 hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        <div className="p-5">
          <AnimatePresence mode="wait">
            {/* Step 1: How did it feel? */}
            {step === 'feeling' && (
              <motion.div
                key="feeling"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-5"
              >
                <div className="text-center">
                  <h4 className="text-foreground font-semibold text-lg">How did it feel?</h4>
                  <p className="text-foreground/60 text-sm mt-1 font-medium">
                    After meeting {matchName}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {FEELING_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    return (
                      <motion.button
                        key={option.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleFeelingSelect(option.id)}
                        className={`flex flex-col items-center gap-2.5 p-4 rounded-xl transition-all ${option.btnClass}`}
                      >
                        <Icon className={`h-6 w-6 ${option.iconClass}`} />
                        <span className="text-xs font-semibold text-foreground">
                          {option.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 2: Action prompts based on feeling */}
            {step === 'action' && (
              <motion.div
                key="action"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {(feeling === 'great' || feeling === 'neutral') ? (
                  <>
                    <div className="text-center">
                      <h4 className="text-foreground font-semibold text-base">
                        {feeling === 'great' ? 'Great! Take the next step' : 'Want to explore further?'}
                      </h4>
                      <p className="text-foreground/60 text-sm mt-1 font-medium">
                        Quick suggestions to keep the momentum
                      </p>
                    </div>

                    <div className="space-y-2">
                      {NEXT_STEP_SUGGESTIONS.map((suggestion, index) => {
                        const Icon = suggestion.icon;
                        return (
                          <motion.button
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.01, x: 4 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => handleAdvance(suggestion.text)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl bg-secondary border-2 border-border hover:border-primary/30 hover:shadow-md transition-all text-left"
                          >
                            <div className="p-2 rounded-full bg-card border border-border">
                              <Icon className="h-4 w-4 text-foreground" />
                            </div>
                            <span className="text-foreground font-semibold text-sm">{suggestion.text}</span>
                          </motion.button>
                        );
                      })}
                    </div>

                    {feeling === 'neutral' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleGracefulClose}
                        className="w-full text-foreground/60 hover:text-foreground font-medium"
                      >
                        Or close kindly instead
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <div className="text-center">
                      <h4 className="text-foreground font-semibold text-base">Close kindly</h4>
                      <p className="text-foreground/60 text-sm mt-1 font-medium">
                        End gracefully — no awkward drift
                      </p>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={handleGracefulClose}
                      className="w-full flex items-center gap-3 p-4 rounded-xl bg-secondary border-2 border-border hover:border-destructive/30 hover:shadow-md transition-all text-left"
                    >
                      <div className="p-2 rounded-full bg-card border border-border">
                        <MessageCircle className="h-4 w-4 text-destructive" />
                      </div>
                      <div>
                        <span className="text-foreground font-semibold text-sm block">
                          Thanks for meeting, not a match.
                        </span>
                        <span className="text-foreground/60 text-xs font-medium">
                          Sends a warm, respectful close
                        </span>
                      </div>
                    </motion.button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setStep('feeling')}
                      className="w-full text-foreground/60 hover:text-foreground font-medium"
                    >
                      ← Go back
                    </Button>
                  </>
                )}
              </motion.div>
            )}

            {/* Step 3: Done confirmation */}
            {step === 'done' && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4 space-y-3"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                >
                  <CheckCircle2 className="h-12 w-12 text-primary mx-auto" />
                </motion.div>
                <div>
                  <h4 className="text-foreground font-semibold text-base">Loop closed!</h4>
                  <p className="text-foreground/60 text-sm mt-1 font-medium">
                    {feeling === 'not-a-fit' 
                      ? 'Respectfully ended — no ghosting here'
                      : 'Message queued — momentum maintained'
                    }
                  </p>
                </div>
                {selectedAction && feeling !== 'not-a-fit' && (
                  <div className="bg-secondary border-2 border-border rounded-xl p-3 mt-3">
                    <p className="text-sm text-foreground font-medium">"{selectedAction}"</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  );
};
