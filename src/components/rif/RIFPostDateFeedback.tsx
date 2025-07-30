
import React, { useState } from 'react';
import { Heart, X, Star, Clock, Shield, Target } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useRIF } from '@/hooks/useRIF';

interface RIFPostDateFeedbackProps {
  dateName: string;
  onComplete: () => void;
  onSkip: () => void;
}

export const RIFPostDateFeedback: React.FC<RIFPostDateFeedbackProps> = ({
  dateName,
  onComplete,
  onSkip
}) => {
  const { submitFeedback } = useRIF();
  const [responses, setResponses] = useState({
    overall_experience: [5],
    pace_alignment: [5],
    boundary_respect: [5],
    emotional_connection: [5],
    intent_clarity: [5],
    would_see_again: '',
    reflection_notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await submitFeedback('post_date', {
        date_partner: dateName,
        overall_experience: responses.overall_experience[0],
        pace_alignment: responses.pace_alignment[0],
        boundary_respect: responses.boundary_respect[0],
        emotional_connection: responses.emotional_connection[0],
        intent_clarity: responses.intent_clarity[0],
        would_see_again: responses.would_see_again,
        reflection_notes: responses.reflection_notes,
        timestamp: new Date().toISOString()
      });
      onComplete();
    } catch (error) {
      console.error('Error submitting post-date feedback:', error);
      onComplete(); // Continue even if submission fails
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-jet-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-2xl p-6 w-full max-w-md border border-gray-700 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-goldenrod" />
            <span className="text-white font-medium">Post-Date Reflection</span>
          </div>
          <button
            onClick={onSkip}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="text-center">
            <p className="text-gray-300">How was your date with {dateName}?</p>
            <p className="text-xs text-gray-500 mt-1">Your feedback helps improve your MonArk experience</p>
          </div>

          {/* Overall Experience */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-goldenrod" />
              <label className="text-white text-sm font-medium">Overall Experience</label>
            </div>
            <Slider
              value={responses.overall_experience}
              onValueChange={(value) => setResponses(prev => ({ ...prev, overall_experience: value }))}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>Not great</span>
              <span>Amazing</span>
            </div>
          </div>

          {/* Pace Alignment */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-400" />
              <label className="text-white text-sm font-medium">Pace Alignment</label>
            </div>
            <Slider
              value={responses.pace_alignment}
              onValueChange={(value) => setResponses(prev => ({ ...prev, pace_alignment: value }))}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>Mismatched</span>
              <span>Perfect sync</span>
            </div>
          </div>

          {/* Boundary Respect */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-purple-400" />
              <label className="text-white text-sm font-medium">Boundary Respect</label>
            </div>
            <Slider
              value={responses.boundary_respect}
              onValueChange={(value) => setResponses(prev => ({ ...prev, boundary_respect: value }))}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>Concerning</span>
              <span>Very respectful</span>
            </div>
          </div>

          {/* Emotional Connection */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Heart className="h-4 w-4 text-red-400" />
              <label className="text-white text-sm font-medium">Emotional Connection</label>
            </div>
            <Slider
              value={responses.emotional_connection}
              onValueChange={(value) => setResponses(prev => ({ ...prev, emotional_connection: value }))}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>No spark</span>
              <span>Strong connection</span>
            </div>
          </div>

          {/* Intent Clarity */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-green-400" />
              <label className="text-white text-sm font-medium">Intent Clarity</label>
            </div>
            <Slider
              value={responses.intent_clarity}
              onValueChange={(value) => setResponses(prev => ({ ...prev, intent_clarity: value }))}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>Unclear</span>
              <span>Very clear</span>
            </div>
          </div>

          {/* Would See Again */}
          <div className="space-y-3">
            <label className="text-white text-sm font-medium">Would you like to see them again?</label>
            <div className="space-y-2">
              {['Yes, definitely', 'Maybe', 'Not sure', 'Probably not', 'No'].map((option) => (
                <button
                  key={option}
                  onClick={() => setResponses(prev => ({ ...prev, would_see_again: option }))}
                  className={`w-full p-2 text-left text-sm rounded-lg border transition-colors ${
                    responses.would_see_again === option
                      ? 'border-goldenrod bg-goldenrod/10 text-white'
                      : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Reflection Notes */}
          <div className="space-y-3">
            <label className="text-white text-sm font-medium">Personal Growth Insights (Optional)</label>
            <textarea
              value={responses.reflection_notes}
              onChange={(e) => setResponses(prev => ({ ...prev, reflection_notes: e.target.value }))}
              placeholder="What did you learn about yourself or what you're looking for? Any patterns you noticed?"
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-goldenrod focus:outline-none resize-none"
              rows={4}
            />
            <p className="text-xs text-gray-500">
              This helps you track your dating journey and personal growth over time
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onSkip}
              className="flex-1 p-3 bg-gray-700 text-gray-300 font-medium rounded-lg hover:bg-gray-600 transition-colors"
            >
              Skip for Now
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 p-3 bg-goldenrod-gradient text-jet-black font-semibold rounded-lg transition-all duration-300 hover:shadow-golden-glow disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Complete Reflection'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
