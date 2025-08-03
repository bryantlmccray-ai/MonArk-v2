
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
        return <MessageCircle className="h-5 w-5 text-blue-400" />;
      case 'clarity':
        return <Heart className="h-5 w-5 text-rose-400" />;
      case 'pacing':
        return <Clock className="h-5 w-5 text-emerald-400" />;
      case 'graceful_exit':
        return <X className="h-5 w-5 text-amber-400" />;
      default:
        return <MessageCircle className="h-5 w-5 text-blue-400" />;
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
      <DialogContent className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 shadow-2xl max-w-md backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3 text-slate-100 font-light text-xl tracking-wide">
            {getNudgeIcon(nudgePrompt.nudge_type)}
            <span>Conversation Helper</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8">
          <p className="text-slate-300 text-sm leading-relaxed font-light">
            {nudgePrompt.prompt_text}
          </p>

          {responseOptions.length > 0 && (
            <div className="space-y-6">
              <h4 className="text-sm font-medium text-slate-200 tracking-wide">Suggested responses:</h4>
              <div className="space-y-3">
                {responseOptions.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedResponse(option)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-300 ${
                      selectedResponse === option
                        ? 'border-amber-500/50 bg-amber-500/10 text-amber-300 shadow-lg backdrop-blur-sm'
                        : 'border-slate-700/50 bg-slate-800/40 hover:border-slate-600/50 hover:bg-slate-700/40 text-slate-300 backdrop-blur-sm'
                    }`}
                  >
                    <p className="text-sm font-light leading-relaxed">{option}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-slate-200 tracking-wide">Or write your own:</h4>
            <Textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Type your own message..."
              className="bg-slate-800/40 border-slate-700/50 text-slate-300 placeholder-slate-500 min-h-[80px] rounded-xl focus:border-amber-500/50 focus:ring-amber-500/20 backdrop-blur-sm"
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <Button
              onClick={handleUseResponse}
              disabled={!customMessage && !selectedResponse}
              className="flex-1 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-slate-900 font-medium shadow-lg tracking-wide"
            >
              Use This Message
            </Button>
            <Button
              onClick={handleDismiss}
              variant="outline" 
              className="border-slate-600 text-slate-300 bg-slate-800/50 hover:bg-slate-700/50 font-medium tracking-wide"
            >
              Not Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
