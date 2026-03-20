import React, { useState, useEffect } from 'react';
import { OnboardingWelcome } from './OnboardingWelcome';
import { OnboardingDifference } from './OnboardingDifference';
import { RIFIntro } from './RIFIntro';
import { SimplifiedPhotosStep } from './SimplifiedPhotosStep';
import { SimplifiedBioStep } from './SimplifiedBioStep';
import { SimplifiedInterestsStep } from './SimplifiedInterestsStep';
import { LocationStep } from './LocationStep';
import { SimplifiedIdentityStep } from './SimplifiedIdentityStep';
import { RelationshipGoalsStep } from './RelationshipGoalsStep';
import RIFQuiz, { type RIFScores } from './RIFQuiz';
import { RIFComplete } from './RIFComplete';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { useRIF } from '@/hooks/useRIF';
import { mapQuizAnswersToRIFScores } from '@/utils/rifScoreMapping';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingFlowProps {
  onComplete: () => void;
  onSkipToWaiting: () => void;
  onExit?: () => void;
  showExitButton?: boolean;
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
  rifScores?: RIFScores;
}

// Onboarding Flow (11 screens total):
// 0: Welcome Screen
// 1: Why MonArk is Different
// 2: RIF Intro
// 3: Photos (min 2)
// 4: Bio & Occupation
// 5: Interests Selection
// 6: Location
// 7: Identity & Orientation
// 8: Relationship Goals
// 9: Dating Style Quiz (RIF Assessment)
// 10: Profile Complete Screen

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, onSkipToWaiting, onExit, showExitButton = false }) => {
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
  
  const { profile, updateProfile } = useProfile();
  const { toast } = useToast();
  const { submitFeedback } = useRIF();

  // Resume from saved step if user returns to onboarding
  useEffect(() => {
    if (profile?.onboarding_step && profile.onboarding_step > 0 && profile.onboarding_step < 10) {
      setCurrentStep(profile.onboarding_step);
      // Restore saved data
      setOnboardingData({
        photos: profile.photos || [],
        bio: profile.bio || '',
        occupation: profile.occupation || '',
        interests: profile.interests || [],
        location: profile.location || '',
        genderIdentity: profile.gender_identity || '',
        sexualOrientation: profile.sexual_orientation || '',
        relationshipGoals: profile.relationship_goals || [],
      });
    }
  }, [profile?.onboarding_step]);

  // Save progress when step changes (for screens 3+)
  const saveProgress = async (step: number, data?: Partial<OnboardingData>) => {
    if (step < 3) return; // Don't save progress for intro screens
    
    try {
      await updateProfile({
        onboarding_step: step,
        ...(data?.photos && { photos: data.photos }),
        ...(data?.bio && { bio: data.bio }),
        ...(data?.occupation && { occupation: data.occupation }),
        ...(data?.interests && { interests: data.interests }),
        ...(data?.location && { location: data.location }),
        ...(data?.genderIdentity && { gender_identity: data.genderIdentity as any }),
        ...(data?.sexualOrientation && { sexual_orientation: data.sexualOrientation as any }),
        ...(data?.relationshipGoals && { relationship_goals: data.relationshipGoals }),
      });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  // Skip handlers - move to next step without saving data
  const skipToNext = () => {
    if (currentStep < 9) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      saveProgress(nextStep);
    } else if (currentStep === 9) {
      // Skip RIF quiz — go straight to complete
      setCurrentStep(10);
    }
  };

  const handlePhotosNext = async (photos: string[]) => {
    const updatedData = { ...onboardingData, photos };
    setOnboardingData(updatedData);
    setCurrentStep(4);
    await saveProgress(4, { photos });
  };

  const handleBioNext = async (data: { bio: string; occupation: string }) => {
    const updatedData = { ...onboardingData, bio: data.bio, occupation: data.occupation };
    setOnboardingData(updatedData);
    setCurrentStep(5);
    await saveProgress(5, { bio: data.bio, occupation: data.occupation });
  };

  const handleInterestsNext = async (interests: string[]) => {
    const updatedData = { ...onboardingData, interests };
    setOnboardingData(updatedData);
    setCurrentStep(6);
    await saveProgress(6, { interests });
  };

  const handleLocationNext = async (location: string) => {
    const updatedData = { ...onboardingData, location };
    setOnboardingData(updatedData);
    setCurrentStep(7);
    await saveProgress(7, { location });
  };

  const handleIdentityNext = async (data: { genderIdentity: string; sexualOrientation: string }) => {
    const updatedData = { ...onboardingData, ...data };
    setOnboardingData(updatedData);
    setCurrentStep(8);
    await saveProgress(8, data);
  };

  const handleGoalsNext = async (goals: string[]) => {
    const updatedData = { ...onboardingData, relationshipGoals: goals };
    setOnboardingData(updatedData);
    setCurrentStep(9);
    await saveProgress(9, { relationshipGoals: goals });
  };

  const handleRIFQuizComplete = async (scores: RIFScores) => {
    setOnboardingData(prev => ({ ...prev, rifScores: scores }));
    
    try {
      await updateProfile({
        onboarding_step: 10,
        is_profile_complete: true,
      });
      console.log('RIF profile created/updated successfully');
    } catch (error) {
      console.error('Error finalizing onboarding:', error);
      toast({
        title: "Couldn't save quiz results",
        description: "Don't worry, you can continue. We'll try again.",
        variant: "destructive",
      });
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
        return <RIFComplete onContinueToProfile={onComplete} onSkipProfile={onSkipToWaiting} />;
      default:
        return <OnboardingWelcome onNext={() => setCurrentStep(1)} />;
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      {showExitButton && onExit && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onExit}
          className="absolute top-4 right-4 z-50 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full"
          aria-label="Exit onboarding"
        >
          <X className="h-5 w-5" />
        </Button>
      )}
      {renderStep()}
    </div>
  );
};
