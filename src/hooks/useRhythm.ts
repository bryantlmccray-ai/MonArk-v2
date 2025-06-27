
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface RIFState {
  id: string;
  user_id: string;
  current_state: string;
  state_description: string | null;
  color_palette: any;
  last_updated: string;
  created_at: string;
}

export interface RIFReflection {
  id: string;
  user_id: string;
  prompt_id: string | null;
  prompt_text: string | null;
  response_text: string;
  created_at: string;
}

export interface RIFInsight {
  id: string;
  user_id: string;
  insight_type: string;
  title: string;
  content: string;
  generated_at: string;
  delivered: boolean;
  engaged: boolean;
}

export interface RIFPrompt {
  id: string;
  prompt_text: string;
  category: string;
  is_active: boolean;
  created_at: string;
}

export const useRhythm = () => {
  const [rifState, setRifState] = useState<RIFState | null>(null);
  const [insights, setInsights] = useState<RIFInsight[]>([]);
  const [reflections, setReflections] = useState<RIFReflection[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState<RIFPrompt | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchRhythmData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Fetch or create RIF state
      let { data: stateData, error: stateError } = await supabase
        .from('user_rif_state')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (stateError && stateError.code === 'PGRST116') {
        // Create initial state if doesn't exist
        const { data: newState, error: createError } = await supabase
          .from('user_rif_state')
          .insert({
            user_id: user.id,
            current_state: 'Exploring',
            state_description: 'Getting to know yourself and what you want',
            color_palette: { primary: '#3B82F6', secondary: '#93C5FD' }
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating RIF state:', createError);
        } else {
          stateData = newState;
        }
      }

      setRifState(stateData);

      // Fetch recent insights
      const { data: insightsData } = await supabase
        .from('rif_insights')
        .select('*')
        .eq('user_id', user.id)
        .order('generated_at', { ascending: false })
        .limit(3);

      setInsights(insightsData || []);

      // Fetch recent reflections
      const { data: reflectionsData } = await supabase
        .from('rif_reflections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setReflections(reflectionsData || []);

      // Get a random prompt for reflection
      const { data: promptData } = await supabase
        .from('rif_prompts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (promptData && promptData.length > 0) {
        setCurrentPrompt(promptData[0]);
      }

    } catch (error) {
      console.error('Error fetching rhythm data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveReflection = async (promptId: string | null, promptText: string | null, responseText: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('rif_reflections')
        .insert({
          user_id: user.id,
          prompt_id: promptId,
          prompt_text: promptText,
          response_text: responseText
        });

      if (error) {
        console.error('Error saving reflection:', error);
        toast.error('Failed to save reflection');
        return false;
      }

      toast.success('Reflection saved');
      await fetchRhythmData(); // Refresh data
      return true;
    } catch (error) {
      console.error('Error saving reflection:', error);
      toast.error('Failed to save reflection');
      return false;
    }
  };

  const logEvent = async (eventType: string, eventData: any = {}) => {
    if (!user) return;

    try {
      await supabase
        .from('rif_event_log')
        .insert({
          user_id: user.id,
          event_type: eventType,
          event_data: eventData
        });
    } catch (error) {
      console.error('Error logging event:', error);
    }
  };

  useEffect(() => {
    fetchRhythmData();
  }, [user]);

  return {
    rifState,
    insights,
    reflections,
    currentPrompt,
    loading,
    saveReflection,
    logEvent,
    refetch: fetchRhythmData
  };
};
