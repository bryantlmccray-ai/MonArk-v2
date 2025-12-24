
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

export interface StepCompletionStatus {
  bio: boolean;
  interests: boolean;
  photos: boolean;
  lifestyle: boolean;
  datePalette: boolean;
  identityPreferences: boolean;
}

export interface StepRequirements {
  bio: 'optional';
  interests: 'important';
  photos: 'important'; 
  lifestyle: 'optional';
  datePalette: 'optional';
  identityPreferences: 'critical';
}

export const ProfileCreation: React.FC<ProfileCreationProps> = ({ onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(-1); // -1 means not initialized yet
  const { profile, updateProfile, loading } = useProfile();
  const { toast } = useToast();
  const [hasInitialized, setHasInitialized] = useState(false);
  
  // Track which steps have been completed vs skipped
  const [stepCompletion, setStepCompletion] = useState<StepCompletionStatus>({
    bio: false,
    interests: false,
    photos: false,
    lifestyle: false,
    datePalette: false,
    identityPreferences: false,
  });
  
  // Define step requirements (critical, important, optional)
  const stepRequirements: StepRequirements = {
    bio: 'optional',
    interests: 'important',
    photos: 'important',
    lifestyle: 'optional', 
    datePalette: 'optional',
    identityPreferences: 'critical',
  };
  
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

  // Load existing profile data and determine which steps to skip
  useEffect(() => {
    if (profile && !loading && !hasInitialized) {
      const loadedData = {
        bio: profile.bio || '',
        interests: profile.interests || [],
        photos: profile.photos || [],
        vibe: profile.date_preferences?.vibe || [],
        budget: profile.date_preferences?.budget || '$',
        timeOfDay: profile.date_preferences?.timeOfDay || [],
        activityType: profile.date_preferences?.activityType || [],
        occupation: profile.occupation || '',
        education_level: profile.education_level || '',
        relationship_goals: profile.relationship_goals || [],
        exercise_habits: profile.exercise_habits || '',
        smoking_status: profile.smoking_status || '',
        drinking_status: profile.drinking_status || '',
        height_cm: profile.height_cm || null,
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
      };
      
      setProfileData(prev => ({ ...prev, ...loadedData }));
      
      // Check which steps have data from onboarding and mark as complete
      const newStepCompletion: StepCompletionStatus = {
        bio: !!(loadedData.bio || loadedData.occupation),
        interests: loadedData.interests.length >= 3,
        photos: loadedData.photos.length > 0,
        lifestyle: !!(loadedData.occupation && loadedData.relationship_goals.length > 0),
        datePalette: loadedData.vibe.length > 0 || loadedData.activityType.length > 0,
        identityPreferences: !!(loadedData.identityPreferences.genderIdentity && loadedData.identityPreferences.sexualOrientation),
      };
      
      setStepCompletion(newStepCompletion);
      
      // Find the first incomplete step, or go to review if all are done
      const stepKeys: (keyof StepCompletionStatus)[] = ['bio', 'interests', 'photos', 'lifestyle', 'datePalette', 'identityPreferences'];
      const firstIncompleteIndex = stepKeys.findIndex(key => !newStepCompletion[key]);
      
      // If identity is complete (the critical step), go straight to review
      // Otherwise, start at the first incomplete step or step 0
      if (newStepCompletion.identityPreferences) {
        setCurrentStep(6); // Review step
      } else if (firstIncompleteIndex !== -1) {
        setCurrentStep(firstIncompleteIndex);
      } else {
        setCurrentStep(0);
      }
      
      setHasInitialized(true);
    } else if (!loading && !profile && !hasInitialized) {
      // No profile data, start from beginning
      setCurrentStep(0);
      setHasInitialized(true);
    }
  }, [profile, loading, hasInitialized]);

  const updateProfileData = (data: Partial<ProfileData>) => {
    setProfileData(prev => ({ ...prev, ...data }));
  };
  
  const markStepCompleted = (stepKey: keyof StepCompletionStatus) => {
    setStepCompletion(prev => ({ ...prev, [stepKey]: true }));
  };
  
  const markStepSkipped = (stepKey: keyof StepCompletionStatus) => {
    setStepCompletion(prev => ({ ...prev, [stepKey]: false }));
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
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
        // Set default age if not set (for profiles that bypassed age verification)
        age: profile?.age || 25,
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

  if (loading || currentStep === -1) {
    return (
      <div className="min-h-screen bg-jet-black flex items-center justify-center">
        <div className="text-white text-lg">Loading profile...</div>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <BioStep 
            profileData={profileData} 
            updateData={updateProfileData} 
            onNext={() => { markStepCompleted('bio'); nextStep(); }}
            onSkip={() => { markStepSkipped('bio'); nextStep(); }}
            onCancel={onCancel}
            stepRequirement={stepRequirements.bio}
          />
        );
      case 1:
        return (
          <InterestsStep 
            profileData={profileData} 
            updateData={updateProfileData} 
            onNext={() => { markStepCompleted('interests'); nextStep(); }}
            onSkip={() => { markStepSkipped('interests'); nextStep(); }}
            onBack={prevStep}
            stepRequirement={stepRequirements.interests}
          />
        );
      case 2:
        return (
          <PhotosStep 
            profileData={profileData} 
            updateData={updateProfileData} 
            onNext={() => { markStepCompleted('photos'); nextStep(); }}
            onSkip={() => { markStepSkipped('photos'); nextStep(); }}
            onBack={prevStep}
            stepRequirement={stepRequirements.photos}
          />
        );
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
            onNext={() => { markStepCompleted('lifestyle'); nextStep(); }}
            onSkip={() => { markStepSkipped('lifestyle'); nextStep(); }}
            onBack={() => setCurrentStep(2)}
            stepRequirement={stepRequirements.lifestyle}
          />
        );
      case 4:
        return (
          <DatePaletteStep 
            profileData={profileData} 
            updateData={updateProfileData} 
            onNext={() => { markStepCompleted('datePalette'); nextStep(); }}
            onSkip={() => { markStepSkipped('datePalette'); nextStep(); }}
            stepRequirement={stepRequirements.datePalette}
          />
        );
      case 5:
        return (
          <IdentityPreferencesStep 
            profileData={profileData} 
            updateData={updateProfileData} 
            onNext={() => { markStepCompleted('identityPreferences'); nextStep(); }}
            stepRequirement={stepRequirements.identityPreferences}
          />
        );
      case 6:
        return (
          <ProfileReviewStep 
            profileData={profileData} 
            stepCompletion={stepCompletion}
            stepRequirements={stepRequirements}
            onEdit={goToStep} 
            onComplete={handleComplete} 
          />
        );
      default:
        return (
          <BioStep 
            profileData={profileData} 
            updateData={updateProfileData} 
            onNext={() => { markStepCompleted('bio'); nextStep(); }}
            onSkip={() => { markStepSkipped('bio'); nextStep(); }}
            onCancel={onCancel}
            stepRequirement={stepRequirements.bio}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-jet-black">
      {renderStep()}
    </div>
  );
};
