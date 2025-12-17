import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type FeelingDuring = 'energized_engaged' | 'comfortable_not_excited' | 'anxious_drained' | 'not_great_fit';
export type StandoutQuality = 'conversation_flow' | 'shared_values' | 'physical_chemistry' | 'listened_well' | 'nothing_specific';
export type NextPreference = 'similar_energy' | 'different_energy' | 'not_sure';

export interface DateReflection {
  id: string;
  user_id: string;
  partner_name: string;
  date_occurred: string;
  feeling_during: FeelingDuring;
  standout_qualities: StandoutQuality[];
  next_preference: NextPreference;
  different_energy_description?: string;
  created_at: string;
}

export interface ReflectionInsight {
  type: 'pattern' | 'preference' | 'recommendation';
  title: string;
  description: string;
  confidence: number; // 0-1
}

export const FEELING_LABELS: Record<FeelingDuring, string> = {
  energized_engaged: 'Energized and engaged',
  comfortable_not_excited: 'Comfortable but not excited',
  anxious_drained: 'A bit anxious or drained',
  not_great_fit: 'Not a great fit'
};

export const STANDOUT_LABELS: Record<StandoutQuality, string> = {
  conversation_flow: 'Great conversation flow',
  shared_values: 'Shared values/interests',
  physical_chemistry: 'Physical chemistry',
  listened_well: 'They listened well',
  nothing_specific: 'Nothing specific'
};

export const NEXT_PREFERENCE_LABELS: Record<NextPreference, string> = {
  similar_energy: 'Has similar energy to this person',
  different_energy: 'Has different energy',
  not_sure: "I'm not sure yet"
};

export function useRifBeta() {
  const { user } = useAuth();
  const [reflections, setReflections] = useState<DateReflection[]>([]);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<ReflectionInsight[]>([]);

  useEffect(() => {
    if (user) {
      fetchReflections();
    }
  }, [user]);

  useEffect(() => {
    if (reflections.length >= 3) {
      generateInsights();
    }
  }, [reflections]);

  const fetchReflections = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('date_reflections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReflections((data || []) as DateReflection[]);
    } catch (error) {
      console.error('Error fetching reflections:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveReflection = async (reflection: {
    partner_name: string;
    date_occurred?: string;
    feeling_during: FeelingDuring;
    standout_qualities: StandoutQuality[];
    next_preference: NextPreference;
    different_energy_description?: string;
  }) => {
    if (!user) throw new Error('Must be logged in');

    const { data, error } = await supabase
      .from('date_reflections')
      .insert({
        user_id: user.id,
        partner_name: reflection.partner_name,
        date_occurred: reflection.date_occurred || new Date().toISOString(),
        feeling_during: reflection.feeling_during,
        standout_qualities: reflection.standout_qualities,
        next_preference: reflection.next_preference,
        different_energy_description: reflection.different_energy_description
      })
      .select()
      .single();

    if (error) throw error;
    
    setReflections(prev => [data as DateReflection, ...prev]);
    return data as DateReflection;
  };

  const generateInsights = () => {
    if (reflections.length < 3) {
      setInsights([]);
      return;
    }

    const newInsights: ReflectionInsight[] = [];

    // Analyze feeling patterns
    const feelingCounts: Record<FeelingDuring, number> = {
      energized_engaged: 0,
      comfortable_not_excited: 0,
      anxious_drained: 0,
      not_great_fit: 0
    };
    
    reflections.forEach(r => {
      feelingCounts[r.feeling_during]++;
    });

    const dominantFeeling = Object.entries(feelingCounts)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (dominantFeeling[1] >= 2) {
      const feelingKey = dominantFeeling[0] as FeelingDuring;
      if (feelingKey === 'energized_engaged') {
        newInsights.push({
          type: 'pattern',
          title: 'High Energy Dater',
          description: `You've felt energized on ${dominantFeeling[1]} of your dates. You thrive with engaging, active connections.`,
          confidence: dominantFeeling[1] / reflections.length
        });
      } else if (feelingKey === 'anxious_drained') {
        newInsights.push({
          type: 'recommendation',
          title: 'Consider Pace',
          description: 'Some dates have felt draining. Consider shorter first dates or lower-pressure activities.',
          confidence: dominantFeeling[1] / reflections.length
        });
      }
    }

    // Analyze standout qualities
    const qualityCounts: Record<StandoutQuality, number> = {
      conversation_flow: 0,
      shared_values: 0,
      physical_chemistry: 0,
      listened_well: 0,
      nothing_specific: 0
    };

    reflections.forEach(r => {
      r.standout_qualities.forEach(q => {
        qualityCounts[q]++;
      });
    });

    const topQualities = Object.entries(qualityCounts)
      .filter(([key]) => key !== 'nothing_specific')
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2);

    if (topQualities[0] && topQualities[0][1] >= 2) {
      const qualityKey = topQualities[0][0] as StandoutQuality;
      newInsights.push({
        type: 'preference',
        title: 'What You Value',
        description: `You've mentioned "${STANDOUT_LABELS[qualityKey].toLowerCase()}" ${topQualities[0][1]} times. We're prioritizing this in your matches.`,
        confidence: topQualities[0][1] / reflections.length
      });
    }

    // Analyze energy preferences
    const similarEnergyCount = reflections.filter(r => r.next_preference === 'similar_energy').length;
    const differentEnergyCount = reflections.filter(r => r.next_preference === 'different_energy').length;

    if (similarEnergyCount >= 2 && similarEnergyCount > differentEnergyCount) {
      newInsights.push({
        type: 'pattern',
        title: 'Energy Match',
        description: 'You tend to prefer people with similar energy. Your next matches are optimized for this.',
        confidence: similarEnergyCount / reflections.length
      });
    }

    setInsights(newInsights);
  };

  const getReflectionCount = () => reflections.length;
  
  const getInsightSummary = (): string | null => {
    if (reflections.length < 10) return null;
    
    // Generate summary after 10+ dates
    const topInsight = insights.find(i => i.confidence > 0.5);
    if (topInsight) {
      return `Based on your ${reflections.length} reflections: ${topInsight.description}`;
    }
    return null;
  };

  return {
    reflections,
    loading,
    insights,
    saveReflection,
    fetchReflections,
    getReflectionCount,
    getInsightSummary,
    FEELING_LABELS,
    STANDOUT_LABELS,
    NEXT_PREFERENCE_LABELS
  };
}
