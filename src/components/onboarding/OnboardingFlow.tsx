import React, { useState } from 'react';
import { OnboardingWelcome } from './OnboardingWelcome';
import { OnboardingDifference } from './OnboardingDifference';
import { RIFIntro } from './RIFIntro';
import { SimplifiedPhotosStep } from './SimplifiedPhotosStep';
import { SimplifiedBioStep } from './SimplifiedBioStep';
import { SimplifiedInterestsStep } from './SimplifiedInterestsStep';
import { LocationStep } from './LocationStep';
import { SimplifiedIdentityStep } from './SimplifiedIdentityStep';
import { RelationshipGoalsStep } from './RelationshipGoalsStep';
import { DatingStyleQuiz, DatingStyleAnswers } from './DatingStyleQuiz';
import { RIFComplete } from './RIFComplete';
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
  datingStyleAnswers?: DatingStyleAnswers;
}

// Flow:
// 0: Welcome screen
// 1: Why MonArk is different
// 2: RIF Intro
// 3: Photos
// 4: Bio
// 5: Interests
// 6: Location
// 7: Identity
// 8: Relationship Goals
// 9: RIF Questions (DatingStyleQuiz)
// 10: RIF Complete / Final Welcome

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

  // Skip handlers - move to next step without saving data
  const skipToNext = () => {
    if (currentStep < 9) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 9) {
      // Skip RIF quiz - just complete with empty answers
      handleDatingStyleComplete({
        attachmentStyle: '',
        energyType: '',
        datePreferences: [],
        availabilityWindows: [],
        communicationStyle: '',
        pacePreference: '',
        conflictStyle: '',
        loveLanguage: '',
        socialBattery: '',
        dealBreaker: '',
      });
    }
  };

  const handlePhotosNext = (photos: string[]) => {
    setOnboardingData(prev => ({ ...prev, photos }));
    setCurrentStep(4);
  };

  const handleBioNext = (data: { bio: string; occupation: string }) => {
    setOnboardingData(prev => ({ ...prev, bio: data.bio, occupation: data.occupation }));
    setCurrentStep(5);
  };

  const handleInterestsNext = (interests: string[]) => {
    setOnboardingData(prev => ({ ...prev, interests }));
    setCurrentStep(6);
  };

  const handleLocationNext = (location: string) => {
    setOnboardingData(prev => ({ ...prev, location }));
    setCurrentStep(7);
  };

  const handleIdentityNext = (data: { genderIdentity: string; sexualOrientation: string }) => {
    setOnboardingData(prev => ({ ...prev, ...data }));
    setCurrentStep(8);
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
        is_profile_complete: false, // Will be true after RIF quiz
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Couldn't save profile",
        description: "Don't worry, you can continue. We'll try again.",
        variant: "destructive",
      });
    }
    
    setCurrentStep(9);
  };

  const handleDatingStyleComplete = async (answers: DatingStyleAnswers) => {
    setOnboardingData(prev => ({ ...prev, datingStyleAnswers: answers }));
    
    // Save RIF answers (powers Smart Matching behind the scenes)
    try {
      await submitFeedback('onboarding_rif', answers);
      
      // Mark profile as complete
      await updateProfile({
        is_profile_complete: true,
      });
    } catch (error) {
      console.error('Error saving RIF answers:', error);
    }
    
    setCurrentStep(10);
  };

  const goBack = (step: number) => {
    setCurrentStep(step);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <OnboardingWelcome onNext={() => setCurrentStep(1)} />;
      case 1:
        return <OnboardingDifference onNext={() => setCurrentStep(2)} onBack={() => setCurrentStep(0)} />;
      case 2:
        return <RIFIntro onNext={() => setCurrentStep(3)} onBack={() => setCurrentStep(1)} />;
      case 3:
        return <SimplifiedPhotosStep onNext={handlePhotosNext} onSkip={skipToNext} />;
      case 4:
        return <SimplifiedBioStep onNext={handleBioNext} onBack={() => goBack(3)} onSkip={skipToNext} />;
      case 5:
        return <SimplifiedInterestsStep onNext={handleInterestsNext} onBack={() => goBack(4)} onSkip={skipToNext} />;
      case 6:
        return <LocationStep onNext={handleLocationNext} onBack={() => goBack(5)} onSkip={skipToNext} />;
      case 7:
        return <SimplifiedIdentityStep onNext={handleIdentityNext} onBack={() => goBack(6)} onSkip={skipToNext} />;
      case 8:
        return <RelationshipGoalsStep onNext={handleGoalsNext} onBack={() => goBack(7)} onSkip={skipToNext} />;
      case 9:
        return <DatingStyleQuiz onComplete={handleDatingStyleComplete} onSkip={skipToNext} />;
      case 10:
        return <RIFComplete onComplete={onComplete} />;
      default:
        return <OnboardingWelcome onNext={() => setCurrentStep(1)} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderStep()}
    </div>
  );
};
