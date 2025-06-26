
import React, { useState } from 'react';
import { Heart, Clock, Shield, Target } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useRIF } from '@/hooks/useRIF';

interface RIFOnboardingStepProps {
  onNext: () => void;
}

export const RIFOnboardingStep: React.FC<RIFOnboardingStepProps> = ({ onNext }) => {
  const { submitFeedback } = useRIF();
  const [responses, setResponses] = useState({
    emotional_readiness: [5],
    pacing_preference: '',
    boundaries: [] as string[],
    intent_clarity: [5],
    reflection_habits: [5]
  });

  const pacingOptions = [
    { id: 'slow', label: 'Take It Slow', description: 'I prefer getting to know someone gradually' },
    { id: 'moderate', label: 'Steady Pace', description: 'I like a balanced approach to dating' },
    { id: 'fast', label: 'Move Forward', description: 'I know what I want and act on it' }
  ];

  const boundaryOptions = [
    'Emotional transparency',
    'Physical boundaries',
    'Time and availability',
    'Communication style',
    'Personal space',
    'Future expectations'
  ];

  const handleBoundaryToggle = (boundary: string) => {
    setResponses(prev => ({
      ...prev,
      boundaries: prev.boundaries.includes(boundary)
        ? prev.boundaries.filter(b => b !== boundary)
        : [...prev.boundaries, boundary]
    }));
  };

  const handleSubmit = async () => {
    try {
      await submitFeedback('onboarding', {
        emotional_readiness: responses.emotional_readiness[0],
        pacing_preference: responses.pacing_preference,
        boundaries: responses.boundaries,
        intent_clarity: responses.intent_clarity[0],
        reflection_habits: responses.reflection_habits[0]
      });
      onNext();
    } catch (error) {
      console.error('Error saving RIF onboarding data:', error);
      onNext(); // Continue even if save fails
    }
  };

  const canProceed = responses.pacing_preference && responses.boundaries.length > 0;

  return (
    <div className="min-h-screen bg-jet-black flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-4">
          <Heart className="h-12 w-12 text-goldenrod mx-auto" />
          <h1 className="text-2xl font-light text-white">Your Emotional Compass</h1>
          <p className="text-gray-300 text-sm">
            Help us understand your dating preferences to enhance your MonArk experience
          </p>
        </div>

        <div className="space-y-6">
          {/* Emotional Readiness */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-goldenrod" />
              <label className="text-white font-medium">How ready do you feel for emotional connection?</label>
            </div>
            <Slider
              value={responses.emotional_readiness}
              onValueChange={(value) => setResponses(prev => ({ ...prev, emotional_readiness: value }))}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>Just exploring</span>
              <span>Very ready</span>
            </div>
          </div>

          {/* Pacing Preference */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-goldenrod" />
              <label className="text-white font-medium">How quickly do you tend to move when dating?</label>
            </div>
            <div className="space-y-2">
              {pacingOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setResponses(prev => ({ ...prev, pacing_preference: option.id }))}
                  className={`w-full p-3 rounded-lg border text-left transition-colors ${
                    responses.pacing_preference === option.id
                      ? 'border-goldenrod bg-goldenrod/10 text-white'
                      : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm text-gray-400">{option.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Boundaries */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-goldenrod" />
              <label className="text-white font-medium">What boundaries matter most to you? (Select all that apply)</label>
            </div>
            <div className="flex flex-wrap gap-2">
              {boundaryOptions.map((boundary) => (
                <Badge
                  key={boundary}
                  variant={responses.boundaries.includes(boundary) ? "default" : "outline"}
                  className={`cursor-pointer transition-colors ${
                    responses.boundaries.includes(boundary)
                      ? 'bg-goldenrod text-jet-black hover:bg-goldenrod/90'
                      : 'border-gray-600 text-gray-300 hover:border-goldenrod hover:text-goldenrod'
                  }`}
                  onClick={() => handleBoundaryToggle(boundary)}
                >
                  {boundary}
                </Badge>
              ))}
            </div>
          </div>

          {/* Intent Clarity */}
          <div className="space-y-3">
            <label className="text-white font-medium">How clear are you about what you're looking for?</label>
            <Slider
              value={responses.intent_clarity}
              onValueChange={(value) => setResponses(prev => ({ ...prev, intent_clarity: value }))}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>Still figuring it out</span>
              <span>Very clear</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <p className="text-xs text-gray-400 text-center">
            This information helps personalize your MonArk experience and is completely private. 
            You can update these preferences anytime in your profile settings.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!canProceed}
          className="w-full py-4 bg-goldenrod-gradient text-jet-black font-semibold rounded-xl text-lg transition-all duration-300 hover:shadow-golden-glow transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Complete Setup
        </button>
      </div>
    </div>
  );
};
