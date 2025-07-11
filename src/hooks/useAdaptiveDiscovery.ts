import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface JourneyStage {
  id: string;
  user_id: string;
  stage: 'single' | 'dating' | 'exploring' | 'committed' | 'healing' | 'growth';
  stage_start_date: string;
  stage_end_date?: string;
  transition_reason?: string;
  stage_data: any;
}

export interface RelationshipOutcome {
  id?: string;
  user_id: string;
  match_user_id?: string;
  relationship_type: 'casual' | 'serious' | 'hookup' | 'friendship';
  outcome: 'ongoing' | 'ended_mutual' | 'ended_user' | 'ended_partner' | 'ghosted';
  duration_days?: number;
  satisfaction_rating?: number;
  what_worked?: string[];
  what_didnt_work?: string[];
  lessons_learned?: string;
  would_date_similar?: boolean;
}

export interface AdaptiveInsight {
  id: string;
  user_id: string;
  insight_type: 'pattern_recognition' | 'preference_shift' | 'growth_opportunity';
  insight_title: string;
  insight_content: string;
  actionable_suggestions: string[];
  confidence_level: number;
  delivered: boolean;
  engaged: boolean;
  dismissed: boolean;
  created_at: string;
}

export const useAdaptiveDiscovery = () => {
  const [currentJourneyStage, setCurrentJourneyStage] = useState<JourneyStage | null>(null);
  const [insights, setInsights] = useState<AdaptiveInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingUpdate, setProcessingUpdate] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadAdaptiveData();
    }
  }, [user]);

  const loadAdaptiveData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load current journey stage
      const { data: stageData } = await supabase
        .from('user_journey_stages')
        .select('*')
        .eq('user_id', user.id)
        .is('stage_end_date', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      setCurrentJourneyStage(stageData as JourneyStage);

      // Load undelivered insights
      const { data: insightsData } = await supabase
        .from('adaptive_insights')
        .select('*')
        .eq('user_id', user.id)
        .eq('delivered', false)
        .order('created_at', { ascending: false });

      setInsights((insightsData || []) as AdaptiveInsight[]);

    } catch (error) {
      console.error('Error loading adaptive data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateJourneyStage = async (newStage: JourneyStage['stage'], reason?: string) => {
    if (!user) return;

    try {
      setProcessingUpdate(true);

      const { data } = await supabase.functions.invoke('adaptive-discovery-engine', {
        body: {
          action: 'update_journey_stage',
          data: {
            user_id: user.id,
            new_stage: newStage,
            reason
          }
        }
      });

      if (data?.success) {
        await loadAdaptiveData();
        return data.data;
      } else {
        throw new Error(data?.error || 'Failed to update journey stage');
      }
    } catch (error) {
      console.error('Error updating journey stage:', error);
      throw error;
    } finally {
      setProcessingUpdate(false);
    }
  };

  const recordRelationshipOutcome = async (outcome: Omit<RelationshipOutcome, 'user_id'>) => {
    if (!user) return;

    try {
      setProcessingUpdate(true);

      const { data } = await supabase.functions.invoke('adaptive-discovery-engine', {
        body: {
          action: 'record_relationship_outcome',
          data: {
            ...outcome,
            user_id: user.id
          }
        }
      });

      if (data?.success) {
        await loadAdaptiveData();
        return data.data;
      } else {
        throw new Error(data?.error || 'Failed to record relationship outcome');
      }
    } catch (error) {
      console.error('Error recording relationship outcome:', error);
      throw error;
    } finally {
      setProcessingUpdate(false);
    }
  };

  const triggerPatternAnalysis = async () => {
    if (!user) return;

    try {
      setProcessingUpdate(true);

      const { data } = await supabase.functions.invoke('adaptive-discovery-engine', {
        body: {
          action: 'analyze_behavioral_patterns',
          data: { user_id: user.id }
        }
      });

      if (data?.success) {
        await loadAdaptiveData();
        return data.data;
      } else {
        throw new Error(data?.error || 'Failed to analyze patterns');
      }
    } catch (error) {
      console.error('Error analyzing patterns:', error);
      throw error;
    } finally {
      setProcessingUpdate(false);
    }
  };

  const generateInsights = async () => {
    if (!user) return;

    try {
      setProcessingUpdate(true);

      const { data } = await supabase.functions.invoke('adaptive-discovery-engine', {
        body: {
          action: 'generate_adaptive_insights',
          data: { user_id: user.id }
        }
      });

      if (data?.success) {
        await loadAdaptiveData();
        return data.data;
      } else {
        throw new Error(data?.error || 'Failed to generate insights');
      }
    } catch (error) {
      console.error('Error generating insights:', error);
      throw error;
    } finally {
      setProcessingUpdate(false);
    }
  };

  const markInsightAsDelivered = async (insightId: string) => {
    try {
      await supabase
        .from('adaptive_insights')
        .update({ delivered: true })
        .eq('id', insightId);

      setInsights(prev => prev.filter(insight => insight.id !== insightId));
    } catch (error) {
      console.error('Error marking insight as delivered:', error);
    }
  };

  const markInsightAsEngaged = async (insightId: string) => {
    try {
      await supabase
        .from('adaptive_insights')
        .update({ engaged: true })
        .eq('id', insightId);
    } catch (error) {
      console.error('Error marking insight as engaged:', error);
    }
  };

  const dismissInsight = async (insightId: string) => {
    try {
      await supabase
        .from('adaptive_insights')
        .update({ dismissed: true })
        .eq('id', insightId);

      setInsights(prev => prev.filter(insight => insight.id !== insightId));
    } catch (error) {
      console.error('Error dismissing insight:', error);
    }
  };

  const updateDiscoveryPreferences = async () => {
    if (!user) return;

    try {
      const { data } = await supabase.functions.invoke('adaptive-discovery-engine', {
        body: {
          action: 'update_discovery_preferences',
          data: { user_id: user.id }
        }
      });

      return data?.data;
    } catch (error) {
      console.error('Error updating discovery preferences:', error);
      throw error;
    }
  };

  // Auto-trigger pattern analysis periodically
  useEffect(() => {
    if (user && !loading) {
      const interval = setInterval(() => {
        triggerPatternAnalysis();
      }, 24 * 60 * 60 * 1000); // Daily analysis

      return () => clearInterval(interval);
    }
  }, [user, loading]);

  return {
    currentJourneyStage,
    insights,
    loading,
    processingUpdate,
    updateJourneyStage,
    recordRelationshipOutcome,
    triggerPatternAnalysis,
    generateInsights,
    markInsightAsDelivered,
    markInsightAsEngaged,
    dismissInsight,
    updateDiscoveryPreferences,
    refetch: loadAdaptiveData
  };
};