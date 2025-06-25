
import React, { useState } from 'react';
import { Heart, X, Pause } from 'lucide-react';
import { useRIF } from '@/hooks/useRIF';

interface RIFReflectionPromptProps {
  onClose: () => void;
  onSnooze: () => void;
}

export const RIFReflectionPrompt: React.FC<RIFReflectionPromptProps> = ({ onClose, onSnooze }) => {
  const { rifSettings, submitFeedback } = useRIF();
  const [response, setResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const prompts = [
    "How are you feeling about your dating journey right now?",
    "What patterns do you notice in your recent connections?",
    "How well are you honoring your boundaries lately?",
    "What would support you in feeling more emotionally ready?",
    "How aligned have your recent dates been with what you're seeking?"
  ];

  const currentPrompt = prompts[Math.floor(Math.random() * prompts.length)];

  const handleSubmit = async () => {
    if (!response.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await submitFeedback('check_in', {
        prompt: currentPrompt,
        response: response,
        emotional_state: Math.floor(Math.random() * 10) + 1 // Would be user-selected in real app
      });
      onClose();
    } catch (error) {
      console.error('Error submitting reflection:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!rifSettings?.reflection_prompts_enabled) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-jet-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-charcoal-gray rounded-2xl p-6 w-full max-w-md border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-goldenrod" />
            <span className="text-white font-medium">Reflection Moment</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-gray-300">{currentPrompt}</p>
          
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Take a moment to reflect..."
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-goldenrod focus:outline-none resize-none"
            rows={4}
          />

          <div className="text-xs text-gray-500 space-y-1">
            <p>• This is for your personal reflection and growth</p>
            <p>• Your response helps personalize your MonArk experience</p>
            <p>• You can always adjust these prompts in Privacy Settings</p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onSnooze}
              className="flex-1 flex items-center justify-center space-x-2 p-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <Pause className="h-4 w-4" />
              <span>Later</span>
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={!response.trim() || isSubmitting}
              className="flex-1 p-3 bg-goldenrod-gradient text-jet-black font-semibold rounded-lg transition-all duration-300 hover:shadow-golden-glow disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Reflect'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
