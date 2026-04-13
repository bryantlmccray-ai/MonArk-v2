import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface RIFProfile {
  id: string;
  user_id: string;
  // Raw stored values (DECIMAL 3,2 — range 0.00 to 9.99)
  intent_clarity: number;
  pacing_preferences: number;
  emotional_readiness: number;
  boundary_respect: number;
  post_date_alignment: number;
  profile_version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Normalised 0-100 scores (multiply raw × 10, clamped)
  intent_clarity_pct: number;
  pacing_preferences_pct: number;
  emotional_readiness_pct: number;
  boundary_respect_pct: number;
  post_date_alignment_pct: number;
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

// Normalise a stored DECIMAL(3,2) RIF value to a 0–100 display percentage
// The DB column stores 0.00–9.99, so × 10 gives the 0–100 range.
// We also handle legacy data: if the raw value > 10, assume it was already
// stored in the 0–100 range (pre-fix data) and use it directly.
export function normalizeRIFScore(raw: number): number {
  if (raw == null) return 0;
  if (raw > 10) return Math.min(100, Math.round(raw)); // legacy 0-100 storage
  return Math.min(100, Math.round(raw * 10));           // new DECIMAL(3,2) storage
}

function attachNormalized(profile: Omit<RIFProfile, 'intent_clarity_pct' | 'pacing_preferences_pct' | 'emotional_readiness_pct' | 'boundary_respect_pct' | 'post_date_alignment_pct'>): RIFProfile {
  return {
    ...profile,
    intent_clarity_pct: normalizeRIFScore(profile.intent_clarity),
    pacing_preferences_pct: normalizeRIFScore(profile.pacing_preferences),
    emotional_readiness_pct: normalizeRIFScore(profile.emotional_readiness),
    boundary_respect_pct: normalizeRIFScore(profile.boundary_respect),
    post_date_alignment_pct: normalizeRIFScore(profile.post_date_alignment),
  };
}

export const useRIF = () => {
  const [rifProfile, setRifProfile] = useState<RIFProfile | null>(null);
  const [rifSettings, setRifSettings] = useState<RIFSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, isDemoMode } = useAuth();

  useEffect(() => {
    loadRIFData();
  }, [user?.id, isDemoMode]);

  const loadRIFData = async () => {
    if (isDemoMode) {
      setRifProfile(null);
      setRifSettings(null);
      setLoading(false);
      return;
    }

    try {
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !authUser) {
        setLoading(false);
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('rif_profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .eq('is_active', true)
        .maybeSingle();

      if (profileError) console.error('Error loading RIF profile:', profileError);

      const { data: settingsData, error: settingsError } = await supabase
        .from('rif_settings')
        .select('*')
        .eq('user_id', authUser.id)
        .maybeSingle();

      if (settingsError) console.error('Error loading RIF settings:', settingsError);

      setRifProfile(profileData ? attachNormalized(profileData) : null);
      setRifSettings(settingsData);
    } catch (error) {
      console.error('Exception loading RIF data:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitFeedback = async (type: string, data: any) => {
    if (isDemoMode) return;
    try {
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !authUser) throw new Error('Not authenticated');

      const encryptedData = { type, timestamp: new Date().toISOString(), responses: data, encrypted: true };
      const { error: insertError } = await supabase
        .from('rif_feedback')
        .insert({ user_id: authUser.id, feedback_type: type, data: encryptedData });

      if (insertError) throw insertError;

      if (['post_date', 'behavioral'].includes(type)) {
        await processRIFFeedback();
      }
      await loadRIFData();
    } catch (error: any) {
      console.error('Error submitting RIF feedback:', error);
      if (error.message?.includes('Failed to fetch')) return;
      throw error;
    }
  };

  const processRIFFeedback = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase.functions.invoke('rif-engine', {
        body: { action: 'process_feedback', data: { user_id: user.id } },
      });
      if (error) console.error('Error processing RIF feedback:', error);
    } catch (error) {
      console.error('Error calling RIF engine:', error);
    }
  };

  const calculateCompatibility = async (matchUserId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await supabase.functions.invoke('rif-engine', {
        body: { action: 'calculate_compatibility', data: { match_user_id: matchUserId } },
      });
      if (error) { console.error('Error calculating compatibility:', error); return null; }
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
        .update({ ...newSettings, last_consent_update: new Date().toISOString() })
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
    reload: loadRIFData,
  };
};
