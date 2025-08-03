
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HelpCircle, MessageCircle, X, Clock, Heart } from 'lucide-react';
import { ConversationNudgeModal } from './ConversationNudgeModal';
import { GracefulExitModal } from './GracefulExitModal';
import { useConversationNudges } from '@/hooks/useConversationNudges';

interface ConversationHelperProps {
  conversationId: string;
  matchName?: string;
  onSendMessage?: (message: string) => void;
  onEndConversation?: (message: string, reason?: string) => void;
  className?: string;
}

export const ConversationHelper: React.FC<ConversationHelperProps> = ({
  conversationId,
  matchName,
  onSendMessage,
  onEndConversation,
  className = ''
}) => {
  const {
    getNudgesForContext,
    shouldShowNudge,
    recordNudgeInteraction,
    handleGracefulExit
  } = useConversationNudges();

  const [showNudgeModal, setShowNudgeModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [selectedNudge, setSelectedNudge] = useState<any>(null);
  const [showAutoNudge, setShowAutoNudge] = useState(false);

  // Check for automatic nudges
  useEffect(() => {
    const nudgeCheck = shouldShowNudge(conversationId);
    if (nudgeCheck.show && !showAutoNudge) {
      const contextNudges = getNudgesForContext(nudgeCheck.context, nudgeCheck.type);
      if (contextNudges.length > 0) {
        setSelectedNudge(contextNudges[0]);
        setShowAutoNudge(true);
        recordNudgeInteraction(conversationId, nudgeCheck.type, 'triggered');
      }
    }
  }, [conversationId]);

  const handleNudgeHelp = (type: string, context: string) => {
    const nudges = getNudgesForContext(context, type);
    if (nudges.length > 0) {
      setSelectedNudge(nudges[0]);
      setShowNudgeModal(true);
      recordNudgeInteraction(conversationId, type, 'triggered');
    }
  };

  const handleUseNudgeResponse = (response: string) => {
    if (onSendMessage) {
      onSendMessage(response);
    }
    if (selectedNudge) {
      recordNudgeInteraction(conversationId, selectedNudge.nudge_type, 'used', response);
    }
    setShowNudgeModal(false);
    setShowAutoNudge(false);
  };

  const handleDismissNudge = () => {
    if (selectedNudge) {
      recordNudgeInteraction(conversationId, selectedNudge.nudge_type, 'dismissed');
    }
    setShowNudgeModal(false);
    setShowAutoNudge(false);
  };

  const handleGracefulExitConfirm = async (message: string, reason?: string) => {
    await handleGracefulExit(conversationId, message, reason);
    if (onEndConversation) {
      onEndConversation(message, reason);
    }
    setShowExitModal(false);
  };

  const helperOptions = [
    {
      id: 'meaningful_question',
      icon: <MessageCircle className="h-4 w-4" />,
      label: 'Ask a meaningful question',
      description: 'Get help starting deeper conversation',
      action: () => handleNudgeHelp('meaningful_question', 'low_engagement')
    },
    {
      id: 'clarity',
      icon: <Heart className="h-4 w-4" />,
      label: 'Check in about connection',
      description: 'Clarify where things are going',
      action: () => handleNudgeHelp('clarity', 'unclear_intent')
    },
    {
      id: 'pacing',
      icon: <Clock className="h-4 w-4" />,
      label: 'Adjust conversation pace',
      description: 'Address timing or energy mismatch',
      action: () => handleNudgeHelp('pacing', 'mismatched_energy')
    },
    {
      id: 'graceful_exit',
      icon: <X className="h-4 w-4" />,
      label: 'End conversation kindly',
      description: 'Close this chat respectfully',
      action: () => setShowExitModal(true)
    }
  ];

  return (
    <>
      <div className={`relative ${className}`}>
        {/* Auto-nudge notification */}
        {showAutoNudge && selectedNudge && (
          <div className="absolute -top-2 -right-2 w-3 h-3 bg-goldenrod rounded-full animate-pulse" />
        )}

        <Popover>
          <PopoverTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className={`bg-charcoal-gray/80 border-gray-700 text-gray-300 hover:bg-goldenrod/20 hover:border-goldenrod/50 hover:text-goldenrod transition-all ${
                showAutoNudge ? 'border-goldenrod/70 shadow-lg shadow-goldenrod/20' : ''
              }`}
            >
              <HelpCircle className="h-4 w-4 mr-1" />
              <span className="font-semibold">Need help?</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-80 bg-white border border-gray-300 text-gray-900 shadow-lg z-50"
            align="end"
          >
            <div className="space-y-3">
              <div className="text-sm font-medium text-gray-900">Conversation Helper</div>
              <p className="text-xs text-gray-600">
                Get gentle suggestions to improve your conversation
              </p>
              
              <div className="space-y-2">
                {helperOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={option.action}
                    className="w-full flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors text-left"
                  >
                    <div className="text-blue-600 mt-0.5">
                      {option.icon}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {option.label}
                      </div>
                      <div className="text-xs text-gray-600">
                        {option.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Auto-nudge modal */}
      {showAutoNudge && selectedNudge && (
        <ConversationNudgeModal
          isOpen={showAutoNudge}
          onClose={() => setShowAutoNudge(false)}
          nudgePrompt={selectedNudge}
          onUseResponse={handleUseNudgeResponse}
          onDismiss={handleDismissNudge}
        />
      )}

      {/* Manual nudge modal */}
      {showNudgeModal && selectedNudge && (
        <ConversationNudgeModal
          isOpen={showNudgeModal}
          onClose={() => setShowNudgeModal(false)}
          nudgePrompt={selectedNudge}
          onUseResponse={handleUseNudgeResponse}
          onDismiss={handleDismissNudge}
        />
      )}

      {/* Graceful exit modal */}
      <GracefulExitModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        onConfirmExit={handleGracefulExitConfirm}
        matchName={matchName}
      />
    </>
  );
};
