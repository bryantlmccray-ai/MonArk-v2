
import React, { useState } from 'react';
import { AffirmationScreen } from './AffirmationScreen';
import { IntentScreen } from './IntentScreen';
import { InviteScreen } from './InviteScreen';
import { RIFQuiz } from './RIFQuiz';
import { FinalWelcomeScreen } from './FinalWelcomeScreen';

interface OnboardingFlowProps {
  onComplete: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <AffirmationScreen onNext={nextStep} />;
      case 1:
        return <IntentScreen onNext={nextStep} />;
      case 2:
        return <InviteScreen onNext={nextStep} />;
      case 3:
        return <RIFQuiz onNext={nextStep} />;
      case 4:
        return <FinalWelcomeScreen onNext={onComplete} />;
      default:
        return <AffirmationScreen onNext={nextStep} />;
    }
  };

  return (
    <div className="min-h-screen bg-jet-black">
      {renderStep()}
    </div>
  );
};
