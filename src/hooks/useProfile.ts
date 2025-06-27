
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

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
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('No profile found for user:', user.id);
          setProfile(null);
        } else {
          console.error('Error fetching profile:', error);
        }
        return;
      }

      console.log('Profile fetched:', data?.id);
      setProfile(data);
    } catch (error) {
      console.error('Exception fetching profile:', error);
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
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error checking existing profile:', fetchError);
        return false;
      }

      if (!existingProfile) {
        // Profile doesn't exist, create it
        console.log('Creating new profile');
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: user.id,
            ...updates,
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
            ...updates,
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
      const { error } = await supabase
        .from('user_profiles')
        .insert({
          user_id: user.id,
          ...profileData,
        });

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
    fetchProfile();
  }, [user]);

  return {
    profile,
    loading,
    updateProfile,
    createProfile,
    refetchProfile: fetchProfile,
  };
};
