import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Tables } from '@/integrations/supabase/types';

type Message = Tables<'messages'>;

export interface ConversationPattern {
  conversationId: string;
  avgResponseTime: number; // in minutes
  avgMessageLength: number;
  emojiUsage: number; // percentage of messages with emojis
  mutualInterestIndicators: string[];
  lastActivityGap: number; // minutes since last message
  energyLevel: 'high' | 'medium' | 'low';
  readinessScore: number; // 0-1 scale
}

export interface ReadinessAnalysis {
  isReady: boolean;
  confidence: number;
  triggers: string[];
  cooldownUntil?: Date;
  suggestedTiming: 'immediate' | 'soon' | 'later';
}

// Mutual interest phrases to detect
const INTEREST_INDICATORS = [
  'we should',
  'let\'s',
  'I\'d love to',
  'that sounds fun',
  'that would be amazing',
  'we could',
  'maybe we can',
  'I want to try',
  'sounds like a plan',
  'I\'m down',
  'count me in',
  'that\'s a great idea',
  'we need to do that',
  'when can we',
  'I\'ve been wanting to',
  'we both love',
  'our shared interest',
  'we have that in common'
];

// Natural conversation lull indicators
const LULL_INDICATORS = [
  'anyway',
  'so',
  'well',
  'hmm',
  'what about you',
  'speaking of which',
  'by the way',
  'oh also',
  'random question',
  'changing topics'
];

export const useConversationReadiness = () => {
  const [patterns, setPatterns] = useState<Map<string, ConversationPattern>>(new Map());
  const [cooldowns, setCooldowns] = useState<Map<string, Date>>(new Map());
  const { user } = useAuth();

  // Analyze message for sentiment and patterns
  const analyzeMessage = (message: Message): {
    emojiCount: number;
    interestIndicators: string[];
    isLullIndicator: boolean;
    sentiment: number;
  } => {
    const content = message.content.toLowerCase();
    
    // Count emojis (simple regex for common emoji patterns)
    const emojiCount = (content.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu) || []).length;
    
    // Find interest indicators
    const interestIndicators = INTEREST_INDICATORS.filter(phrase => 
      content.includes(phrase)
    );
    
    // Check for lull indicators
    const isLullIndicator = LULL_INDICATORS.some(phrase => 
      content.includes(phrase)
    );
    
    // Simple sentiment analysis based on positive/negative words
    const positiveWords = ['love', 'great', 'amazing', 'awesome', 'excited', 'fun', 'wonderful', 'perfect', 'yes', 'definitely'];
    const negativeWords = ['hate', 'bad', 'terrible', 'awful', 'boring', 'no', 'never', 'unfortunately', 'sadly'];
    
    const positiveCount = positiveWords.filter(word => content.includes(word)).length;
    const negativeCount = negativeWords.filter(word => content.includes(word)).length;
    
    const sentiment = positiveCount > negativeCount ? 0.7 : 
                     negativeCount > positiveCount ? 0.3 : 0.5;
    
    return {
      emojiCount,
      interestIndicators,
      isLullIndicator,
      sentiment
    };
  };

  // Calculate conversation pattern for a set of messages
  const calculatePattern = (messages: Message[]): ConversationPattern | null => {
    if (messages.length < 3) return null;

    const conversationId = messages[0].conversation_id;
    
    // Calculate response times (time between messages from different users)
    const responseTimes: number[] = [];
    for (let i = 1; i < messages.length; i++) {
      const prevMsg = messages[i - 1];
      const currMsg = messages[i];
      
      if (prevMsg.sender_user_id !== currMsg.sender_user_id) {
        const timeDiff = new Date(currMsg.created_at).getTime() - new Date(prevMsg.created_at).getTime();
        responseTimes.push(timeDiff / (1000 * 60)); // Convert to minutes
      }
    }
    
    const avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
      : 60; // Default to 60 minutes if no response times

    // Calculate average message length
    const avgMessageLength = messages.reduce((sum, msg) => sum + msg.content.length, 0) / messages.length;

    // Calculate emoji usage
    const messagesWithEmojis = messages.filter(msg => analyzeMessage(msg).emojiCount > 0).length;
    const emojiUsage = (messagesWithEmojis / messages.length) * 100;

    // Collect all interest indicators
    const allInterestIndicators: string[] = [];
    messages.forEach(msg => {
      const analysis = analyzeMessage(msg);
      allInterestIndicators.push(...analysis.interestIndicators);
    });

    // Calculate last activity gap
    const lastMessage = messages[messages.length - 1];
    const lastActivityGap = (new Date().getTime() - new Date(lastMessage.created_at).getTime()) / (1000 * 60);

    // Determine energy level based on response time and message length
    let energyLevel: 'high' | 'medium' | 'low';
    if (avgResponseTime < 30 && avgMessageLength > 50) {
      energyLevel = 'high';
    } else if (avgResponseTime < 120 && avgMessageLength > 20) {
      energyLevel = 'medium';
    } else {
      energyLevel = 'low';
    }

    // Calculate readiness score (0-1)
    let readinessScore = 0.5; // Base score

    // Positive factors
    if (allInterestIndicators.length > 0) readinessScore += 0.2;
    if (emojiUsage > 20) readinessScore += 0.1;
    if (energyLevel === 'high') readinessScore += 0.15;
    if (energyLevel === 'medium') readinessScore += 0.05;
    if (messages.length > 10) readinessScore += 0.1;
    if (avgMessageLength > 40) readinessScore += 0.1;

    // Negative factors
    if (lastActivityGap > 240) readinessScore -= 0.2; // 4+ hours
    if (avgResponseTime > 240) readinessScore -= 0.15; // 4+ hours avg
    if (energyLevel === 'low') readinessScore -= 0.1;

    // Clamp between 0 and 1
    readinessScore = Math.max(0, Math.min(1, readinessScore));

    return {
      conversationId,
      avgResponseTime,
      avgMessageLength,
      emojiUsage,
      mutualInterestIndicators: [...new Set(allInterestIndicators)], // Remove duplicates
      lastActivityGap,
      energyLevel,
      readinessScore
    };
  };

  // Analyze conversation readiness
  const analyzeReadiness = (conversationId: string, messages: Message[]): ReadinessAnalysis => {
    const pattern = calculatePattern(messages);
    
    if (!pattern) {
      return {
        isReady: false,
        confidence: 0,
        triggers: ['Insufficient conversation history'],
        suggestedTiming: 'later'
      };
    }

    // Check cooldown
    const cooldownEnd = cooldowns.get(conversationId);
    if (cooldownEnd && new Date() < cooldownEnd) {
      return {
        isReady: false,
        confidence: 0,
        triggers: ['Cooling off period active'],
        cooldownUntil: cooldownEnd,
        suggestedTiming: 'later'
      };
    }

    const triggers: string[] = [];
    let confidence = pattern.readinessScore;

    // High readiness triggers
    if (pattern.mutualInterestIndicators.length >= 2) {
      triggers.push('Multiple mutual interest indicators detected');
      confidence += 0.1;
    }

    if (pattern.energyLevel === 'high' && pattern.lastActivityGap < 60) {
      triggers.push('High energy conversation with recent activity');
      confidence += 0.1;
    }

    // Natural lull detection
    const recentMessages = messages.slice(-3);
    const hasLullIndicators = recentMessages.some(msg => 
      analyzeMessage(msg).isLullIndicator
    );
    
    if (hasLullIndicators && pattern.lastActivityGap > 30 && pattern.lastActivityGap < 120) {
      triggers.push('Natural conversation lull detected');
      confidence += 0.15;
    }

    // Good conversation flow indicators
    if (pattern.avgResponseTime < 60 && pattern.emojiUsage > 15) {
      triggers.push('Positive conversation flow with emotional engagement');
      confidence += 0.1;
    }

    // Determine if ready
    const isReady = confidence >= 0.7 && triggers.length > 0;

    // Determine timing
    let suggestedTiming: 'immediate' | 'soon' | 'later';
    if (confidence >= 0.8) {
      suggestedTiming = 'immediate';
    } else if (confidence >= 0.6) {
      suggestedTiming = 'soon';
    } else {
      suggestedTiming = 'later';
    }

    return {
      isReady,
      confidence: Math.min(1, confidence),
      triggers,
      suggestedTiming
    };
  };

  // Set cooldown period to avoid over-triggering
  const setCooldown = (conversationId: string, hours: number = 24) => {
    const cooldownEnd = new Date();
    cooldownEnd.setHours(cooldownEnd.getHours() + hours);
    
    setCooldowns(prev => new Map(prev.set(conversationId, cooldownEnd)));
    
    // Store in localStorage for persistence
    const cooldownData = JSON.stringify({
      conversationId,
      cooldownEnd: cooldownEnd.toISOString()
    });
    localStorage.setItem(`concierge_cooldown_${conversationId}`, cooldownData);
  };

  // Load cooldowns from localStorage
  const loadCooldowns = () => {
    const keys = Object.keys(localStorage).filter(key => 
      key.startsWith('concierge_cooldown_')
    );
    
    const newCooldowns = new Map<string, Date>();
    
    keys.forEach(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        const cooldownEnd = new Date(data.cooldownEnd);
        
        // Only keep future cooldowns
        if (cooldownEnd > new Date()) {
          newCooldowns.set(data.conversationId, cooldownEnd);
        } else {
          localStorage.removeItem(key);
        }
      } catch (error) {
        localStorage.removeItem(key);
      }
    });
    
    setCooldowns(newCooldowns);
  };

  // Update pattern for a conversation
  const updatePattern = (conversationId: string, messages: Message[]) => {
    const pattern = calculatePattern(messages);
    if (pattern) {
      setPatterns(prev => new Map(prev.set(conversationId, pattern)));
    }
  };

  // Clean up old cooldowns
  const cleanupCooldowns = () => {
    const now = new Date();
    setCooldowns(prev => {
      const updated = new Map(prev);
      prev.forEach((cooldownEnd, conversationId) => {
        if (cooldownEnd <= now) {
          updated.delete(conversationId);
          localStorage.removeItem(`concierge_cooldown_${conversationId}`);
        }
      });
      return updated;
    });
  };

  // Initialize cooldowns on mount
  useEffect(() => {
    loadCooldowns();
    const interval = setInterval(cleanupCooldowns, 60000); // Cleanup every minute
    return () => clearInterval(interval);
  }, []);

  return {
    patterns,
    analyzeReadiness,
    updatePattern,
    setCooldown,
    calculatePattern,
    analyzeMessage
  };
};
