import React, { useState } from 'react';
import { SimplifiedPhotosStep } from './SimplifiedPhotosStep';
import { SimplifiedBioStep } from './SimplifiedBioStep';
import { SimplifiedInterestsStep } from './SimplifiedInterestsStep';
import { LocationStep } from './LocationStep';
import { SimplifiedIdentityStep } from './SimplifiedIdentityStep';
import { RelationshipGoalsStep } from './RelationshipGoalsStep';
import { RIFLiteQuiz, RIFLiteAnswers } from './RIFLiteQuiz';
import { FinalWelcomeScreen } from './FinalWelcomeScreen';
import { useProfile } from '@/hooks/useProfile';
import { useRIF } from '@/hooks/useRIF';
import { useToast } from '@/hooks/use-toast';

interface OnboardingFlowProps {
  onComplete: () => void;
}

interface OnboardingData {
  photos: string[];
  bio: string;
  occupation: string;
  interests: string[];
  location: string;
  genderIdentity: string;
  sexualOrientation: string;
  relationshipGoals: string[];
  rifAnswers?: RIFLiteAnswers;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    photos: [],
    bio: '',
    occupation: '',
    interests: [],
    location: '',
    genderIdentity: '',
    sexualOrientation: '',
    relationshipGoals: [],
  });
  
  const { updateProfile } = useProfile();
  const { submitFeedback } = useRIF();
  const { toast } = useToast();

  const handlePhotosNext = (photos: string[]) => {
    setOnboardingData(prev => ({ ...prev, photos }));
    setCurrentStep(1);
  };

  const handleBioNext = (data: { bio: string; occupation: string }) => {
    setOnboardingData(prev => ({ ...prev, bio: data.bio, occupation: data.occupation }));
    setCurrentStep(2);
  };

  const handleInterestsNext = (interests: string[]) => {
    setOnboardingData(prev => ({ ...prev, interests }));
    setCurrentStep(3);
  };

  const handleLocationNext = (location: string) => {
    setOnboardingData(prev => ({ ...prev, location }));
    setCurrentStep(4);
  };

  const handleIdentityNext = (data: { genderIdentity: string; sexualOrientation: string }) => {
    setOnboardingData(prev => ({ ...prev, ...data }));
    setCurrentStep(5);
  };

  const handleGoalsNext = async (goals: string[]) => {
    const updatedData = { ...onboardingData, relationshipGoals: goals };
    setOnboardingData(updatedData);
    
    // Save profile data to database
    try {
      await updateProfile({
        photos: updatedData.photos,
        bio: updatedData.bio,
        occupation: updatedData.occupation,
        interests: updatedData.interests,
        location: updatedData.location,
        gender_identity: updatedData.genderIdentity as any,
        sexual_orientation: updatedData.sexualOrientation as any,
        relationship_goals: updatedData.relationshipGoals,
        is_profile_complete: false, // Will be true after RIF Lite
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Couldn't save profile",
        description: "Don't worry, you can continue. We'll try again.",
        variant: "destructive",
      });
    }
    
    setCurrentStep(6);
  };

  const handleRIFComplete = async (answers: RIFLiteAnswers) => {
    setOnboardingData(prev => ({ ...prev, rifAnswers: answers }));
    
    // Save RIF answers
    try {
      await submitFeedback('onboarding_rif_lite', answers);
      
      // Mark profile as complete
      await updateProfile({
        is_profile_complete: true,
      });
    } catch (error) {
      console.error('Error saving RIF answers:', error);
    }
    
    setCurrentStep(7);
  };

  const goBack = (step: number) => {
    setCurrentStep(step);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <SimplifiedPhotosStep onNext={handlePhotosNext} />;
      case 1:
        return <SimplifiedBioStep onNext={handleBioNext} onBack={() => goBack(0)} />;
      case 2:
        return <SimplifiedInterestsStep onNext={handleInterestsNext} onBack={() => goBack(1)} />;
      case 3:
        return <LocationStep onNext={handleLocationNext} onBack={() => goBack(2)} />;
      case 4:
        return <SimplifiedIdentityStep onNext={handleIdentityNext} onBack={() => goBack(3)} />;
      case 5:
        return <RelationshipGoalsStep onNext={handleGoalsNext} onBack={() => goBack(4)} />;
      case 6:
        return <RIFLiteQuiz onComplete={handleRIFComplete} />;
      case 7:
        return <FinalWelcomeScreen onNext={onComplete} />;
      default:
        return <SimplifiedPhotosStep onNext={handlePhotosNext} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderStep()}
    </div>
  );
};
