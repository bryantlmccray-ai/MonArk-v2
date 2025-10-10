import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Itinerary {
  id: string;
  user_id: string;
  counterpart_user_id: string | null;
  weekly_option_id: string | null;
  mode: 'discovery' | 'matched' | 'byo';
  title: string;
  description: string | null;
  time_window: {
    start: string;
    end: string;
  };
  location_data: any;
  status: 'proposed' | 'confirmed' | 'completed' | 'cancelled';
  safety_sharing_enabled: boolean;
  sos_visible: boolean;
  consent_nudge_shown: boolean;
  share_link: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export const useItineraries = () => {
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItineraries();
  }, []);

  const loadItineraries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('itineraries')
        .select('*')
        .or(`user_id.eq.${user.id},counterpart_user_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setItineraries((data as any) || []);
    } catch (error) {
      console.error('Error loading itineraries:', error);
      toast.error('Failed to load itineraries');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (itineraryId: string, status: Itinerary['status']) => {
    try {
      const updateData: any = { status };
      
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('itineraries')
        .update(updateData)
        .eq('id', itineraryId);

      if (error) throw error;

      await loadItineraries();
      toast.success('Itinerary updated');
    } catch (error) {
      console.error('Error updating itinerary:', error);
      toast.error('Failed to update itinerary');
    }
  };

  const getUpcomingItineraries = () => {
    return itineraries.filter(i => 
      i.status === 'confirmed' || i.status === 'proposed'
    );
  };

  const getCompletedItineraries = () => {
    return itineraries.filter(i => i.status === 'completed');
  };

  return {
    itineraries,
    loading,
    updateStatus,
    getUpcomingItineraries,
    getCompletedItineraries,
    refetch: loadItineraries
  };
};