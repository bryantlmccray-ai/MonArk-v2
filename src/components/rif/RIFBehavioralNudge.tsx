
import React, { useState, useEffect } from 'react';
import { Clock, Heart, MessageCircle, Pause, X } from 'lucide-react';
import { useRIF } from '@/hooks/useRIF';

interface RIFBehavioralNudgeProps {
  type: 'conversation_pacing' | 'emotional_check' | 'boundary_reminder' | 'reflection_prompt';
  context?: {
    conversationDuration?: number;
    messageCount?: number;
    lastActivity?: Date;
  };
  onDismiss: () => void;
  onAction?: () => void;
}

export const RIFBehavioralNudge: React.FC<RIFBehavioralNudgeProps> = ({
  type,
  context,
  onDismiss,
  onAction
}) => {
  const { rifProfile, rifSettings, submitFeedback } = useRIF();
  const [showDetails, setShowDetails] = useState(false);

  if (!rifSettings?.rif_enabled || !rifProfile) {
    return null;
  }

  const getNudgeContent = () => {
    switch (type) {
      case 'conversation_pacing':
        return {
          icon: Clock,
          title: 'Pacing Check-In',
          message: rifProfile.pacing_preferences <= 4 
            ? "You've been chatting actively. How does the pace feel right now?"
            : "This conversation is moving at a steady pace. How are you feeling about it?",
          color: 'text-blue-400',
          actionText: 'Reflect on Pace',
          suggestion: rifProfile.pacing_preferences <= 4 
            ? "Consider taking a moment to process before responding."
            : "Feel free to share more if you're comfortable."
        };

      case 'emotional_check':
        return {
          icon: Heart,
          title: 'Emotional Check-In',
          message: "How are you feeling about this connection so far?",
          color: 'text-red-400',
          actionText: 'Quick Check-In',
          suggestion: "It's healthy to pause and notice your emotions during meaningful conversations."
        };

      case 'boundary_reminder':
        return {
          icon: MessageCircle,
          title: 'Boundary Awareness',
          message: "Remember, you can share as much or as little as feels comfortable.",
          color: 'text-purple-400',
          actionText: 'Acknowledge',
          suggestion: "Your boundaries matter and help create healthy connections."
        };

      case 'reflection_prompt':
        return {
          icon: Pause,
          title: 'Mindful Moment',
          message: "What are you hoping to learn about this person?",
          color: 'text-goldenrod',
          actionText: 'Reflect',
          suggestion: "Taking intentional pauses can deepen your connections."
        };

      default:
        return null;
    }
  };

  const handleQuickResponse = async (response: string) => {
    try {
      await submitFeedback('behavioral', {
        nudge_type: type,
        response: response,
        context: context,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error submitting behavioral feedback:', error);
    }
    onDismiss();
  };

  const content = getNudgeContent();
  if (!content) return null;

  const Icon = content.icon;

  return (
    <div className="fixed bottom-20 right-4 bg-charcoal-gray/95 backdrop-blur-xl rounded-2xl p-4 w-80 border border-goldenrod/30 shadow-2xl z-40 animate-in slide-in-from-right duration-300">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-2">
          <Icon className={`h-4 w-4 ${content.color}`} />
          <span className="text-white font-medium text-sm">MonArk Nudge</span>
        </div>
        <button
          onClick={onDismiss}
          className="p-1 text-gray-400 hover:text-white transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      <div className="space-y-3">
        <h4 className="text-white font-medium text-sm">{content.title}</h4>
        <p className="text-gray-300 text-xs leading-relaxed">{content.message}</p>

        {showDetails && (
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-gray-400 text-xs">{content.suggestion}</p>
          </div>
        )}

        {type === 'emotional_check' && (
          <div className="flex space-x-2">
            <button
              onClick={() => handleQuickResponse('positive')}
              className="flex-1 p-2 bg-green-600/20 text-green-400 text-xs rounded border border-green-600/30 hover:bg-green-600/30 transition-colors"
            >
              Good
            </button>
            <button
              onClick={() => handleQuickResponse('neutral')}
              className="flex-1 p-2 bg-yellow-600/20 text-yellow-400 text-xs rounded border border-yellow-600/30 hover:bg-yellow-600/30 transition-colors"
            >
              Okay
            </button>
            <button
              onClick={() => handleQuickResponse('uncertain')}
              className="flex-1 p-2 bg-orange-600/20 text-orange-400 text-xs rounded border border-orange-600/30 hover:bg-orange-600/30 transition-colors"
            >
              Unsure
            </button>
          </div>
        )}

        <div className="flex space-x-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex-1 p-2 bg-gray-700/50 text-gray-300 text-xs rounded hover:bg-gray-600/50 transition-colors"
          >
            {showDetails ? 'Less' : 'More'}
          </button>
          
          <button
            onClick={onAction || onDismiss}
            className="flex-1 p-2 bg-goldenrod-gradient text-jet-black font-medium text-xs rounded transition-all duration-300 hover:shadow-golden-glow"
          >
            {content.actionText}
          </button>
        </div>
      </div>
    </div>
  );
};
