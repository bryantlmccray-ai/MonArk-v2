import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export interface NudgePrompt {
  id: string;
  nudge_type: string;
  trigger_context: string;
  prompt_text: string;
  response_options: string[];
  is_active: boolean;
  created_at: string;
}

export interface ConversationEvent {
  id: string;
  conversation_id: string;
  user_id: string;
  event_type: string;
  event_data: any;
  sentiment_score: number;
  created_at: string;
}

export interface ConversationMonitor {
  id: string;
  conversation_id: string;
  last_message_time: string | null;
  message_count: number;
  response_balance_score: number;
  avg_sentiment_score: number;
  inactivity_hours: number;
  nudge_count: number;
  last_nudge_time: string | null;
  graceful_exit: boolean;
  created_at: string;
  updated_at: string;
}

export const useConversationNudges = () => {
  const [nudgePrompts, setNudgePrompts] = useState<NudgePrompt[]>([]);
  const [conversationMonitors, setConversationMonitors] = useState<ConversationMonitor[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch nudge prompts from library
  const fetchNudgePrompts = async () => {
    try {
      const { data, error } = await supabase
        .from('nudge_library')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = (data || []).map(item => ({
        ...item,
        response_options: Array.isArray(item.response_options) 
          ? item.response_options 
          : typeof item.response_options === 'string' 
            ? [item.response_options]
            : []
      }));
      
      setNudgePrompts(transformedData);
    } catch (error) {
      console.error('Error fetching nudge prompts:', error);
    }
  };

  // Fetch conversation monitors
  const fetchConversationMonitors = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('conversation_monitor')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setConversationMonitors(data || []);
    } catch (error) {
      console.error('Error fetching conversation monitors:', error);
    }
  };

  // Log conversation event
  const logConversationEvent = async (
    conversationId: string,
    eventType: string,
    eventData: any = {},
    sentimentScore: number = 0
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('conversation_events')
        .insert({
          conversation_id: conversationId,
          user_id: user.id,
          event_type: eventType,
          event_data: eventData,
          sentiment_score: sentimentScore
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error logging conversation event:', error);
    }
  };

  // Get nudges for specific context
  const getNudgesForContext = (context: string, nudgeType?: string) => {
    return nudgePrompts.filter(prompt => {
      const contextMatch = prompt.trigger_context === context;
      const typeMatch = nudgeType ? prompt.nudge_type === nudgeType : true;
      return contextMatch && typeMatch;
    });
  };

  // Check if conversation needs nudge
  const shouldShowNudge = (conversationId: string): { show: boolean; type: string; context: string } => {
    const monitor = conversationMonitors.find(m => m.conversation_id === conversationId);
    
    if (!monitor) return { show: false, type: '', context: '' };

    // Check for inactivity (24-48 hours)
    if (monitor.inactivity_hours >= 24 && monitor.inactivity_hours <= 48) {
      return { show: true, type: 'meaningful_question', context: 'low_engagement' };
    }

    // Check for mismatched energy (response balance < -0.5)
    if (monitor.response_balance_score < -0.5 && monitor.message_count > 5) {
      return { show: true, type: 'pacing', context: 'mismatched_energy' };
    }

    // Check for one-sided messaging
    if (monitor.response_balance_score < -0.7 && monitor.message_count > 10) {
      return { show: true, type: 'graceful_exit', context: 'one_sided_messaging' };
    }

    // Check for unclear intent (low sentiment with multiple messages)
    if (monitor.avg_sentiment_score < 0.3 && monitor.message_count > 8) {
      return { show: true, type: 'clarity', context: 'unclear_intent' };
    }

    return { show: false, type: '', context: '' };
  };

  // Record nudge interaction
  const recordNudgeInteraction = async (
    conversationId: string,
    nudgeType: string,
    action: 'triggered' | 'dismissed' | 'used',
    selectedResponse?: string
  ) => {
    await logConversationEvent(conversationId, `nudge_${action}`, {
      nudge_type: nudgeType,
      selected_response: selectedResponse
    });

    if (action === 'used') {
      toast({
        title: "Message suggestion used 💬",
        description: "Your thoughtful communication helps build better connections.",
      });
    }
  };

  // Handle graceful exit
  const handleGracefulExit = async (
    conversationId: string,
    exitMessage: string,
    reason?: string
  ) => {
    if (!user) return;

    try {
      // Log the graceful exit event
      await logConversationEvent(conversationId, 'graceful_exit', {
        exit_message: exitMessage,
        reason: reason
      });

      // Update conversation monitor
      const { error } = await supabase
        .from('conversation_monitor')
        .update({ graceful_exit: true, updated_at: new Date().toISOString() })
        .eq('conversation_id', conversationId);

      if (error) throw error;

      toast({
        title: "Conversation closed gracefully 🤝",
        description: "Thank you for ending this conversation with kindness.",
      });

      await fetchConversationMonitors();
    } catch (error) {
      console.error('Error handling graceful exit:', error);
      toast({
        title: "Something went wrong",
        description: "Unable to process graceful exit.",
        variant: "destructive"
      });
    }
  };

  // Update conversation activity
  const updateConversationActivity = async (
    conversationId: string,
    messageCount: number,
    sentimentScore: number = 0
  ) => {
    try {
      // This will be handled by the database trigger, but we can also update manually
      const { error } = await supabase
        .from('conversation_monitor')
        .upsert({
          conversation_id: conversationId,
          last_message_time: new Date().toISOString(),
          message_count: messageCount,
          avg_sentiment_score: sentimentScore,
          inactivity_hours: 0,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      await fetchConversationMonitors();
    } catch (error) {
      console.error('Error updating conversation activity:', error);
    }
  };

  useEffect(() => {
    if (user) {
      const loadData = async () => {
        setLoading(true);
        await Promise.all([
          fetchNudgePrompts(),
          fetchConversationMonitors()
        ]);
        setLoading(false);
      };
      loadData();
    }
  }, [user]);

  return {
    nudgePrompts,
    conversationMonitors,
    loading,
    getNudgesForContext,
    shouldShowNudge,
    recordNudgeInteraction,
    handleGracefulExit,
    updateConversationActivity,
    logConversationEvent,
    refetch: async () => {
      await fetchNudgePrompts();
      await fetchConversationMonitors();
    }
  };
};
