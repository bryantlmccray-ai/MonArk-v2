import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Sparkles, Calendar } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MutualMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchName: string;
  matchPhoto?: string;
  onStartChat: () => void;
  onPlanDate?: () => void;
}

export const MutualMatchModal = ({
  isOpen,
  onClose,
  matchName,
  matchPhoto,
  onStartChat,
  onPlanDate
}: MutualMatchModalProps) => {
  useEffect(() => {
    if (isOpen) {
      // Trigger confetti celebration
      const duration = 2000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#ff69b4', '#ff1493', '#db7093']
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#ff69b4', '#ff1493', '#db7093']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      
      frame();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm text-center p-8">
        {/* Hearts animation container */}
        <div className="relative mb-6">
          <div className="w-32 h-32 mx-auto relative">
            {/* Match photo */}
            <div className="absolute inset-0 rounded-full overflow-hidden border-4 border-pink-500 shadow-lg shadow-pink-500/30">
              <img
                src={matchPhoto || '/placeholder.svg'}
                alt={matchName}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Floating hearts */}
            <div className="absolute -top-2 -right-2 animate-bounce">
              <Heart className="w-8 h-8 text-pink-500 fill-pink-500" />
            </div>
            <div className="absolute -bottom-1 -left-3 animate-bounce delay-100">
              <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-pink-500/20 to-rose-500/20 text-pink-600">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">It's a Match!</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            You and {matchName} liked each other!
          </h2>
          <p className="text-muted-foreground">
            Your conversation is now unlocked. Say hello and see where it goes!
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            size="lg"
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
            onClick={onStartChat}
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Start Chatting
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="w-full"
            onClick={onClose}
          >
            Keep Browsing
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};