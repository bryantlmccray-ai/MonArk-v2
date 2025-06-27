
import React, { useState, useEffect } from 'react';
import { BioStep } from './BioStep';
import { InterestsStep } from './InterestsStep';
import { PhotosStep } from './PhotosStep';
import { DatePaletteStep } from './DatePaletteStep';
import { ProfileReviewStep } from './ProfileReviewStep';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';

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
  const { profile, updateProfile, loading } = useProfile();
  const { toast } = useToast();
  
  const [profileData, setProfileData] = useState<ProfileData>({
    bio: '',
    interests: [],
    photos: [],
    vibe: [],
    budget: '$',
    timeOfDay: [],
    activityType: [],
  });

  // Load existing profile data if available
  useEffect(() => {
    if (profile && !loading) {
      setProfileData(prev => ({
        ...prev,
        bio: profile.bio || '',
        interests: profile.interests || [],
        photos: profile.photos || [],
        vibe: profile.date_preferences?.vibe || [],
        budget: profile.date_preferences?.budget || '$',
        timeOfDay: profile.date_preferences?.timeOfDay || [],
        activityType: profile.date_preferences?.activityType || [],
      }));
    }
  }, [profile, loading]);

  const updateProfileData = (data: Partial<ProfileData>) => {
    setProfileData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  const handleComplete = async () => {
    try {
      // Save complete profile to database
      const success = await updateProfile({
        bio: profileData.bio,
        interests: profileData.interests,
        photos: profileData.photos,
        date_preferences: {
          vibe: profileData.vibe,
          budget: profileData.budget,
          timeOfDay: profileData.timeOfDay,
          activityType: profileData.activityType,
        },
        is_profile_complete: true,
      });

      if (success) {
        toast({
          title: "Profile completed!",
          description: "Your profile has been saved successfully.",
        });
        onComplete();
      } else {
        toast({
          title: "Save failed",
          description: "There was an error saving your profile. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Save failed",
        description: "There was an error saving your profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-jet-black flex items-center justify-center">
        <div className="text-white text-lg">Loading profile...</div>
      </div>
    );
  }

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
        return <ProfileReviewStep profileData={profileData} onEdit={goToStep} onComplete={handleComplete} />;
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
