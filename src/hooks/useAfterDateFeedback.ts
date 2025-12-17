import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PendingFeedback {
  itineraryId: string;
  matchUserId: string;
  matchName: string;
  title: string;
}

export const useAfterDateFeedback = () => {
  const [pendingFeedback, setPendingFeedback] = useState<PendingFeedback | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    checkForPendingFeedback();
  }, []);

  const checkForPendingFeedback = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get completed itineraries without feedback
      const { data: itineraries } = await supabase
        .from('itineraries')
        .select(`
          id,
          title,
          counterpart_user_id,
          time_window,
          completed_at
        `)
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .is('completed_at', null)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!itineraries || itineraries.length === 0) return;

      const itinerary = itineraries[0];
      
      // Check if time has passed (date should be over)
      const endTime = new Date((itinerary.time_window as any)?.end);
      if (endTime > new Date()) return; // Date hasn't happened yet

      // Check if feedback already exists
      const { data: existingFeedback } = await supabase
        .from('itinerary_feedback')
        .select('id')
        .eq('itinerary_id', itinerary.id)
        .eq('user_id', user.id)
        .single();

      if (existingFeedback) return; // Already gave feedback

      // Get match name
      let matchName = 'your match';
      if (itinerary.counterpart_user_id) {
        const { data: matchProfile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', itinerary.counterpart_user_id)
          .single();
        
        if (matchProfile) {
          // Get name from profiles table
          const { data: profile } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', itinerary.counterpart_user_id)
            .single();
          
          matchName = profile?.name || 'your match';
        }
      }

      setPendingFeedback({
        itineraryId: itinerary.id,
        matchUserId: itinerary.counterpart_user_id || '',
        matchName,
        title: itinerary.title
      });
      
      // Auto-show after a short delay
      setTimeout(() => setShowFeedback(true), 2000);
    } catch (error) {
      console.error('Error checking for pending feedback:', error);
    }
  };

  const dismissFeedback = () => {
    setShowFeedback(false);
    setPendingFeedback(null);
  };

  const promptFeedback = (itineraryId: string, matchUserId: string, matchName: string) => {
    setPendingFeedback({
      itineraryId,
      matchUserId,
      matchName,
      title: ''
    });
    setShowFeedback(true);
  };

  return {
    pendingFeedback,
    showFeedback,
    setShowFeedback,
    dismissFeedback,
    promptFeedback,
    checkForPendingFeedback
  };
};
