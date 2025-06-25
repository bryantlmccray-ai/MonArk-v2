
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load RIF profile
      const { data: profileData } = await supabase
        .from('rif_profiles')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      // Load RIF settings
      const { data: settingsData } = await supabase
        .from('rif_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setRifProfile(profileData);
      setRifSettings(settingsData);
    } catch (error) {
      console.error('Error loading RIF data:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitFeedback = async (type: string, data: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const encryptedData = {
        type,
        timestamp: new Date().toISOString(),
        responses: data,
        encrypted: true
      };

      await supabase
        .from('rif_feedback')
        .insert({
          user_id: user.id,
          feedback_type: type,
          data: encryptedData
        });

      // Reload profile after feedback
      await loadRIFData();
    } catch (error) {
      console.error('Error submitting RIF feedback:', error);
      throw error;
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
    reload: loadRIFData
  };
};
