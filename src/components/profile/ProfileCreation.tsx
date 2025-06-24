
import React, { useState } from 'react';
import { BioStep } from './BioStep';
import { InterestsStep } from './InterestsStep';
import { PhotosStep } from './PhotosStep';
import { DatePaletteStep } from './DatePaletteStep';
import { ProfileReviewStep } from './ProfileReviewStep';

interface ProfileCreationProps {
  onComplete: () => void;
}

export interface ProfileData {
  bio: string;
  interests: string[];
  photos: string[];
  vibe: string[];
  budget: string;
  timeOfDay: string[];
  activityType: string[];
}

export const ProfileCreation: React.FC<ProfileCreationProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [profileData, setProfileData] = useState<ProfileData>({
    bio: '',
    interests: [],
    photos: [],
    vibe: [],
    budget: '$',
    timeOfDay: [],
    activityType: [],
  });

  const updateProfileData = (data: Partial<ProfileData>) => {
    setProfileData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <BioStep profileData={profileData} updateData={updateProfileData} onNext={nextStep} />;
      case 1:
        return <InterestsStep profileData={profileData} updateData={updateProfileData} onNext={nextStep} />;
      case 2:
        return <PhotosStep profileData={profileData} updateData={updateProfileData} onNext={nextStep} />;
      case 3:
        return <DatePaletteStep profileData={profileData} updateData={updateProfileData} onNext={nextStep} />;
      case 4:
        return <ProfileReviewStep profileData={profileData} onEdit={goToStep} onComplete={onComplete} />;
      default:
        return <BioStep profileData={profileData} updateData={updateProfileData} onNext={nextStep} />;
    }
  };

  return (
    <div className="min-h-screen bg-jet-black">
      {renderStep()}
    </div>
  );
};
