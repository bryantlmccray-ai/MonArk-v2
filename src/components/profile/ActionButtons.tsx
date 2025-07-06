import React from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import { useCompatibilityScoring } from '@/hooks/useCompatibilityScoring';
import { useMatching } from '@/hooks/useMatching';

interface ActionButtonsProps {
  userId: string;
  isVeryHighlighted?: boolean;
  onInteraction?: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  userId,
  isVeryHighlighted,
  onInteraction
}) => {
  const { submitFeedback } = useCompatibilityScoring();
  const { likeUser, startConversation } = useMatching();

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await likeUser(userId);
    if (success) {
      await submitFeedback({
        target_user_id: userId,
        interaction_type: 'like',
        feedback_score: 8,
        interaction_context: 'profile_discovery'
      });
      onInteraction?.();
    }
  };

  const handleMessage = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const conversationId = await startConversation(userId);
    if (conversationId) {
      await submitFeedback({
        target_user_id: userId,
        interaction_type: 'message',
        feedback_score: 9,
        interaction_context: 'direct_message'
      });
      onInteraction?.();
    }
  };

  return (
    <div className="flex gap-1 pt-1">
      <button 
        onClick={handleLike}
        className={`flex-1 py-1.5 px-2 font-medium rounded text-xs transition-all duration-200 flex items-center justify-center gap-1 ${
          isVeryHighlighted
            ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg hover:shadow-xl transform hover:scale-105'
            : 'bg-primary text-primary-foreground hover:bg-primary/90'
        }`}
      >
        <Heart className={`h-3 w-3 ${
          isVeryHighlighted ? 'animate-pulse' : ''
        }`} />
        Like
      </button>
      <button 
        onClick={handleMessage}
        className={`flex-1 py-1.5 px-2 font-medium rounded text-xs transition-all duration-200 flex items-center justify-center gap-1 ${
          isVeryHighlighted
            ? 'bg-accent text-accent-foreground hover:bg-accent/90 shadow-md hover:shadow-lg'
            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
        }`}
      >
        <MessageCircle className="h-3 w-3" />
        Chat
      </button>
    </div>
  );
};