import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface WeeklyOption {
  id: string;
  user_id: string;
  week_start: string;
  option_number: number;
  title: string;
  vibe_line: string;
  time_window: {
    start: string;
    end: string;
  };
  distance_km: number | null;
  eq_fit_chips: string[];
  care_index_score: number;
  why_this_for_you: string;
  venue_data: {
    id: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
  } | null;
  is_template: boolean;
  is_expired: boolean;
  tapped_at: string | null;
  created_at: string;
}

export const useWeeklyOptions = () => {
  const [options, setOptions] = useState<WeeklyOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadWeeklyOptions();
  }, []);

  const loadWeeklyOptions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const weekStart = getWeekStart();
      
      const { data, error } = await supabase
        .from('weekly_options')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_start', weekStart.toISOString())
        .order('option_number');

      if (error) throw error;

      setOptions((data as any) || []);

      // If less than 3 options, generate them
      if (!data || data.length < 3) {
        await generateOptions();
      }
    } catch (error) {
      console.error('Error loading weekly options:', error);
      toast.error('Failed to load weekly options');
    } finally {
      setLoading(false);
    }
  };

  const generateOptions = async () => {
    try {
      setGenerating(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.functions.invoke('weekly-scheduler', {
        body: {
          action: 'generate_weekly_options',
          user_id: user.id
        }
      });

      if (error) throw error;

      // Reload options
      await loadWeeklyOptions();
      
      toast.success('Your weekly options are ready!');
    } catch (error) {
      console.error('Error generating options:', error);
      toast.error('Failed to generate options');
    } finally {
      setGenerating(false);
    }
  };

  // Accept an option - creates itinerary with share link
  const acceptOption = async (optionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-itinerary', {
        body: {
          weekly_option_id: optionId,
          mode: 'matched' // MVP: only matched mode
        }
      });

      if (error) throw error;

      // Log analytics
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('behavior_analytics')
          .insert({
            user_id: user.id,
            event_type: 'option_accepted',
            event_data: { option_id: optionId }
          });
      }

      // Refresh options list
      await loadWeeklyOptions();
      
      toast.success('Date plan created!');
      return data;
    } catch (error) {
      console.error('Error accepting option:', error);
      toast.error('Failed to create date plan');
      return null;
    }
  };

  // Pass on an option - marks as expired
  const passOption = async (optionId: string) => {
    try {
      const { error } = await supabase
        .from('weekly_options')
        .update({ is_expired: true })
        .eq('id', optionId);

      if (error) throw error;

      // Log analytics
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('behavior_analytics')
          .insert({
            user_id: user.id,
            event_type: 'option_passed',
            event_data: { option_id: optionId }
          });
      }

      // Refresh options list
      await loadWeeklyOptions();
      
      toast.success('Option passed');
    } catch (error) {
      console.error('Error passing option:', error);
      toast.error('Failed to pass option');
    }
  };

  return {
    options,
    loading,
    generating,
    acceptOption,
    passOption,
    refetch: loadWeeklyOptions
  };
};

function getWeekStart(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setUTCHours(0, 0, 0, 0);
  return monday;
}
