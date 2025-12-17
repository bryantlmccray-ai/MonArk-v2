
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { withRetry } from '@/utils/retryUtils';
import type { Database } from '@/integrations/supabase/types';

type GenderIdentity = Database['public']['Enums']['gender_identity'];
type SexualOrientation = Database['public']['Enums']['sexual_orientation'];

export interface UserProfile {
  id: string;
  user_id: string;
  bio: string | null;
  age: number | null;
  location: string | null;
  interests: string[];
  photos: string[];
  date_preferences: any;
  is_profile_complete: boolean;
  location_data: any;
  location_consent: boolean;
  show_location_on_profile: boolean;
  gender_identity: GenderIdentity | null;
  gender_identity_custom: string | null;
  sexual_orientation: SexualOrientation | null;
  sexual_orientation_custom: string | null;
  preference_to_see: string[];
  preference_to_be_seen_by: string[];
  discovery_privacy_mode: string;
  identity_visibility: boolean;
  last_preference_update: string;
  date_of_birth: string | null;
  age_verified: boolean | null;
  age_verification_timestamp: string | null;
  relationship_goals: string[] | null;
  occupation: string | null;
  education_level: string | null;
  exercise_habits: string | null;
  smoking_status: string | null;
  drinking_status: string | null;
  height_cm: number | null;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching profile for user:', user.id);
      
      // Use retry logic for network requests
      const operation = async () => {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          throw error;
        }
        
        return data;
      };

      const data = await withRetry(operation, { maxRetries: 2, baseDelay: 1000 });

      if (!data) {
        console.log('No profile found for user:', user.id);
        setProfile(null);
      } else {
        console.log('Profile fetched:', data?.id);
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Don't crash the app, just set profile to null
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
    if (!user) {
      console.error('No authenticated user');
      return false;
    }

    try {
      console.log('Updating profile for user:', user.id);
      
      // Check if profile exists first
      const { data: existingProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Error checking existing profile:', fetchError);
        return false;
      }

      // Prepare the update data with proper typing
      const updateData: any = {
        ...updates,
      };

      // Remove fields that shouldn't be updated directly
      delete updateData.id;
      delete updateData.created_at;

      if (!existingProfile) {
        // Profile doesn't exist, create it
        console.log('Creating new profile');
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: user.id,
            ...updateData,
          });

        if (insertError) {
          console.error('Error creating profile:', insertError);
          return false;
        }
      } else {
        // Profile exists, update it
        console.log('Updating existing profile');
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({
            ...updateData,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);

        if (updateError) {
          console.error('Error updating profile:', updateError);
          return false;
        }
      }

      // Refresh profile data
      await fetchProfile();
      return true;
    } catch (error) {
      console.error('Exception in updateProfile:', error);
      return false;
    }
  };

  const createProfile = async (profileData: Partial<UserProfile>): Promise<boolean> => {
    if (!user) {
      console.error('No authenticated user for profile creation');
      return false;
    }

    try {
      console.log('Creating profile for user:', user.id);
      
      // Prepare the profile data with proper typing
      const createData: any = {
        user_id: user.id,
        ...profileData,
      };

      // Remove fields that shouldn't be set directly
      delete createData.id;
      delete createData.created_at;
      delete createData.updated_at;

      const { error } = await supabase
        .from('user_profiles')
        .insert(createData);

      if (error) {
        console.error('Error creating profile:', error);
        return false;
      }

      await fetchProfile();
      return true;
    } catch (error) {
      console.error('Exception creating profile:', error);
      return false;
    }
  };

  useEffect(() => {
    let mounted = true;
    
    const fetchProfileIfNeeded = async () => {
      if (!user) {
        if (mounted) {
          setProfile(null);
          setLoading(false);
        }
        return;
      }

      // Avoid refetching if we already have a profile for this user
      if (profile && profile.user_id === user.id) {
        if (mounted) {
          setLoading(false);
        }
        return;
      }

      await fetchProfile();
    };

    fetchProfileIfNeeded();

    return () => {
      mounted = false;
    };
  }, [user?.id]); // Only depend on user.id, not the entire user object

  return {
    profile,
    loading,
    updateProfile,
    createProfile,
    refetchProfile: fetchProfile,
  };
};
