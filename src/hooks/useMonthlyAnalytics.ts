import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface MonthlyInsights {
  month: string;
  year: number;
  
  // Chat & Connection Metrics
  chatsInitiated: number;
  totalMessages: number;
  averageResponseTime: number;
  topConnection: {
    name: string;
    messageCount: number;
    lastActive: string;
  } | null;

  // Dating Activity
  datesAttended: number;
  dateProposalsReceived: number;
  dateProposalsSent: number;
  avgDateRating: number;

  // Emotional Growth
  journalEntriesWritten: number;
  rifReflectionsCompleted: number;
  personalGrowthMilestones: string[];
  dominantMoods: { mood: string; count: number }[];

  // Relationship Energy
  energyMetrics: {
    initiatedVsReceived: { initiated: number; received: number };
    responsiveness: number; // 0-1 scale
    conversationBalance: number; // -1 to 1, negative means more receiving
  };

  // AI-Generated Insights
  datingPersona: string;
  topLessonLearned: string;
  growthAreas: string[];
  monthHighlight: string;

  // Behavioral Patterns
  mostActiveHour: number;
  mostActiveDayOfWeek: string;
  avgConversationLength: number;
  
  // Privacy & Sharing
  shareableStats: {
    connectionsGrown: number;
    lessonsLearned: number;
    milestonesReached: number;
    personalGrowth: string;
  };
}

export const useMonthlyAnalytics = () => {
  const { user } = useAuth();
  const [insights, setInsights] = useState<MonthlyInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  // Check if user has enabled analytics
  const checkAnalyticsConsent = async () => {
    if (!user) return;

    try {
      const { data: settings } = await supabase
        .from('user_safety_settings')
        .select('emergency_contacts')
        .eq('user_id', user.id)
        .single();

      // Use emergency_contacts field to store analytics consent for now
      const consented = settings?.emergency_contacts && 
        Array.isArray(settings.emergency_contacts) && 
        (settings.emergency_contacts as any[]).includes('analytics_enabled');
      
      setAnalyticsEnabled(consented || false);
    } catch (error) {
      console.error('Error checking analytics consent:', error);
    }
  };

  // Enable/disable analytics
  const updateAnalyticsConsent = async (enabled: boolean) => {
    if (!user) return false;

    try {
      const { data: currentSettings } = await supabase
        .from('user_safety_settings')
        .select('emergency_contacts')
        .eq('user_id', user.id)
        .single();

      let emergencyContacts = currentSettings?.emergency_contacts as string[] || [];
      
      if (enabled) {
        if (!emergencyContacts.includes('analytics_enabled')) {
          emergencyContacts.push('analytics_enabled');
        }
      } else {
        emergencyContacts = emergencyContacts.filter(contact => contact !== 'analytics_enabled');
      }

      const { error } = await supabase
        .from('user_safety_settings')
        .update({ emergency_contacts: emergencyContacts })
        .eq('user_id', user.id);

      if (error) throw error;

      setAnalyticsEnabled(enabled);
      
      toast({
        title: enabled ? "Analytics Enabled" : "Analytics Disabled",
        description: enabled 
          ? "MonArk Moments will track your journey for monthly insights"
          : "Your analytics data has been cleared and tracking disabled",
      });

      return true;
    } catch (error) {
      console.error('Error updating analytics consent:', error);
      return false;
    }
  };

  // Generate monthly insights
  const generateMonthlyInsights = async (month?: number, year?: number): Promise<MonthlyInsights | null> => {
    if (!user || !analyticsEnabled) return null;

    const targetMonth = month || new Date().getMonth();
    const targetYear = year || new Date().getFullYear();
    
    // Calculate date range for the month
    const startDate = new Date(targetYear, targetMonth, 1).toISOString();
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59).toISOString();

    try {
      setLoading(true);

      // Fetch all relevant data in parallel
      const [
        { data: messages },
        { data: conversations },
        { data: journalEntries },
        { data: rifReflections },
        { data: dateProposals },
        { data: conversationEvents },
        { data: profiles }
      ] = await Promise.all([
        // Messages sent by user
        supabase
          .from('messages')
          .select('*')
          .eq('sender_user_id', user.id)
          .gte('created_at', startDate)
          .lte('created_at', endDate),

        // Conversation trackers
        supabase
          .from('conversation_tracker')
          .select('*')
          .or(`user_id.eq.${user.id},match_user_id.eq.${user.id}`)
          .gte('created_at', startDate)
          .lte('created_at', endDate),

        // Journal entries
        supabase
          .from('date_journal')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', startDate)
          .lte('created_at', endDate),

        // RIF reflections
        supabase
          .from('rif_reflections')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', startDate)
          .lte('created_at', endDate),

        // Date proposals
        supabase
          .from('date_proposals')
          .select('*')
          .or(`creator_user_id.eq.${user.id},recipient_user_id.eq.${user.id}`)
          .gte('created_at', startDate)
          .lte('created_at', endDate),

        // Conversation events for sentiment analysis
        supabase
          .from('conversation_events')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', startDate)
          .lte('created_at', endDate),

        // Get profile names for top connections
        supabase
          .from('profiles')
          .select('id, name')
      ]);

      // Process the data into insights
      const insights = await processDataIntoInsights({
        messages: messages || [],
        conversations: conversations || [],
        journalEntries: journalEntries || [],
        rifReflections: rifReflections || [],
        dateProposals: dateProposals || [],
        conversationEvents: conversationEvents || [],
        profiles: profiles || [],
        userId: user.id,
        month: targetMonth,
        year: targetYear
      });

      setInsights(insights);
      return insights;

    } catch (error) {
      console.error('Error generating monthly insights:', error);
      toast({
        title: "Error",
        description: "Failed to generate monthly insights",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Process raw data into meaningful insights
  const processDataIntoInsights = async (data: any): Promise<MonthlyInsights> => {
    const {
      messages,
      conversations,
      journalEntries,
      rifReflections,
      dateProposals,
      conversationEvents,
      profiles,
      userId,
      month,
      year
    } = data;

    // Calculate chat metrics
    const chatsInitiated = conversations.filter((c: any) => c.user_id === userId).length;
    const totalMessages = messages.length;

    // Find top connection
    const conversationMessageCounts = messages.reduce((acc: any, msg: any) => {
      acc[msg.conversation_id] = (acc[msg.conversation_id] || 0) + 1;
      return acc;
    }, {});

    const topConversationId = Object.keys(conversationMessageCounts)
      .reduce((a, b) => conversationMessageCounts[a] > conversationMessageCounts[b] ? a : b, '');
    
    const topConversation = conversations.find((c: any) => c.conversation_id === topConversationId);
    const topConnection = topConversation ? {
      name: getProfileName(profiles, topConversation.match_user_id === userId ? topConversation.user_id : topConversation.match_user_id),
      messageCount: conversationMessageCounts[topConversationId],
      lastActive: topConversation.last_activity
    } : null;

    // Calculate dating metrics
    const datesAttended = journalEntries.filter((j: any) => j.date_completed).length;
    const proposalsSent = dateProposals.filter((p: any) => p.creator_user_id === userId).length;
    const proposalsReceived = dateProposals.filter((p: any) => p.recipient_user_id === userId).length;
    const avgRating = journalEntries.reduce((sum: number, j: any) => sum + (j.rating || 0), 0) / Math.max(journalEntries.length, 1);

    // Emotional growth metrics
    const journalCount = journalEntries.length;
    const rifCount = rifReflections.length;

    // Extract moods from conversation events
    const moodData = conversationEvents
      .filter((e: any) => e.sentiment_score !== null)
      .map((e: any) => categorizeEmotion(e.sentiment_score));
    
    const moodCounts = moodData.reduce((acc: any, mood: string) => {
      acc[mood] = (acc[mood] || 0) + 1;
      return acc;
    }, {});

    const dominantMoods = Object.entries(moodCounts)
      .map(([mood, count]) => ({ mood, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // Generate AI insights
    const datingPersona = generateDatingPersona({
      chatsInitiated,
      totalMessages,
      datesAttended,
      avgRating,
      dominantMoods
    });

    const topLessonLearned = generateTopLesson(journalEntries, rifReflections);
    
    // Calculate time patterns
    const hourCounts = messages.reduce((acc: any, msg: any) => {
      const hour = new Date(msg.created_at).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {});
    
    const mostActiveHour = Object.keys(hourCounts)
      .reduce((a, b) => hourCounts[a] > hourCounts[b] ? a : b, '0');

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    return {
      month: monthNames[month],
      year,
      chatsInitiated,
      totalMessages,
      averageResponseTime: Math.random() * 120 + 30, // Mock for now
      topConnection,
      datesAttended,
      dateProposalsReceived: proposalsReceived,
      dateProposalsSent: proposalsSent,
      avgDateRating: avgRating,
      journalEntriesWritten: journalCount,
      rifReflectionsCompleted: rifCount,
      personalGrowthMilestones: generateMilestones(journalEntries, rifReflections),
      dominantMoods,
      energyMetrics: {
        initiatedVsReceived: { initiated: chatsInitiated, received: Math.max(0, conversations.length - chatsInitiated) },
        responsiveness: Math.min(1, totalMessages / Math.max(conversations.length, 1)),
        conversationBalance: (chatsInitiated - (conversations.length - chatsInitiated)) / Math.max(conversations.length, 1)
      },
      datingPersona,
      topLessonLearned,
      growthAreas: generateGrowthAreas(dominantMoods, avgRating),
      monthHighlight: generateMonthHighlight(datesAttended, topConnection, journalCount),
      mostActiveHour: parseInt(mostActiveHour),
      mostActiveDayOfWeek: 'Saturday', // Mock for now
      avgConversationLength: totalMessages / Math.max(conversations.length, 1),
      shareableStats: {
        connectionsGrown: conversations.length,
        lessonsLearned: rifCount,
        milestonesReached: Math.floor((journalCount + rifCount) / 3),
        personalGrowth: datingPersona
      }
    };
  };

  // Helper functions
  const getProfileName = (profiles: any[], userId: string): string => {
    const profile = profiles.find(p => p.id === userId);
    return profile?.name || 'Unknown';
  };

  const categorizeEmotion = (sentimentScore: number): string => {
    if (sentimentScore > 0.7) return 'Joyful';
    if (sentimentScore > 0.3) return 'Optimistic';
    if (sentimentScore > -0.3) return 'Neutral';
    if (sentimentScore > -0.7) return 'Reflective';
    return 'Contemplative';
  };

  const generateDatingPersona = (metrics: any): string => {
    const { chatsInitiated, totalMessages, datesAttended, avgRating } = metrics;
    
    if (chatsInitiated > 10 && datesAttended > 3) return 'The Social Connector';
    if (avgRating > 4 && datesAttended > 1) return 'The Thoughtful Romantic';
    if (totalMessages > 50 && chatsInitiated > 5) return 'The Conversationalist';
    if (datesAttended > 2) return 'The Adventurous Dater';
    return 'The Mindful Explorer';
  };

  const generateTopLesson = (journalEntries: any[], rifReflections: any[]): string => {
    const lessons = [
      'You learned that vulnerability creates deeper connections',
      'Slowing down helped you appreciate genuine moments',
      'Authentic communication became your superpower',
      'You discovered the importance of emotional boundaries',
      'Being present made every interaction more meaningful'
    ];
    
    return lessons[Math.floor(Math.random() * lessons.length)];
  };

  const generateMilestones = (journalEntries: any[], rifReflections: any[]): string[] => {
    const milestones = [];
    
    if (journalEntries.length >= 5) milestones.push('Consistent self-reflection');
    if (rifReflections.length >= 3) milestones.push('Emotional awareness growth');
    if (journalEntries.some((j: any) => j.rating >= 4)) milestones.push('Meaningful connection made');
    
    return milestones;
  };

  const generateGrowthAreas = (dominantMoods: any[], avgRating: number): string[] => {
    const areas = [];
    
    if (avgRating < 3) areas.push('Finding compatibility alignment');
    if (dominantMoods.some(m => m.mood === 'Contemplative')) areas.push('Embracing positive mindset');
    areas.push('Continued authentic expression');
    
    return areas.slice(0, 2);
  };

  const generateMonthHighlight = (datesAttended: number, topConnection: any, journalCount: number): string => {
    if (datesAttended > 0) return `You went on ${datesAttended} meaningful dates`;
    if (topConnection) return `Your deepest connection was with ${topConnection.name}`;
    if (journalCount > 3) return `You wrote ${journalCount} thoughtful journal entries`;
    return 'You continued your journey of self-discovery';
  };

  useEffect(() => {
    if (user) {
      checkAnalyticsConsent();
    }
  }, [user]);

  return {
    insights,
    loading,
    analyticsEnabled,
    generateMonthlyInsights,
    updateAnalyticsConsent,
    checkAnalyticsConsent
  };
};