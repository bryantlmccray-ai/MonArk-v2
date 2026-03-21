import React from 'react';

interface OnboardingProgressDotsProps {
  currentStep: number;
  totalSteps: number;
}

export const OnboardingProgressDots: React.FC<OnboardingProgressDotsProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="flex gap-2 justify-center mb-8">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
        <div
          key={s}
          className="h-2 rounded-full transition-all duration-300 ease-out"
          style={{
            width: s === currentStep ? 24 : 8,
            backgroundColor:
              s === currentStep
                ? 'hsl(var(--primary))'
                : s < currentStep
                  ? 'hsl(var(--accent))'
                  : 'hsl(var(--muted))',
          }}
        />
      ))}
    </div>
  );
};
