
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RIFDataCollectorProps {
  type: 'onboarding' | 'post_date' | 'check_in' | 'behavioral';
  onComplete?: () => void;
}

export const RIFDataCollector: React.FC<RIFDataCollectorProps> = ({ type, onComplete }) => {
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getQuestions = () => {
    switch (type) {
      case 'onboarding':
        return [
          { id: 'intent_clarity', question: 'How clear are you about what you want in a relationship?', scale: true },
          { id: 'pacing_comfort', question: 'How do you prefer to pace new relationships?', scale: true },
          { id: 'emotional_availability', question: 'How emotionally available are you right now?', scale: true },
          { id: 'boundary_communication', question: 'How comfortable are you setting boundaries?', scale: true },
          { id: 'reflection_habits', question: 'How often do you reflect on your dating experiences?', scale: true }
        ];
      case 'post_date':
        return [
          { id: 'connection_felt', question: 'How connected did you feel during this date?', scale: true },
          { id: 'boundaries_respected', question: 'How well were boundaries respected?', scale: true },
          { id: 'pace_alignment', question: 'How aligned were you on pacing?', scale: true },
          { id: 'overall_reflection', question: 'What did you learn about yourself?', scale: false }
        ];
      case 'check_in':
        return [
          { id: 'emotional_state', question: 'How are you feeling about dating right now?', scale: true },
          { id: 'energy_level', question: 'What\'s your emotional energy level?', scale: true },
          { id: 'support_needed', question: 'What kind of support would be helpful?', scale: false }
        ];
      default:
        return [];
    }
  };

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Encrypt sensitive data (in production, use proper encryption)
      const encryptedData = {
        type,
        timestamp: new Date().toISOString(),
        responses: responses,
        user_agent: navigator.userAgent,
        encrypted: true
      };

      await supabase
        .from('rif_feedback')
        .insert({
          user_id: user.id,
          feedback_type: type,
          data: encryptedData
        });

      // Process the data to update RIF profile
      await processRIFData(user.id, type, responses);

      onComplete?.();
    } catch (error) {
      console.error('Error submitting RIF data:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const processRIFData = async (userId: string, feedbackType: string, data: Record<string, any>) => {
    // Simple RIF scoring algorithm - in production, this would be more sophisticated
    const scores = {
      intent_clarity: 0,
      pacing_preferences: 0,
      emotional_readiness: 0,
      boundary_respect: 0,
      post_date_alignment: 0
    };

    // Calculate scores based on responses
    if (feedbackType === 'onboarding') {
      scores.intent_clarity = data.intent_clarity || 0;
      scores.pacing_preferences = data.pacing_comfort || 0;
      scores.emotional_readiness = data.emotional_availability || 0;
      scores.boundary_respect = data.boundary_communication || 0;
      scores.post_date_alignment = data.reflection_habits || 0;
    }

    // Update or create RIF profile
    await supabase
      .from('rif_profiles')
      .upsert({
        user_id: userId,
        ...scores,
        updated_at: new Date().toISOString()
      });
  };

  const questions = getQuestions();

  return (
    <div className="min-h-screen bg-jet-black flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-light text-white mb-2">
            {type === 'onboarding' && 'Let\'s understand your relationship style'}
            {type === 'post_date' && 'How was your date?'}
            {type === 'check_in' && 'Quick emotional check-in'}
          </h2>
          <p className="text-gray-400 text-sm">Your responses help us personalize your experience</p>
        </div>

        <div className="space-y-6">
          {questions.map((question) => (
            <div key={question.id} className="space-y-3">
              <label className="block text-white font-medium">{question.question}</label>
              
              {question.scale ? (
                <div className="space-y-2">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={responses[question.id] || 5}
                    onChange={(e) => handleResponseChange(question.id, parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Not at all</span>
                    <span className="text-goldenrod">{responses[question.id] || 5}</span>
                    <span>Completely</span>
                  </div>
                </div>
              ) : (
                <textarea
                  value={responses[question.id] || ''}
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-goldenrod focus:outline-none"
                  rows={3}
                  placeholder="Share your thoughts..."
                />
              )}
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-4 bg-goldenrod-gradient text-jet-black font-semibold rounded-xl text-lg transition-all duration-300 hover:shadow-golden-glow transform hover:scale-105 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Complete'}
        </button>
      </div>
    </div>
  );
};
