
import React, { useState } from 'react';
import { BasicProfileStep } from './BasicProfileStep';
import { AffirmationScreen } from './AffirmationScreen';
import { IntentScreen } from './IntentScreen';
import { InviteScreen } from './InviteScreen';
import { RIFQuiz } from './RIFQuiz';
import { RIFOnboardingStep } from './RIFOnboardingStep';
import { FinalWelcomeScreen } from './FinalWelcomeScreen';
import { RIFIntegration } from '../rif/RIFIntegration';

interface OnboardingFlowProps {
  onComplete: () => void;
}

interface BasicProfileData {
  email: string;
  name: string;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [basicProfileData, setBasicProfileData] = useState<BasicProfileData | null>(null);

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handleBasicProfileNext = (data: BasicProfileData) => {
    setBasicProfileData(data);
    nextStep();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <BasicProfileStep onNext={handleBasicProfileNext} />;
      case 1:
        return <AffirmationScreen onNext={nextStep} />;
      case 2:
        return <IntentScreen onNext={nextStep} />;
      case 3:
        return <InviteScreen onNext={nextStep} />;
      case 4:
        return (
          <RIFIntegration 
            mode="consent" 
            onComplete={nextStep}
          />
        );
      case 5:
        return <RIFQuiz onNext={nextStep} />;
      case 6:
        return <RIFOnboardingStep onNext={nextStep} />;
      case 7:
        return <FinalWelcomeScreen onNext={onComplete} userName={basicProfileData?.name} />;
      default:
        return <BasicProfileStep onNext={handleBasicProfileNext} />;
    }
  };

  return (
    <div className="min-h-screen bg-jet-black">
      {renderStep()}
    </div>
  );
};
