
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

  // Add debugging
  console.log('Current onboarding step:', currentStep);

  const nextStep = () => {
    console.log('Moving to next step from:', currentStep);
    setCurrentStep(prev => prev + 1);
  };

  const handleBasicProfileNext = (data: BasicProfileData) => {
    console.log('Basic profile completed:', data);
    setBasicProfileData(data);
    nextStep();
  };

  const renderStep = () => {
    console.log('Rendering step:', currentStep);
    
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
        console.log('Rendering RIF Integration consent screen');
        return (
          <RIFIntegration 
            mode="consent" 
            onComplete={nextStep}
          />
        );
      case 5:
        console.log('Rendering RIF Quiz');
        return <RIFQuiz onNext={nextStep} />;
      case 6:
        console.log('Rendering RIF Onboarding Step');
        return <RIFOnboardingStep onNext={nextStep} />;
      case 7:
        console.log('Rendering Final Welcome Screen');
        return <FinalWelcomeScreen onNext={onComplete} userName={basicProfileData?.name} />;
      default:
        console.log('Default case - returning to basic profile');
        return <BasicProfileStep onNext={handleBasicProfileNext} />;
    }
  };

  return (
    <div className="min-h-screen bg-jet-black">
      {/* Debug info - remove this after testing */}
      <div className="fixed top-4 right-4 bg-gray-800 text-white p-2 rounded text-xs z-50">
        Step: {currentStep}/7
      </div>
      {renderStep()}
    </div>
  );
};
