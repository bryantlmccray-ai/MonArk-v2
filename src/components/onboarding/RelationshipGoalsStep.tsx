import React, { useState } from 'react';
import { Check, Heart } from 'lucide-react';

interface RelationshipGoalsStepProps {
  onNext: (goals: string[]) => void;
  onBack: () => void;
}

const GOAL_OPTIONS = [
  { value: 'serious', label: 'Serious relationship', emoji: '💑' },
  { value: 'casual', label: 'Casual dating', emoji: '🌟' },
  { value: 'marriage', label: 'Marriage', emoji: '💍' },
  { value: 'friends', label: 'New friends', emoji: '🤝' },
  { value: 'unsure', label: 'Not sure yet', emoji: '🤔' },
  { value: 'open', label: 'Open to anything', emoji: '✨' },
];

export const RelationshipGoalsStep: React.FC<RelationshipGoalsStepProps> = ({ onNext, onBack }) => {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const toggleGoal = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter(g => g !== goal));
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  const canProceed = selectedGoals.length > 0;

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col">
      <div className="flex-1 max-w-md mx-auto w-full space-y-6">
        {/* Progress indicator */}
        <div className="flex justify-center space-x-2">
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <div
              key={step}
              className={`h-1.5 w-6 rounded-full bg-primary`}
            />
          ))}
        </div>

        {/* Header */}
        <div className="text-center space-y-2 pt-4">
          <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-foreground">What Are You Looking For?</h1>
          <p className="text-muted-foreground">Select all that apply</p>
        </div>

        {/* Goal Options */}
        <div className="space-y-3">
          {GOAL_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => toggleGoal(option.value)}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                selectedGoals.includes(option.value)
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{option.emoji}</span>
                  <span className="text-foreground font-medium">{option.label}</span>
                </div>
                {selectedGoals.includes(option.value) && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Selection count */}
        <div className="text-center">
          <span className={`text-sm ${selectedGoals.length > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
            {selectedGoals.length} selected
          </span>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="pt-6 max-w-md mx-auto w-full space-y-3">
        <button
          onClick={() => onNext(selectedGoals)}
          disabled={!canProceed}
          className="w-full py-4 bg-primary text-primary-foreground font-semibold rounded-xl transition-all duration-300 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Complete Profile
        </button>
        <button
          onClick={onBack}
          className="w-full py-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          Back
        </button>
      </div>
    </div>
  );
};
