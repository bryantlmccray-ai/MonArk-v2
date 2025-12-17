import React, { useState } from 'react';
import { Heart } from 'lucide-react';

interface SimplifiedInterestsStepProps {
  onNext: (interests: string[]) => void;
  onBack: () => void;
  onSkip?: () => void;
}

const INTERESTS = [
  // Activities
  'Travel', 'Hiking', 'Cooking', 'Reading', 'Gaming', 'Fitness',
  // Arts & Culture
  'Music', 'Art', 'Photography', 'Film', 'Theater', 'Dance',
  // Social
  'Foodie', 'Wine & Cocktails', 'Coffee', 'Nightlife', 'Festivals',
  // Lifestyle
  'Yoga', 'Meditation', 'Pets', 'Nature', 'Volunteering',
  // Hobbies
  'Sports', 'Writing', 'Podcasts', 'Tech', 'Fashion', 'DIY'
];

const MAX_INTERESTS = 5;

export const SimplifiedInterestsStep: React.FC<SimplifiedInterestsStepProps> = ({ onNext, onBack, onSkip }) => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => {
      if (prev.includes(interest)) {
        return prev.filter(i => i !== interest);
      }
      if (prev.length >= MAX_INTERESTS) {
        return prev;
      }
      return [...prev, interest];
    });
  };

  const canProceed = selectedInterests.length >= 3;

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col">
      <div className="flex-1 max-w-md mx-auto w-full space-y-6">
        {/* Progress indicator */}
        <div className="flex justify-center space-x-2">
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <div
              key={step}
              className={`h-1.5 w-6 rounded-full ${step <= 3 ? 'bg-primary' : 'bg-muted'}`}
            />
          ))}
        </div>

        {/* Header */}
        <div className="text-center space-y-2 pt-4">
          <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-foreground">Your Interests</h1>
          <p className="text-muted-foreground">
            Pick 3-5 things you love
          </p>
        </div>

        {/* Selection counter */}
        <div className="text-center">
          <span className={`text-sm ${selectedInterests.length >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
            {selectedInterests.length} of {MAX_INTERESTS} selected
            {selectedInterests.length < 3 && ' (min 3)'}
          </span>
        </div>

        {/* Interests Grid */}
        <div className="flex flex-wrap gap-2 justify-center">
          {INTERESTS.map((interest) => {
            const isSelected = selectedInterests.includes(interest);
            const isDisabled = !isSelected && selectedInterests.length >= MAX_INTERESTS;
            
            return (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                disabled={isDisabled}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  isSelected
                    ? 'bg-primary text-primary-foreground scale-105'
                    : isDisabled
                    ? 'bg-muted/50 text-muted-foreground/50 cursor-not-allowed'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:scale-105'
                }`}
              >
                {interest}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="pt-6 max-w-md mx-auto w-full space-y-3">
        <button
          onClick={() => onNext(selectedInterests)}
          disabled={!canProceed}
          className="w-full py-4 bg-primary text-primary-foreground font-semibold rounded-xl transition-all duration-300 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
        <div className="flex justify-between">
          <button
            onClick={onBack}
            className="py-3 text-muted-foreground hover:text-foreground transition-colors"
          >
            Back
          </button>
          {onSkip && (
            <button
              onClick={onSkip}
              className="py-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip for now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
