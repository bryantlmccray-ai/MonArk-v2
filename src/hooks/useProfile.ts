
import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { withRetry } from '@/utils/retryUtils';
import { queryKeys } from '@/lib/queryKeys';
import type { Database } from '@/integrations/supabase/types';

type GenderIdentity = Database['public']['Enums']['gender_identity'];
type SexualOrientation = Database['public']['Enums']['sexual_orientation'];

export interface UserProfile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
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
  onboarding_step: number | null;
  rif_quiz_answers: any | null;
  created_at: string;
  updated_at: string;
}

// Demo profile for testing
const createDemoProfile = (userId: string): UserProfile => ({
  id: 'demo-profile-id',
  user_id: userId,
  bio: null,
  age: null,
  location: null,
  interests: [],
  photos: [],
  date_preferences: {},
  is_profile_complete: false,
  location_data: null,
  location_consent: false,
  show_location_on_profile: true,
  gender_identity: null,
  gender_identity_custom: null,
  sexual_orientation: null,
  sexual_orientation_custom: null,
  preference_to_see: [],
  preference_to_be_seen_by: [],
  discovery_privacy_mode: 'open',
  identity_visibility: true,
  last_preference_update: new Date().toISOString(),
  date_of_birth: null,
  age_verified: true,
  age_verification_timestamp: new Date().toISOString(),
  relationship_goals: null,
  occupation: null,
  education_level: null,
  exercise_habits: null,
  smoking_status: null,
  drinking_status: null,
  height_cm: null,
  onboarding_step: 0,
  rif_quiz_answers: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

async function fetchProfileFromDb(userId: string): Promise<UserProfile | null> {
  const operation = async () => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  };

  return withRetry(operation, { maxRetries: 2, baseDelay: 1000 });
}

export const useProfile = () => {
  const { user, isDemoMode } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile = null, isLoading: loading } = useQuery({
    queryKey: queryKeys.profile.byUser(user?.id ?? ''),
    queryFn: () => {
      if (isDemoMode) return null; // Let onboarding handle demo profiles
      return fetchProfileFromDb(user!.id);
    },
    enabled: !!user && !isDemoMode,
    staleTime: 30_000, // 30s — profile doesn't change often
    retry: 2,
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      if (!user) throw new Error('No authenticated user');

      if (isDemoMode) {
        return updates; // handled optimistically below
      }

      const updateData: any = { ...updates };
      delete updateData.id;
      delete updateData.created_at;

      // Check if profile exists
      const { data: existing, error: fetchError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('[useProfile] Error checking existing profile:', fetchError);
        throw fetchError;
      }

      if (!existing) {
        console.log('[useProfile] No existing profile, inserting new one');
        const { error } = await supabase
          .from('user_profiles')
          .insert({ user_id: user.id, ...updateData });
        if (error) {
          console.error('[useProfile] Insert error:', error);
          throw error;
        }
      } else {
        console.log('[useProfile] Updating existing profile, is_profile_complete:', updateData.is_profile_complete);
        const { error } = await supabase
          .from('user_profiles')
          .update({ ...updateData, updated_at: new Date().toISOString() })
          .eq('user_id', user.id);
        if (error) {
          console.error('[useProfile] Update error:', error);
          throw error;
        }
      }

      return updates;
    },
    onMutate: async (updates) => {
      // Optimistic update
      if (isDemoMode && user) {
        queryClient.setQueryData(
          queryKeys.profile.byUser(user.id),
          (old: UserProfile | null) =>
            old
              ? { ...old, ...updates, updated_at: new Date().toISOString() }
              : createDemoProfile(user.id)
        );
      }
    },
    onSuccess: () => {
      if (user) {
        // Invalidate profile — all consumers auto-refresh
        queryClient.invalidateQueries({ queryKey: queryKeys.profile.byUser(user.id) });
        // Matches may need re-evaluation after profile changes
        queryClient.invalidateQueries({ queryKey: queryKeys.curatedMatches.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.datingPool.all });
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: async (profileData: Partial<UserProfile>) => {
      if (!user) throw new Error('No authenticated user');

      if (isDemoMode) {
        return { ...createDemoProfile(user.id), ...profileData };
      }

      const createData: any = { user_id: user.id, ...profileData };
      delete createData.id;
      delete createData.created_at;
      delete createData.updated_at;

      const { error } = await supabase.from('user_profiles').insert(createData);
      if (error) throw error;

      return createData;
    },
    onSuccess: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: queryKeys.profile.byUser(user.id) });
      }
    },
  });

  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>): Promise<boolean> => {
      try {
        await updateMutation.mutateAsync(updates);
        return true;
      } catch (error) {
        console.error('Error updating profile:', error);
        return false;
      }
    },
    [updateMutation]
  );

  const createProfile = useCallback(
    async (profileData: Partial<UserProfile>): Promise<boolean> => {
      try {
        await createMutation.mutateAsync(profileData);
        return true;
      } catch (error) {
        console.error('Error creating profile:', error);
        return false;
      }
    },
    [createMutation]
  );

  const refetchProfile = useCallback(async () => {
    if (user) {
      await queryClient.refetchQueries({ queryKey: queryKeys.profile.byUser(user.id) });
    }
  }, [user, queryClient]);

  return {
    profile,
    loading,
    updateProfile,
    createProfile,
    refetchProfile,
  };
};
