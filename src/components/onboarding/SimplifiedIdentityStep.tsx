import React, { useState } from 'react';
import { Check, User } from 'lucide-react';

interface SimplifiedIdentityStepProps {
  onNext: (data: { genderIdentity: string; sexualOrientation: string }) => void;
  onBack: () => void;
  onSkip?: () => void;
}

const GENDER_OPTIONS = [
  { value: 'Man', label: 'Man' },
  { value: 'Woman', label: 'Woman' },
  { value: 'Nonbinary', label: 'Nonbinary' },
  { value: 'Genderfluid', label: 'Genderfluid' },
  { value: 'Other', label: 'Other / Prefer not to say' },
];

const ORIENTATION_OPTIONS = [
  { value: 'Straight', label: 'Straight' },
  { value: 'Gay', label: 'Gay' },
  { value: 'Lesbian', label: 'Lesbian' },
  { value: 'Bisexual', label: 'Bisexual' },
  { value: 'Pansexual', label: 'Pansexual' },
  { value: 'Queer', label: 'Queer' },
  { value: 'Other', label: 'Other / Prefer not to say' },
];

export const SimplifiedIdentityStep: React.FC<SimplifiedIdentityStepProps> = ({ onNext, onBack, onSkip }) => {
  const [genderIdentity, setGenderIdentity] = useState('');
  const [sexualOrientation, setSexualOrientation] = useState('');

  const canProceed = genderIdentity && sexualOrientation;

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col">
      <div className="flex-1 max-w-md mx-auto w-full space-y-6 overflow-y-auto">
        {/* Progress indicator */}
        <div className="flex justify-center space-x-2">
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <div
              key={step}
              className={`h-1.5 w-6 rounded-full ${step <= 5 ? 'bg-primary' : 'bg-muted'}`}
            />
          ))}
        </div>

        {/* Header */}
        <div className="text-center space-y-2 pt-4">
          <User className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-foreground">About You</h1>
          <p className="text-muted-foreground">Help us match you better</p>
        </div>

        {/* Gender Identity */}
        <div className="space-y-3">
          <h3 className="text-foreground font-medium">I identify as...</h3>
          <div className="grid grid-cols-2 gap-2">
            {GENDER_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setGenderIdentity(option.value)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  genderIdentity === option.value
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-card hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-foreground font-medium text-sm">{option.label}</span>
                  {genderIdentity === option.value && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Sexual Orientation */}
        <div className="space-y-3">
          <h3 className="text-foreground font-medium">I'm interested in...</h3>
          <div className="grid grid-cols-2 gap-2">
            {ORIENTATION_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setSexualOrientation(option.value)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  sexualOrientation === option.value
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-card hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-foreground font-medium text-sm">{option.label}</span>
                  {sexualOrientation === option.value && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="pt-6 max-w-md mx-auto w-full space-y-3">
        <button
          onClick={() => onNext({ genderIdentity, sexualOrientation })}
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
