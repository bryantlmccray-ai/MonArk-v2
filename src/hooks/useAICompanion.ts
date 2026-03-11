import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useProfile } from './useProfile';
import { useDateConcierge } from './useDateConcierge';
import { useRIF } from './useRIF';
import { sanitizeCompanionPayload } from '@/lib/aiSanitizer';

export interface AIMessage {
  id: string;
  type: 'insight' | 'suggestion' | 'conversation' | 'celebration';
  content: string;
  timestamp: string;
  data?: any;
  actionable?: boolean;
  action?: {
    label: string;
    type: 'generate_date' | 'view_insights' | 'update_preferences';
  };
}

export const useAICompanion = () => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasNewInsights, setHasNewInsights] = useState(false);
  
  const { user } = useAuth();
  const { profile } = useProfile();
  const { journalEntries } = useDateConcierge();
  const { rifProfile } = useRIF();

  // Generate personalized insights using AI
  const generatePersonalizedInsights = async (): Promise<AIMessage[]> => {
    if (!user || !profile) return [];

    setIsGenerating(true);
    try {
      // Build raw context, then sanitize via LLM firewall before sending
      const rawContext = {
        recentDates: journalEntries.slice(0, 5),
        rifProfile,
        interests: profile.interests || [],
        averageRating: journalEntries.length > 0 
          ? journalEntries.reduce((sum, entry) => sum + (entry.rating || 0), 0) / journalEntries.length
          : 0,
        totalDates: journalEntries.length
      };

      const { data, error } = await supabase.functions.invoke('ai-companion-chat', {
        body: {
          type: 'generate_insights',
          userContext: sanitizeCompanionPayload(rawContext)
        }
      });

      if (error) throw error;

      return data.insights || [];
    } catch (error) {
      console.error('Error generating AI insights:', error);
      return [];
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate AI response to user message
  const generateAIResponse = async (userMessage: string): Promise<string> => {
    if (!user) return "I'd love to help, but it seems you're not logged in!";

    try {
      const userContext = {
        recentDates: journalEntries.slice(0, 3),
        rifProfile,
        interests: profile?.interests || [],
        userMessage
      };

      const { data, error } = await supabase.functions.invoke('ai-companion-chat', {
        body: {
          type: 'chat_response',
          userContext
        }
      });

      if (error) throw error;

      // If circuit breaker is open, the backend returns a warm resting message
      if (data.circuit_breaker === 'open') {
        return data.message || "I'm taking a quick rest — back soon with fresh insights! 💫";
      }

      return data.message || "I'm here to help you with your dating journey! What's on your mind?";
    } catch (error) {
      console.error('Error generating AI response:', error);
      return "I'm recharging my thoughts right now 🌙 Check back in a moment — I'll be ready to help!";
    }
  };

  // Generate celebration message for milestones
  const generateCelebration = async (milestone: string): Promise<AIMessage> => {
    if (!user) {
      return {
        id: `celebration_${Date.now()}`,
        type: 'celebration',
        content: "Congratulations on your milestone! 🎉",
        timestamp: new Date().toISOString()
      };
    }

    try {
      const userContext = {
        totalDates: journalEntries.length,
        averageRating: journalEntries.length > 0 
          ? journalEntries.reduce((sum, entry) => sum + (entry.rating || 0), 0) / journalEntries.length
          : 0,
        rifProfile,
        milestone
      };

      const { data, error } = await supabase.functions.invoke('ai-companion-chat', {
        body: {
          type: 'celebration',
          userContext
        }
      });

      if (error) throw error;

      return {
        id: `celebration_${Date.now()}`,
        type: 'celebration',
        content: data.message,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating celebration:', error);
      return {
        id: `celebration_${Date.now()}`,
        type: 'celebration',
        content: "Amazing work on your dating journey! Keep being awesome! 🌟",
        timestamp: new Date().toISOString()
      };
    }
  };

  // Add message to conversation
  const addMessage = (message: AIMessage) => {
    setMessages(prev => [...prev, message]);
    if (message.type !== 'conversation') {
      setHasNewInsights(true);
    }
  };

  // Clear all messages
  const clearMessages = () => {
    setMessages([]);
    setHasNewInsights(false);
  };

  // Mark insights as read
  const markInsightsAsRead = () => {
    setHasNewInsights(false);
  };

  // Check for new insights based on user activity
  const checkForNewInsights = async () => {
    if (!user || messages.length > 0) return;

    // Check if user has new patterns or milestones
    const shouldGenerateInsights = 
      journalEntries.length > 0 && 
      (journalEntries.length % 5 === 0 || journalEntries.length === 1);

    if (shouldGenerateInsights) {
      const insights = await generatePersonalizedInsights();
      insights.forEach(insight => addMessage(insight));
    }
  };

  // Initialize insights when component loads
  useEffect(() => {
    if (user && profile) {
      checkForNewInsights();
    }
  }, [user?.id, journalEntries.length]);

  return {
    messages,
    isGenerating,
    hasNewInsights,
    generatePersonalizedInsights,
    generateAIResponse,
    generateCelebration,
    addMessage,
    clearMessages,
    markInsightsAsRead,
    checkForNewInsights
  };
};