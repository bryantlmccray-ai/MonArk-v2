
import React, { useState, useEffect } from 'react';
import { BioStep } from './BioStep';
import { InterestsStep } from './InterestsStep';
import { PhotosStep } from './PhotosStep';
import { LifestyleStep } from './LifestyleStep';
import { DatePaletteStep } from './DatePaletteStep';
import { IdentityPreferencesStep } from './IdentityPreferencesStep';
import { ProfileReviewStep } from './ProfileReviewStep';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';

interface ProfileCreationProps {
  onComplete: () => void;
  onCancel?: () => void;
}

export interface ProfileData {
  bio: string;
  interests: string[];
  photos: string[];
  vibe: string[];
  budget: string;
  timeOfDay: string[];
  activityType: string[];
  // Lifestyle fields
  occupation: string;
  education_level: string;
  relationship_goals: string[];
  exercise_habits: string;
  smoking_status: string;
  drinking_status: string;
  height_cm: number | null;
  identityPreferences?: {
    genderIdentity: string;
    genderIdentityCustom?: string;
    sexualOrientation: string;
    sexualOrientationCustom?: string;
    preferenceToSee: string[];
    preferenceToBeSeenBy: string[];
    discoveryPrivacyMode: string;
    identityVisibility: boolean;
  };
}

export const ProfileCreation: React.FC<ProfileCreationProps> = ({ onComplete, onCancel }) => {
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
    // Initialize lifestyle fields
    occupation: '',
    education_level: '',
    relationship_goals: [],
    exercise_habits: '',
    smoking_status: '',
    drinking_status: '',
    height_cm: null,
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
        // Load lifestyle fields (with type casting until types are regenerated)
        occupation: (profile as any).occupation || '',
        education_level: (profile as any).education_level || '',
        relationship_goals: (profile as any).relationship_goals || [],
        exercise_habits: (profile as any).exercise_habits || '',
        smoking_status: (profile as any).smoking_status || '',
        drinking_status: (profile as any).drinking_status || '',
        height_cm: (profile as any).height_cm || null,
        identityPreferences: {
          genderIdentity: profile.gender_identity || '',
          genderIdentityCustom: profile.gender_identity_custom || '',
          sexualOrientation: profile.sexual_orientation || '',
          sexualOrientationCustom: profile.sexual_orientation_custom || '',
          preferenceToSee: profile.preference_to_see || [],
          preferenceToBeSeenBy: profile.preference_to_be_seen_by || [],
          discoveryPrivacyMode: profile.discovery_privacy_mode || 'open',
          identityVisibility: profile.identity_visibility ?? true,
        },
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
      console.log('Completing profile with data:', profileData);
      
      // Prepare the profile data for database update
      const updateData: any = {
        bio: profileData.bio,
        interests: profileData.interests,
        photos: profileData.photos,
        date_preferences: {
          vibe: profileData.vibe,
          budget: profileData.budget,
          timeOfDay: profileData.timeOfDay,
          activityType: profileData.activityType,
        },
        // Add lifestyle fields
        occupation: profileData.occupation,
        education_level: profileData.education_level,
        relationship_goals: profileData.relationship_goals,
        exercise_habits: profileData.exercise_habits,
        smoking_status: profileData.smoking_status,
        drinking_status: profileData.drinking_status,
        height_cm: profileData.height_cm,
        is_profile_complete: true,
      };

      // Add identity preferences if they exist
      if (profileData.identityPreferences) {
        const { identityPreferences } = profileData;
        updateData.gender_identity = identityPreferences.genderIdentity;
        updateData.gender_identity_custom = identityPreferences.genderIdentityCustom;
        updateData.sexual_orientation = identityPreferences.sexualOrientation;
        updateData.sexual_orientation_custom = identityPreferences.sexualOrientationCustom;
        updateData.preference_to_see = identityPreferences.preferenceToSee;
        updateData.preference_to_be_seen_by = identityPreferences.preferenceToBeSeenBy;
        updateData.discovery_privacy_mode = identityPreferences.discoveryPrivacyMode;
        updateData.identity_visibility = identityPreferences.identityVisibility;
      }

      const success = await updateProfile(updateData);

      if (success) {
        console.log('Profile completed successfully');
        toast({
          title: "Profile completed!",
          description: "Your profile has been saved successfully.",
        });
        onComplete();
      } else {
        console.error('Failed to save profile');
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
        return <BioStep profileData={profileData} updateData={updateProfileData} onNext={nextStep} onCancel={onCancel} />;
      case 1:
        return <InterestsStep profileData={profileData} updateData={updateProfileData} onNext={nextStep} onCancel={onCancel} />;
      case 2:
        return <PhotosStep profileData={profileData} updateData={updateProfileData} onNext={nextStep} onCancel={onCancel} />;
      case 3:
        return (
          <LifestyleStep 
            data={{
              occupation: profileData.occupation,
              education_level: profileData.education_level,
              relationship_goals: profileData.relationship_goals,
              exercise_habits: profileData.exercise_habits,
              smoking_status: profileData.smoking_status,
              drinking_status: profileData.drinking_status,
              height_cm: profileData.height_cm,
            }}
            onUpdate={updateProfileData}
            onNext={nextStep}
            onBack={() => setCurrentStep(2)}
            onCancel={onCancel}
          />
        );
      case 4:
        return <DatePaletteStep profileData={profileData} updateData={updateProfileData} onNext={nextStep} onCancel={onCancel} />;
      case 5:
        return <IdentityPreferencesStep profileData={profileData} updateData={updateProfileData} onNext={nextStep} onCancel={onCancel} />;
      case 6:
        return <ProfileReviewStep profileData={profileData} onEdit={goToStep} onComplete={handleComplete} onCancel={onCancel} />;
      default:
        return <BioStep profileData={profileData} updateData={updateProfileData} onNext={nextStep} onCancel={onCancel} />;
    }
  };

  return (
    <div className="min-h-screen bg-jet-black">
      {renderStep()}
    </div>
  );
};
