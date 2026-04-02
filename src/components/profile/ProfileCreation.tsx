
import React, { useState, useEffect, useCallback } from 'react';
import { BioStep } from './BioStep';
import { InterestsStep } from './InterestsStep';
import { PhotosStep } from './PhotosStep';
import { LifestyleStep } from './LifestyleStep';
import { DatePaletteStep } from './DatePaletteStep';
import { IdentityPreferencesStep } from './IdentityPreferencesStep';
import { ProfileReviewStep } from './ProfileReviewStep';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';

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
  bio: 'optional' | 'important';
  interests: 'optional' | 'important';
  photos: 'optional' | 'important'; 
  lifestyle: 'optional' | 'important';
  datePalette: 'optional' | 'important';
  identityPreferences: 'optional' | 'important';
}

export const ProfileCreation: React.FC<ProfileCreationProps> = ({ onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(-1);
  const { profile, updateProfile, loading } = useProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [hasInitialized, setHasInitialized] = useState(false);
  const [editingFromReview, setEditingFromReview] = useState(false);
  
  const [stepCompletion, setStepCompletion] = useState<StepCompletionStatus>({
    bio: false,
    interests: false,
    photos: false,
    lifestyle: false,
    datePalette: false,
    identityPreferences: false,
  });
  
  const stepRequirements: StepRequirements = {
    bio: 'optional',
    interests: 'optional',
    photos: 'important',
    lifestyle: 'optional', 
    datePalette: 'optional',
    identityPreferences: 'optional',
  };
  
  const [profileData, setProfileData] = useState<ProfileData>({
    bio: '',
    interests: [],
    photos: [],
    vibe: [],
    budget: '$',
    timeOfDay: [],
    activityType: [],
    occupation: '',
    education_level: '',
    relationship_goals: [],
    exercise_habits: '',
    smoking_status: '',
    drinking_status: '',
    height_cm: null,
  });

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
      
      const newStepCompletion: StepCompletionStatus = {
        bio: !!(loadedData.bio || loadedData.occupation),
        interests: loadedData.interests.length >= 3,
        photos: loadedData.photos.length > 0,
        lifestyle: !!(loadedData.occupation && loadedData.relationship_goals.length > 0),
        datePalette: loadedData.vibe.length > 0 || loadedData.activityType.length > 0,
        identityPreferences: !!(loadedData.identityPreferences.genderIdentity && loadedData.identityPreferences.sexualOrientation),
      };
      
      setStepCompletion(newStepCompletion);
      
      const stepKeys: (keyof StepCompletionStatus)[] = ['bio', 'interests', 'photos', 'lifestyle', 'datePalette', 'identityPreferences'];
      const firstIncompleteIndex = stepKeys.findIndex(key => !newStepCompletion[key]);
      
      if (newStepCompletion.photos) {
        setCurrentStep(6);
      } else if (firstIncompleteIndex !== -1) {
        setCurrentStep(firstIncompleteIndex);
      } else {
        setCurrentStep(0);
      }
      
      setHasInitialized(true);
    } else if (!loading && !profile && !hasInitialized) {
      setCurrentStep(0);
      setHasInitialized(true);
    }
  }, [profile, loading, hasInitialized]);

  // Save specific data directly to DB (avoids stale state issues)
  const saveDataToDb = useCallback(async (data: Partial<ProfileData>) => {
    try {
      const updateData: any = {};
      if (data.bio !== undefined) updateData.bio = data.bio;
      if (data.interests !== undefined) updateData.interests = data.interests;
      if (data.photos !== undefined) updateData.photos = data.photos;
      if (data.occupation !== undefined) updateData.occupation = data.occupation;
      if (data.education_level !== undefined) updateData.education_level = data.education_level;
      if (data.relationship_goals !== undefined) updateData.relationship_goals = data.relationship_goals;
      if (data.exercise_habits !== undefined) updateData.exercise_habits = data.exercise_habits;
      if (data.smoking_status !== undefined) updateData.smoking_status = data.smoking_status;
      if (data.drinking_status !== undefined) updateData.drinking_status = data.drinking_status;
      if (data.height_cm !== undefined) updateData.height_cm = data.height_cm;
      if (data.vibe !== undefined || data.budget !== undefined || data.timeOfDay !== undefined || data.activityType !== undefined) {
        updateData.date_preferences = {
          vibe: data.vibe ?? profileData.vibe,
          budget: data.budget ?? profileData.budget,
          timeOfDay: data.timeOfDay ?? profileData.timeOfDay,
          activityType: data.activityType ?? profileData.activityType,
        };
      }
      if (data.identityPreferences) {
        updateData.gender_identity = data.identityPreferences.genderIdentity;
        updateData.gender_identity_custom = data.identityPreferences.genderIdentityCustom;
        updateData.sexual_orientation = data.identityPreferences.sexualOrientation;
        updateData.sexual_orientation_custom = data.identityPreferences.sexualOrientationCustom;
        updateData.preference_to_see = data.identityPreferences.preferenceToSee;
        updateData.preference_to_be_seen_by = data.identityPreferences.preferenceToBeSeenBy;
        updateData.discovery_privacy_mode = data.identityPreferences.discoveryPrivacyMode;
        updateData.identity_visibility = data.identityPreferences.identityVisibility;
      }

      if (Object.keys(updateData).length > 0) {
        await updateProfile(updateData);
        console.log('[ProfileCreation] Auto-saved step data:', Object.keys(updateData));
      }
    } catch (e) {
      console.warn('[ProfileCreation] Auto-save failed (non-blocking):', e);
    }
  }, [profileData, updateProfile]);

  const updateProfileData = (data: Partial<ProfileData>) => {
    setProfileData(prev => ({ ...prev, ...data }));
  };
  
  const markStepCompleted = (stepKey: keyof StepCompletionStatus, freshData?: Partial<ProfileData>) => {
    setStepCompletion(prev => ({ ...prev, [stepKey]: true }));
    // Save fresh data directly instead of relying on stale profileData
    if (freshData) {
      saveDataToDb(freshData);
    }
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
    setEditingFromReview(true);
    setCurrentStep(step);
  };

  // Save current step data and return to review
  const saveAndReturn = (freshData?: Partial<ProfileData>) => {
    if (freshData) {
      setProfileData(prev => ({ ...prev, ...freshData }));
      saveDataToDb(freshData);
    }
    toast({ title: "Changes saved", description: "Your edits have been applied." });
    setEditingFromReview(false);
    setCurrentStep(6);
  };

  const cancelEditAndReturn = () => {
    setEditingFromReview(false);
    setCurrentStep(6);
  };

  const handleComplete = async () => {
    try {
      console.log('[ProfileCreation] Starting profile save...');
      const emptyToNull = (val: string) => (val && val.trim() !== '' ? val : null);
      
      const updateData: any = {
        bio: emptyToNull(profileData.bio),
        interests: profileData.interests.length > 0 ? profileData.interests : null,
        photos: profileData.photos,
        date_preferences: {
          vibe: profileData.vibe,
          budget: profileData.budget,
          timeOfDay: profileData.timeOfDay,
          activityType: profileData.activityType,
        },
        occupation: emptyToNull(profileData.occupation),
        education_level: emptyToNull(profileData.education_level),
        relationship_goals: profileData.relationship_goals.length > 0 ? profileData.relationship_goals : null,
        exercise_habits: emptyToNull(profileData.exercise_habits),
        smoking_status: emptyToNull(profileData.smoking_status),
        drinking_status: emptyToNull(profileData.drinking_status),
        height_cm: profileData.height_cm,
        age: profile?.age || 25,
        is_profile_complete: true,
      };

      if (profileData.identityPreferences?.genderIdentity) {
        const { identityPreferences } = profileData;
        updateData.gender_identity = emptyToNull(identityPreferences.genderIdentity);
        updateData.gender_identity_custom = emptyToNull(identityPreferences.genderIdentityCustom || '');
        updateData.sexual_orientation = emptyToNull(identityPreferences.sexualOrientation);
        updateData.sexual_orientation_custom = emptyToNull(identityPreferences.sexualOrientationCustom || '');
        updateData.preference_to_see = identityPreferences.preferenceToSee;
        updateData.preference_to_be_seen_by = identityPreferences.preferenceToBeSeenBy;
        updateData.discovery_privacy_mode = identityPreferences.discoveryPrivacyMode || 'open';
        updateData.identity_visibility = identityPreferences.identityVisibility;
      }

      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('user_profiles')
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('user_id', authUser.id);

      if (error) throw error;

      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.profile.byUser(currentUser.id) });
      }
      
      toast({ title: "Profile completed!", description: "Your profile has been saved successfully." });
      onComplete();
    } catch (error) {
      console.error('[ProfileCreation] Error saving profile:', error);
      toast({ title: "Save failed", description: "There was an error saving your profile. Please try again.", variant: "destructive" });
    }
  };

  if (loading || currentStep === -1) {
    return (
      <div className="h-full bg-background flex items-center justify-center">
        <div className="text-foreground text-lg">Loading profile...</div>
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
            onNext={() => { 
              markStepCompleted('bio', { bio: profileData.bio }); 
              nextStep(); 
            }}
            onSkip={() => { markStepSkipped('bio'); nextStep(); }}
            onCancel={editingFromReview ? cancelEditAndReturn : onCancel}
            stepRequirement={stepRequirements.bio}
            onSaveAndReturn={editingFromReview ? (bio: string) => {
              updateProfileData({ bio });
              markStepCompleted('bio', { bio });
              saveAndReturn({ bio });
            } : undefined}
          />
        );
      case 1:
        return (
          <InterestsStep 
            profileData={profileData} 
            updateData={updateProfileData} 
            onNext={() => { markStepCompleted('interests', { interests: profileData.interests }); nextStep(); }}
            onSkip={() => { markStepSkipped('interests'); nextStep(); }}
            onBack={prevStep}
            stepRequirement={stepRequirements.interests}
            onSaveAndReturn={editingFromReview ? () => {
              markStepCompleted('interests', { interests: profileData.interests });
              saveAndReturn({ interests: profileData.interests });
            } : undefined}
            onCancelEdit={editingFromReview ? cancelEditAndReturn : undefined}
          />
        );
      case 2:
        return (
          <PhotosStep 
            profileData={profileData} 
            updateData={updateProfileData} 
            onNext={() => { markStepCompleted('photos', { photos: profileData.photos }); nextStep(); }}
            onSkip={() => { markStepSkipped('photos'); nextStep(); }}
            onBack={prevStep}
            stepRequirement={stepRequirements.photos}
            onSaveAndReturn={editingFromReview ? () => {
              markStepCompleted('photos', { photos: profileData.photos });
              saveAndReturn({ photos: profileData.photos });
            } : undefined}
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
            onNext={() => { markStepCompleted('lifestyle', { 
              occupation: profileData.occupation, education_level: profileData.education_level,
              relationship_goals: profileData.relationship_goals, exercise_habits: profileData.exercise_habits,
              smoking_status: profileData.smoking_status, drinking_status: profileData.drinking_status,
              height_cm: profileData.height_cm,
            }); nextStep(); }}
            onSkip={() => { markStepSkipped('lifestyle'); nextStep(); }}
            onBack={() => setCurrentStep(2)}
            stepRequirement={stepRequirements.lifestyle}
            onSaveAndReturn={editingFromReview ? () => {
              const data = {
                occupation: profileData.occupation, education_level: profileData.education_level,
                relationship_goals: profileData.relationship_goals, exercise_habits: profileData.exercise_habits,
                smoking_status: profileData.smoking_status, drinking_status: profileData.drinking_status,
                height_cm: profileData.height_cm,
              };
              markStepCompleted('lifestyle', data);
              saveAndReturn(data);
            } : undefined}
          />
        );
      case 4:
        return (
          <DatePaletteStep 
            profileData={profileData} 
            updateData={updateProfileData} 
            onNext={() => { markStepCompleted('datePalette', { vibe: profileData.vibe, budget: profileData.budget, timeOfDay: profileData.timeOfDay, activityType: profileData.activityType }); nextStep(); }}
            onSkip={() => { markStepSkipped('datePalette'); nextStep(); }}
            stepRequirement={stepRequirements.datePalette}
            onSaveAndReturn={editingFromReview ? (data: Partial<ProfileData>) => {
              updateProfileData(data);
              markStepCompleted('datePalette', data);
              saveAndReturn(data);
            } : undefined}
          />
        );
      case 5:
        return (
          <IdentityPreferencesStep 
            profileData={profileData} 
            updateData={updateProfileData} 
            onNext={() => { markStepCompleted('identityPreferences', { identityPreferences: profileData.identityPreferences }); nextStep(); }}
            onSkip={() => { markStepSkipped('identityPreferences'); nextStep(); }}
            stepRequirement={stepRequirements.identityPreferences}
            onSaveAndReturn={editingFromReview ? (data: Partial<ProfileData>) => {
              updateProfileData(data);
              markStepCompleted('identityPreferences', data);
              saveAndReturn(data);
            } : undefined}
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
            onCancel={onCancel}
          />
        );
      default:
        setCurrentStep(0);
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      <div className="min-h-full">
        {renderStep()}
      </div>
    </div>
  );
};
