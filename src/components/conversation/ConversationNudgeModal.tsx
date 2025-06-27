
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
        return <Heart className="h-5 w-5 text-purple-400" />;
      case 'pacing':
        return <Clock className="h-5 w-5 text-orange-400" />;
      case 'graceful_exit':
        return <X className="h-5 w-5 text-red-400" />;
      default:
        return <MessageCircle className="h-5 w-5 text-goldenrod" />;
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
      <DialogContent className="bg-charcoal-gray border border-gray-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-white">
            {getNudgeIcon(nudgePrompt.nudge_type)}
            <span>Conversation Helper</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-gray-300 text-sm leading-relaxed">
            {nudgePrompt.prompt_text}
          </p>

          {responseOptions.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-goldenrod">Suggested responses:</h4>
              <div className="space-y-2">
                {responseOptions.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedResponse(option)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedResponse === option
                        ? 'border-goldenrod bg-goldenrod/10 text-goldenrod'
                        : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600'
                    }`}
                  >
                    <p className="text-sm">{option}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-goldenrod">Or write your own:</h4>
            <Textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Type your own message..."
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 min-h-[80px]"
            />
          </div>

          <div className="flex space-x-3 pt-2">
            <Button
              onClick={handleUseResponse}
              disabled={!customMessage && !selectedResponse}
              className="flex-1 bg-goldenrod hover:bg-goldenrod/90 text-jet-black font-medium"
            >
              Use This Message
            </Button>
            <Button
              onClick={handleDismiss}
              variant="outline" 
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Not Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
