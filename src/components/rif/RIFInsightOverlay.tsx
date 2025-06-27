
import React, { useState, useEffect } from 'react';
import { Heart, Clock, Shield, AlertTriangle, X } from 'lucide-react';
import { useRIF } from '@/hooks/useRIF';

interface RIFInsightOverlayProps {
  type: 'discovery' | 'conversation' | 'pacing' | 'boundary';
  targetUser?: {
    name: string;
    rifProfile: any;
  };
  onDismiss: () => void;
  onAction?: () => void;
}

export const RIFInsightOverlay: React.FC<RIFInsightOverlayProps> = ({
  type,
  targetUser,
  onDismiss,
  onAction
}) => {
  const { rifProfile, rifSettings } = useRIF();
  const [showDetails, setShowDetails] = useState(false);

  if (!rifSettings?.rif_enabled || !rifProfile) {
    return null;
  }

  const getInsightContent = () => {
    switch (type) {
      case 'discovery':
        if (!targetUser) return null;
        const pacingDiff = Math.abs(rifProfile.pacing_preferences - targetUser.rifProfile.pacing_preferences);
        const emotionalAlignment = Math.abs(rifProfile.emotional_readiness - targetUser.rifProfile.emotional_readiness);
        
        return {
          icon: Heart,
          title: 'RIF Compatibility Insight',
          message: pacingDiff <= 2 
            ? `You and ${targetUser.name} have similar pacing preferences - this could be a strong match!`
            : `You and ${targetUser.name} have different pacing styles. Consider this when connecting.`,
          color: pacingDiff <= 2 ? 'text-green-400' : 'text-yellow-400',
          actionText: 'Proceed with Awareness'
        };

      case 'conversation':
        return {
          icon: Clock,
          title: 'Pacing Check-In',
          message: 'Based on your RIF profile, you prefer taking things slow. How does this conversation feel right now?',
          color: 'text-blue-400',
          actionText: 'Reflect on Pacing'
        };

      case 'pacing':
        return {
          icon: AlertTriangle,
          title: 'Pacing Awareness',
          message: 'You\'ve been chatting for a while. Your RIF profile suggests you value mindful pacing in connections.',
          color: 'text-orange-400',
          actionText: 'Take a Moment'
        };

      case 'boundary':
        return {
          icon: Shield,
          title: 'Boundary Reminder',
          message: 'Remember your boundaries are important. How are you feeling about this interaction?',
          color: 'text-purple-400',
          actionText: 'Check Boundaries'
        };

      default:
        return null;
    }
  };

  const content = getInsightContent();
  if (!content) return null;

  const Icon = content.icon;

  return (
    <div className="fixed inset-0 bg-jet-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-charcoal-gray/95 backdrop-blur-xl rounded-2xl p-6 w-full max-w-sm border border-goldenrod/30 shadow-2xl">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-2">
            <Icon className={`h-5 w-5 ${content.color}`} />
            <span className="text-white font-medium text-sm">RIF Insight</span>
          </div>
          <button
            onClick={onDismiss}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <h3 className="text-white font-medium">{content.title}</h3>
          <p className="text-gray-300 text-sm leading-relaxed">{content.message}</p>

          {showDetails && targetUser && (
            <div className="bg-gray-800/50 rounded-lg p-3 space-y-2">
              <div className="text-xs text-gray-400">Compatibility Breakdown:</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-300">Pacing Alignment:</span>
                  <span className={Math.abs(rifProfile.pacing_preferences - targetUser.rifProfile.pacing_preferences) <= 2 ? 'text-green-400' : 'text-yellow-400'}>
                    {Math.abs(rifProfile.pacing_preferences - targetUser.rifProfile.pacing_preferences) <= 2 ? 'Strong' : 'Different'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Emotional Readiness:</span>
                  <span className={Math.abs(rifProfile.emotional_readiness - targetUser.rifProfile.emotional_readiness) <= 2 ? 'text-green-400' : 'text-yellow-400'}>
                    {Math.abs(rifProfile.emotional_readiness - targetUser.rifProfile.emotional_readiness) <= 2 ? 'Aligned' : 'Variable'}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            {targetUser && (
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex-1 p-2 bg-gray-700 text-gray-300 text-sm rounded-lg hover:bg-gray-600 transition-colors"
              >
                {showDetails ? 'Hide Details' : 'Show Details'}
              </button>
            )}
            
            <button
              onClick={onAction || onDismiss}
              className="flex-1 p-2 bg-goldenrod-gradient text-jet-black font-medium text-sm rounded-lg transition-all duration-300 hover:shadow-golden-glow"
            >
              {content.actionText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
