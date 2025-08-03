
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
      <DialogContent className="bg-white border border-gray-300 text-gray-900 max-w-md shadow-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3 text-gray-900 font-semibold">
            {getNudgeIcon(nudgePrompt.nudge_type)}
            <span>Conversation Helper</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <p className="text-gray-700 text-sm leading-relaxed">
            {nudgePrompt.prompt_text}
          </p>

          {responseOptions.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900">Suggested responses:</h4>
              <div className="space-y-3">
                {responseOptions.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedResponse(option)}
                    className={`w-full text-left p-4 rounded-lg border transition-all duration-300 ${
                      selectedResponse === option
                        ? 'border-blue-600 bg-blue-50 text-blue-900'
                        : 'border-gray-300 bg-white hover:border-blue-300 hover:bg-blue-25'
                    }`}
                  >
                    <p className="text-sm">{option}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900">Or write your own:</h4>
            <Textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Type your own message..."
              className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 min-h-[80px] rounded-lg focus:border-blue-500 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex space-x-4 pt-2">
            <Button
              onClick={handleUseResponse}
              disabled={!customMessage && !selectedResponse}
              className="flex-1 bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300"
            >
              Use This Message
            </Button>
            <Button
              onClick={handleDismiss}
              variant="outline" 
              className="border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
            >
              Not Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
