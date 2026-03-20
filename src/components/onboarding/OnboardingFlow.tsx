import React, { useState, useEffect } from 'react';
import { OnboardingWelcome } from './OnboardingWelcome';
import { OnboardingDifference } from './OnboardingDifference';
import { RIFIntro } from './RIFIntro';
import RIFQuiz, { type RIFScores } from './RIFQuiz';
import { SimplifiedPhotosStep } from './SimplifiedPhotosStep';
import { SimplifiedBioStep } from './SimplifiedBioStep';
import { SimplifiedInterestsStep } from './SimplifiedInterestsStep';
import { LocationStep } from './LocationStep';
import { SimplifiedIdentityStep } from './SimplifiedIdentityStep';
import { RelationshipGoalsStep } from './RelationshipGoalsStep';
import { RIFComplete } from './RIFComplete';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
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
// 3: RIF Quiz (15-question assessment)
// 4: Photos (min 2)
// 5: Bio & Occupation
// 6: Interests Selection
// 7: Location
// 8: Identity & Orientation
// 9: Relationship Goals
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

  // Resume from saved step if user returns to onboarding
  useEffect(() => {
    if (profile?.onboarding_step && profile.onboarding_step > 0 && profile.onboarding_step < 10) {
      setCurrentStep(profile.onboarding_step);
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

  // Save progress when step changes (for screens 4+ where profile data is collected)
  const saveProgress = async (step: number, data?: Partial<OnboardingData>) => {
    if (step < 4) return; // Don't save progress for intro/quiz screens
    
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

  const skipToNext = () => {
    if (currentStep < 10) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      saveProgress(nextStep);
    }
  };

  const handleRIFQuizComplete = async (scores: RIFScores) => {
    setOnboardingData(prev => ({ ...prev, rifScores: scores }));
    // RIFQuiz component already saves scores to DB — just advance
    setCurrentStep(4);
  };

  const handlePhotosNext = async (photos: string[]) => {
    const updatedData = { ...onboardingData, photos };
    setOnboardingData(updatedData);
    setCurrentStep(5);
    await saveProgress(5, { photos });
  };

  const handleBioNext = async (data: { bio: string; occupation: string }) => {
    const updatedData = { ...onboardingData, bio: data.bio, occupation: data.occupation };
    setOnboardingData(updatedData);
    setCurrentStep(6);
    await saveProgress(6, { bio: data.bio, occupation: data.occupation });
  };

  const handleInterestsNext = async (interests: string[]) => {
    const updatedData = { ...onboardingData, interests };
    setOnboardingData(updatedData);
    setCurrentStep(7);
    await saveProgress(7, { interests });
  };

  const handleLocationNext = async (location: string) => {
    const updatedData = { ...onboardingData, location };
    setOnboardingData(updatedData);
    setCurrentStep(8);
    await saveProgress(8, { location });
  };

  const handleIdentityNext = async (data: { genderIdentity: string; sexualOrientation: string }) => {
    const updatedData = { ...onboardingData, ...data };
    setOnboardingData(updatedData);
    setCurrentStep(9);
    await saveProgress(9, data);
  };

  const handleGoalsNext = async (goals: string[]) => {
    const updatedData = { ...onboardingData, relationshipGoals: goals };
    setOnboardingData(updatedData);
    
    try {
      await updateProfile({
        relationship_goals: goals,
        onboarding_step: 10,
        is_profile_complete: true,
      });
    } catch (error) {
      console.error('Error completing profile:', error);
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
        return <RIFQuiz userId={profile?.user_id || ''} onComplete={handleRIFQuizComplete} onSkip={skipToNext} />;
      case 4:
        return <SimplifiedPhotosStep onNext={handlePhotosNext} onSkip={skipToNext} />;
      case 5:
        return <SimplifiedBioStep onNext={handleBioNext} onBack={() => goBack(4)} onSkip={skipToNext} />;
      case 6:
        return <SimplifiedInterestsStep onNext={handleInterestsNext} onBack={() => goBack(5)} onSkip={skipToNext} />;
      case 7:
        return <LocationStep onNext={handleLocationNext} onBack={() => goBack(6)} onSkip={skipToNext} />;
      case 8:
        return <SimplifiedIdentityStep onNext={handleIdentityNext} onBack={() => goBack(7)} onSkip={skipToNext} />;
      case 9:
        return <RelationshipGoalsStep onNext={handleGoalsNext} onBack={() => goBack(8)} onSkip={skipToNext} />;
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
