import { supabase } from '@/integrations/supabase/client';

export interface UserPattern {
  userId: string;
  recentDates: any[];
  averageRating: number;
  preferredActivities: string[];
  datingFrequency: number;
  rifProfile?: any;
  totalDates: number;
  weeksSinceLastDate: number;
}

export class AIInsightsService {
  // Analyze user patterns and determine if insights should be generated
  static async shouldGenerateInsights(userId: string): Promise<boolean> {
    try {
      // Check recent journal entries
      const { data: recentEntries } = await supabase
        .from('date_journal')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      // Check if user has recent activity
      const hasRecentActivity = recentEntries && recentEntries.length > 0;
      
      // Check if it's been a while since last insight
      const { data: lastInsight } = await supabase
        .from('rif_insights')
        .select('generated_at')
        .eq('user_id', userId)
        .order('generated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const daysSinceLastInsight = lastInsight 
        ? Math.floor((Date.now() - new Date(lastInsight.generated_at).getTime()) / (1000 * 60 * 60 * 24))
        : 999;

      // Generate insights if:
      // 1. User has recent activity AND it's been 3+ days since last insight
      // 2. User hit a milestone (every 5 dates)
      // 3. User has interesting patterns (all dates rated high/low)
      
      const shouldGenerate = 
        (hasRecentActivity && daysSinceLastInsight >= 3) ||
        (recentEntries && recentEntries.length % 5 === 0) ||
        this.hasInterestingPatterns(recentEntries || []);

      return shouldGenerate;
    } catch (error) {
      console.error('Error checking insight generation criteria:', error);
      return false;
    }
  }

  // Detect interesting patterns that warrant insights
  static hasInterestingPatterns(entries: any[]): boolean {
    if (entries.length < 3) return false;

    const ratings = entries.map(e => e.rating).filter(r => r !== null);
    const activities = entries.map(e => e.date_activity?.toLowerCase()).filter(Boolean);

    // Pattern 1: All dates rated very high (4.5+)
    const highRatingStreak = ratings.length >= 3 && ratings.every((r: number) => r >= 4.5);
    
    // Pattern 2: All dates rated low (below 3)
    const lowRatingStreak = ratings.length >= 3 && ratings.every((r: number) => r < 3);
    
    // Pattern 3: Same activity type repeated 4+ times
    const activityCounts = activities.reduce((acc, activity) => {
      acc[activity] = (acc[activity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const hasActivityPattern = Object.values(activityCounts).some(count => count >= 4);
    
    // Pattern 4: Rapid dating (5+ dates in 2 weeks)
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const recentDates = entries.filter(e => new Date(e.created_at) > twoWeeksAgo);
    const rapidDating = recentDates.length >= 5;

    return highRatingStreak || lowRatingStreak || hasActivityPattern || rapidDating;
  }

  // Generate insights for a user
  static async generateInsightsForUser(userId: string): Promise<void> {
    try {
      // Get user data
      const pattern = await this.analyzeUserPattern(userId);
      if (!pattern) return;

      // Generate AI insights
      const { data, error } = await supabase.functions.invoke('ai-companion-chat', {
        body: {
          type: 'generate_insights',
          userContext: {
            recentDates: pattern.recentDates,
            rifProfile: pattern.rifProfile,
            averageRating: pattern.averageRating,
            totalDates: pattern.totalDates,
            interests: [] // Would come from user profile
          }
        }
      });

      if (error) throw error;

      // Store insights in database for the ML panel (technical insights)
      if (data.insights && data.insights.length > 0) {
        const insightsToStore = data.insights.map((insight: any) => ({
          user_id: userId,
          title: this.extractTitle(insight.content),
          content: insight.content,
          insight_type: 'ai_generated',
          delivered: false,
          generated_at: new Date().toISOString()
        }));

        await supabase
          .from('rif_insights')
          .insert(insightsToStore);
      }
    } catch (error) {
      console.error('Error generating insights for user:', error);
    }
  }

  // Analyze user's dating patterns
  static async analyzeUserPattern(userId: string): Promise<UserPattern | null> {
    try {
      // Get journal entries
      const { data: entries } = await supabase
        .from('date_journal')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!entries || entries.length === 0) return null;

      // Get RIF profile
      const { data: rifProfile } = await supabase
        .from('rif_profiles')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle();

      // Calculate patterns
      const ratings = entries.map(e => e.rating).filter(r => r !== null);
      const averageRating = ratings.length > 0 
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
        : 0;

      const activities = entries.map(e => e.date_activity).filter(Boolean);
      const activityCounts = activities.reduce((acc, activity) => {
        acc[activity] = (acc[activity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const preferredActivities = Object.entries(activityCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([activity]) => activity);

      // Calculate dating frequency (dates per month)
      const oldestDate = new Date(entries[entries.length - 1].created_at);
      const monthsActive = Math.max(1, (Date.now() - oldestDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
      const datingFrequency = entries.length / monthsActive;

      // Weeks since last date
      const lastDate = new Date(entries[0].created_at);
      const weeksSinceLastDate = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24 * 7));

      return {
        userId,
        recentDates: entries.slice(0, 5),
        averageRating,
        preferredActivities,
        datingFrequency,
        rifProfile,
        totalDates: entries.length,
        weeksSinceLastDate
      };
    } catch (error) {
      console.error('Error analyzing user pattern:', error);
      return null;
    }
  }

  // Extract a title from insight content
  static extractTitle(content: string): string {
    const sentences = content.split(/[.!?]/);
    const firstSentence = sentences[0]?.trim();
    
    if (firstSentence && firstSentence.length < 50) {
      return firstSentence;
    }
    
    // Fallback titles based on content keywords
    if (content.toLowerCase().includes('pattern')) return 'Dating Pattern Detected';
    if (content.toLowerCase().includes('celebration') || content.toLowerCase().includes('amazing')) return 'Milestone Achievement';
    if (content.toLowerCase().includes('suggestion') || content.toLowerCase().includes('try')) return 'Personalized Suggestion';
    
    return 'AI Insight';
  }

  // Run scheduled insight generation for all active users
  static async generateInsightsForActiveUsers(): Promise<void> {
    try {
      // Get users who have been active in the last 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const { data: activeUsers } = await supabase
        .from('date_journal')
        .select('user_id')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (!activeUsers) return;

      const uniqueUserIds = [...new Set(activeUsers.map(entry => entry.user_id))];

      // Generate insights for each user
      for (const userId of uniqueUserIds) {
        const shouldGenerate = await this.shouldGenerateInsights(userId);
        if (shouldGenerate) {
          await this.generateInsightsForUser(userId);
          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } catch (error) {
      console.error('Error generating insights for active users:', error);
    }
  }
}