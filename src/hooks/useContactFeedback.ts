import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface PendingContactFeedback {
  contactShareId: string;
  matchUserId: string;
  matchName: string;
  conversationId: string;
}

export const useContactFeedback = () => {
  const { user } = useAuth();
  const [pendingFeedback, setPendingFeedback] = useState<PendingContactFeedback | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkForPendingFeedback();
    }
  }, [user]);

  const checkForPendingFeedback = async () => {
    if (!user) return;

    try {
      // Check for date_feedback_request notifications
      const { data: notifications } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'date_feedback_request')
        .is('read_at', null)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!notifications || notifications.length === 0) return;

      const notification = notifications[0];
      const notificationData = notification.data as any;

      // Check if we already submitted feedback for this
      const { data: existingFeedback } = await supabase
        .from('contact_share_feedback')
        .select('id')
        .eq('contact_share_id', notificationData.contact_share_id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingFeedback) {
        // Mark notification as read
        await supabase
          .from('notifications')
          .update({ read_at: new Date().toISOString() })
          .eq('id', notification.id);
        return;
      }

      // Get match name
      const { data: matchProfile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', notificationData.match_user_id)
        .maybeSingle();

      setPendingFeedback({
        contactShareId: notificationData.contact_share_id,
        matchUserId: notificationData.match_user_id,
        matchName: matchProfile?.name || 'your match',
        conversationId: notificationData.conversation_id
      });

      // Show after a short delay
      setTimeout(() => setShowFeedback(true), 2000);

    } catch (error) {
      console.error('Error checking for pending feedback:', error);
    }
  };

  const submitFeedback = async (
    didMeet: boolean,
    rating: number,
    seeAgain: 'yes' | 'maybe' | 'no',
    comment?: string
  ) => {
    if (!user || !pendingFeedback) return false;

    setLoading(true);
    try {
      // Insert feedback
      const { error: feedbackError } = await supabase
        .from('contact_share_feedback')
        .insert({
          contact_share_id: pendingFeedback.contactShareId,
          user_id: user.id,
          match_user_id: pendingFeedback.matchUserId,
          conversation_id: pendingFeedback.conversationId,
          did_meet: didMeet,
          rating,
          see_again: seeAgain,
          comment: comment || null
        });

      if (feedbackError) throw feedbackError;

      // Mark notification as read
      await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('type', 'date_feedback_request');

      // Log analytics
      await supabase.from('behavior_analytics').insert({
        user_id: user.id,
        event_type: 'contact_feedback_submitted',
        event_data: {
          contact_share_id: pendingFeedback.contactShareId,
          did_meet: didMeet,
          rating,
          see_again: seeAgain
        }
      });

      setPendingFeedback(null);
      setShowFeedback(false);
      return true;

    } catch (error) {
      console.error('Error submitting feedback:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const dismissFeedback = async () => {
    setShowFeedback(false);
    // Don't clear pendingFeedback, just hide for now
    // User can be reminded later
  };

  return {
    pendingFeedback,
    showFeedback,
    loading,
    setShowFeedback,
    submitFeedback,
    dismissFeedback,
    checkForPendingFeedback
  };
};
