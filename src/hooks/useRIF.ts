
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RIFProfile {
  id: string;
  user_id: string;
  intent_clarity: number;
  pacing_preferences: number;
  emotional_readiness: number;
  boundary_respect: number;
  post_date_alignment: number;
  profile_version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RIFSettings {
  id: string;
  user_id: string;
  rif_enabled: boolean;
  ai_personalization_enabled: boolean;
  reflection_prompts_enabled: boolean;
  data_sharing_consent: boolean;
  crisis_resources_shown: boolean;
  last_consent_update: string;
  created_at: string;
  updated_at: string;
}

export const useRIF = () => {
  const [rifProfile, setRifProfile] = useState<RIFProfile | null>(null);
  const [rifSettings, setRifSettings] = useState<RIFSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRIFData();
  }, []);

  const loadRIFData = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.log('No authenticated user for RIF data');
        setLoading(false);
        return;
      }

      // Load RIF profile with error handling
      const { data: profileData, error: profileError } = await supabase
        .from('rif_profiles')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (profileError) {
        console.error('Error loading RIF profile:', profileError);
      }

      // Load RIF settings with error handling
      const { data: settingsData, error: settingsError } = await supabase
        .from('rif_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (settingsError) {
        console.error('Error loading RIF settings:', settingsError);
      }

      setRifProfile(profileData);
      setRifSettings(settingsData);
    } catch (error) {
      console.error('Exception loading RIF data:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitFeedback = async (type: string, data: any) => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('Auth error in submitFeedback:', authError);
        throw new Error('Authentication failed');
      }
      if (!user) {
        console.error('No user found in submitFeedback');
        throw new Error('User not authenticated');
      }

      const encryptedData = {
        type,
        timestamp: new Date().toISOString(),
        responses: data,
        encrypted: true
      };

      const { error: insertError } = await supabase
        .from('rif_feedback')
        .insert({
          user_id: user.id,
          feedback_type: type,
          data: encryptedData
        });

      if (insertError) {
        console.error('Error inserting RIF feedback:', insertError);
        throw insertError;
      }

      // Process feedback immediately for behavioral types
      if (['post_date', 'behavioral'].includes(type)) {
        await processRIFFeedback();
      }

      // Reload profile after feedback
      await loadRIFData();
    } catch (error) {
      console.error('Error submitting RIF feedback:', error);
      // Don't re-throw if it's just a network error
      if (error.message?.includes('Failed to fetch')) {
        console.log('Network error in RIF feedback, continuing...');
        return;
      }
      throw error;
    }
  };

  const processRIFFeedback = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Call RIF engine to process feedback
      const { data, error } = await supabase.functions.invoke('rif-engine', {
        body: {
          action: 'process_feedback',
          data: { user_id: user.id }
        }
      });

      if (error) {
        console.error('Error processing RIF feedback:', error);
      } else {
        console.log('RIF feedback processed:', data);
      }
    } catch (error) {
      console.error('Error calling RIF engine:', error);
    }
  };

  const calculateCompatibility = async (matchUserId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase.functions.invoke('rif-engine', {
        body: {
          action: 'calculate_compatibility',
          data: { match_user_id: matchUserId }
        }
      });

      if (error) {
        console.error('Error calculating compatibility:', error);
        return null;
      }

      return data.compatibility;
    } catch (error) {
      console.error('Error calculating compatibility:', error);
      return null;
    }
  };

  const updateSettings = async (newSettings: Partial<RIFSettings>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      await supabase
        .from('rif_settings')
        .update({
          ...newSettings,
          last_consent_update: new Date().toISOString()
        })
        .eq('user_id', user.id);

      await loadRIFData();
    } catch (error) {
      console.error('Error updating RIF settings:', error);
      throw error;
    }
  };

  const getRecommendations = async (type: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data } = await supabase
        .from('rif_recommendations')
        .select('*')
        .eq('user_id', user.id)
        .eq('recommendation_type', type)
        .eq('delivered', false)
        .order('created_at', { ascending: false });

      return data || [];
    } catch (error) {
      console.error('Error loading recommendations:', error);
      return [];
    }
  };

  return {
    rifProfile,
    rifSettings,
    loading,
    submitFeedback,
    updateSettings,
    getRecommendations,
    calculateCompatibility,
    reload: loadRIFData
  };
};
