
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Heart, MessageCircle, Clock, X } from 'lucide-react';
import { NudgePrompt } from '@/hooks/useConversationNudges';

interface ConversationNudgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  nudgePrompt: NudgePrompt;
  onUseResponse: (response: string) => void;
  onDismiss: () => void;
}

export const ConversationNudgeModal: React.FC<ConversationNudgeModalProps> = ({
  isOpen,
  onClose,
  nudgePrompt,
  onUseResponse,
  onDismiss
}) => {
  const [customMessage, setCustomMessage] = useState('');
  const [selectedResponse, setSelectedResponse] = useState<string>('');

  const getNudgeIcon = (type: string) => {
    switch (type) {
      case 'meaningful_question':
        return <MessageCircle className="h-5 w-5 text-monark-copper" />;
      case 'clarity':
        return <Heart className="h-5 w-5 text-monark-coral" />;
      case 'pacing':
        return <Clock className="h-5 w-5 text-monark-brass" />;
      case 'graceful_exit':
        return <X className="h-5 w-5 text-monark-sage" />;
      default:
        return <MessageCircle className="h-5 w-5 text-monark-copper" />;
    }
  };

  const handleUseResponse = () => {
    const messageToSend = customMessage || selectedResponse;
    if (messageToSend) {
      onUseResponse(messageToSend);
      onClose();
      setCustomMessage('');
      setSelectedResponse('');
    }
  };

  const handleDismiss = () => {
    onDismiss();
    onClose();
    setCustomMessage('');
    setSelectedResponse('');
  };

  const responseOptions = Array.isArray(nudgePrompt.response_options) 
    ? nudgePrompt.response_options 
    : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-monark-ivory border border-monark-navy/10 text-monark-navy max-w-md soft-shadow animate-slide-up">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3 text-monark-navy font-primary font-medium">
            {getNudgeIcon(nudgePrompt.nudge_type)}
            <span>Conversation Helper</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <p className="text-monark-navy/80 text-sm leading-relaxed font-primary">
            {nudgePrompt.prompt_text}
          </p>

          {responseOptions.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-monark-copper font-primary">Suggested responses:</h4>
              <div className="space-y-3">
                {responseOptions.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedResponse(option)}
                    className={`w-full text-left p-4 rounded-monark border transition-all duration-300 ${
                      selectedResponse === option
                        ? 'border-monark-copper bg-monark-copper/10 text-monark-copper gentle-glow'
                        : 'border-monark-navy/20 bg-monark-ivory hover:border-monark-lavender/50 hover:bg-monark-lavender/5'
                    }`}
                  >
                    <p className="text-sm font-primary">{option}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-monark-copper font-primary">Or write your own:</h4>
            <Textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Type your own message..."
              className="bg-monark-ivory border-monark-navy/20 text-monark-navy placeholder-monark-navy/50 min-h-[80px] rounded-monark focus:border-monark-copper focus:ring-monark-copper/20 font-reflection"
            />
          </div>

          <div className="flex space-x-4 pt-2">
            <Button
              onClick={handleUseResponse}
              disabled={!customMessage && !selectedResponse}
              className="flex-1 monark-button monark-button-primary font-primary transition-all duration-300 hover:gentle-glow"
            >
              Use This Message
            </Button>
            <Button
              onClick={handleDismiss}
              variant="outline" 
              className="border-goldenrod/40 text-goldenrod bg-goldenrod/10 hover:bg-goldenrod/20 hover:border-goldenrod hover:text-goldenrod font-primary transition-all duration-300 backdrop-blur-sm"
            >
              Not Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
