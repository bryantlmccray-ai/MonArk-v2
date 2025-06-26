
import React, { useState } from 'react';
import { Heart, Compass, Target, Clock, Shield, TrendingUp, Edit3 } from 'lucide-react';
import { useRIF } from '@/hooks/useRIF';
import { Textarea } from '@/components/ui/textarea';

export const RelationalCompass: React.FC = () => {
  const { rifProfile, rifSettings } = useRIF();
  const [showReflection, setShowReflection] = useState(false);
  const [reflection, setReflection] = useState('');

  if (!rifSettings?.rif_enabled || !rifProfile) {
    return null;
  }

  const getRIFState = () => {
    const avgScore = (
      rifProfile.intent_clarity + 
      rifProfile.pacing_preferences + 
      rifProfile.emotional_readiness + 
      rifProfile.boundary_respect + 
      rifProfile.post_date_alignment
    ) / 5;

    if (avgScore >= 7) return { state: 'Ready', color: 'text-green-400', description: 'You seem emotionally prepared for meaningful connections' };
    if (avgScore >= 5) return { state: 'Exploring', color: 'text-goldenrod', description: 'You\'re discovering what works for you in dating' };
    return { state: 'Developing', color: 'text-blue-400', description: 'You\'re building emotional awareness and clarity' };
  };

  const rifState = getRIFState();

  const rifDimensions = [
    { 
      key: 'intent_clarity', 
      label: 'Intent Clarity', 
      icon: Target, 
      value: rifProfile.intent_clarity,
      description: 'How clear you are about what you want'
    },
    { 
      key: 'pacing_preferences', 
      label: 'Pacing Style', 
      icon: Clock, 
      value: rifProfile.pacing_preferences,
      description: 'Your preferred speed in relationships'
    },
    { 
      key: 'emotional_readiness', 
      label: 'Emotional Readiness', 
      icon: Heart, 
      value: rifProfile.emotional_readiness,
      description: 'Your capacity for emotional connection'
    },
    { 
      key: 'boundary_respect', 
      label: 'Boundary Awareness', 
      icon: Shield, 
      value: rifProfile.boundary_respect,
      description: 'How well you communicate and respect limits'
    }
  ];

  return (
    <div className="bg-charcoal-gray rounded-xl p-6 border border-gray-800 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Compass className="h-6 w-6 text-goldenrod" />
          <div>
            <h3 className="text-white font-medium text-lg">Relational Compass</h3>
            <p className="text-gray-400 text-sm">Your emotional awareness journey</p>
          </div>
        </div>
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full bg-gray-800/50`}>
          <div className={`w-2 h-2 rounded-full ${rifState.color.replace('text-', 'bg-')}`} />
          <span className={`text-sm font-medium ${rifState.color}`}>{rifState.state}</span>
        </div>
      </div>

      <p className="text-gray-300 text-sm">{rifState.description}</p>

      {/* RIF Dimensions */}
      <div className="space-y-3">
        {rifDimensions.map((dimension) => {
          const Icon = dimension.icon;
          const percentage = (dimension.value / 10) * 100;
          
          return (
            <div key={dimension.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon className="h-4 w-4 text-goldenrod" />
                  <span className="text-white text-sm font-medium">{dimension.label}</span>
                </div>
                <span className="text-gray-400 text-sm">{dimension.value}/10</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div 
                  className="bg-goldenrod h-2 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">{dimension.description}</p>
            </div>
          );
        })}
      </div>

      {/* Reflection Section */}
      <div className="border-t border-gray-700 pt-4">
        {!showReflection ? (
          <button
            onClick={() => setShowReflection(true)}
            className="flex items-center space-x-2 text-goldenrod hover:text-goldenrod/80 transition-colors"
          >
            <Edit3 className="h-4 w-4" />
            <span className="text-sm">Add a reflection</span>
          </button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white text-sm font-medium">Quick Reflection</span>
              <button
                onClick={() => setShowReflection(false)}
                className="text-gray-400 hover:text-white text-sm"
              >
                Cancel
              </button>
            </div>
            <Textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="How are you feeling about your dating journey right now?"
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-goldenrod"
              rows={3}
            />
            <button
              onClick={() => {
                // Here you would save the reflection
                console.log('Saving reflection:', reflection);
                setReflection('');
                setShowReflection(false);
              }}
              disabled={!reflection.trim()}
              className="w-full py-2 bg-goldenrod-gradient text-jet-black font-medium rounded-lg text-sm hover:shadow-golden-glow transition-all duration-300 disabled:opacity-50"
            >
              Save Reflection
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
