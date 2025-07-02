import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface GrowthMetric {
  id: string;
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: string;
  description: string;
}

interface JournalEntry {
  id: string;
  date_completed: string;
  rating: number | null;
  tags: string[];
  would_repeat: boolean | null;
  learned_insights: string | null;
  reflection_notes: string | null;
  created_at: string;
}

export const useGrowthMetrics = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<GrowthMetric[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAndCalculateMetrics = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Fetch all journal entries
      const { data: entries, error } = await supabase
        .from('date_journal')
        .select('*')
        .eq('user_id', user.id)
        .order('date_completed', { ascending: false });

      if (error) throw error;

      if (!entries || entries.length === 0) {
        setMetrics([]);
        setLoading(false);
        return;
      }

      const now = new Date();
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);

      // Filter entries by time periods
      const currentMonthEntries = entries.filter(entry => 
        new Date(entry.date_completed || entry.created_at) >= currentMonth
      );
      
      const lastMonthEntries = entries.filter(entry => {
        const entryDate = new Date(entry.date_completed || entry.created_at);
        return entryDate >= lastMonth && entryDate < currentMonth;
      });

      const calculatedMetrics: GrowthMetric[] = [];

      // 1. Average Rating Trend
      const currentAvgRating = currentMonthEntries
        .filter(e => e.rating)
        .reduce((sum, e) => sum + (e.rating || 0), 0) / currentMonthEntries.filter(e => e.rating).length || 0;
      
      const lastAvgRating = lastMonthEntries
        .filter(e => e.rating)
        .reduce((sum, e) => sum + (e.rating || 0), 0) / lastMonthEntries.filter(e => e.rating).length || 0;

      if (currentAvgRating > 0) {
        const ratingChange = lastAvgRating > 0 ? ((currentAvgRating - lastAvgRating) / lastAvgRating) * 100 : 0;
        calculatedMetrics.push({
          id: 'rating_trend',
          title: 'Connection Quality',
          value: `${currentAvgRating.toFixed(1)}/5.0`,
          change: ratingChange,
          trend: ratingChange > 0 ? 'up' : ratingChange < 0 ? 'down' : 'stable',
          icon: '⭐',
          description: lastAvgRating > 0 
            ? `${ratingChange > 0 ? '+' : ''}${ratingChange.toFixed(1)}% from last month`
            : 'Your connection quality this month'
        });
      }

      // 2. Journaling Consistency
      const currentConsistency = currentMonthEntries.length;
      const lastConsistency = lastMonthEntries.length;
      
      if (currentConsistency > 0) {
        const consistencyChange = lastConsistency > 0 ? ((currentConsistency - lastConsistency) / lastConsistency) * 100 : 0;
        calculatedMetrics.push({
          id: 'consistency',
          title: 'Reflection Habit',
          value: `${currentConsistency} entries`,
          change: consistencyChange,
          trend: consistencyChange > 0 ? 'up' : consistencyChange < 0 ? 'down' : 'stable',
          icon: '📝',
          description: lastConsistency > 0 
            ? `${consistencyChange > 0 ? '+' : ''}${consistencyChange.toFixed(0)}% from last month`
            : 'Entries this month'
        });
      }

      // 3. Intentional Dating (Would Repeat Rate)
      const currentWouldRepeat = currentMonthEntries.filter(e => e.would_repeat === true).length;
      const currentTotal = currentMonthEntries.filter(e => e.would_repeat !== null).length;
      const currentRepeatRate = currentTotal > 0 ? (currentWouldRepeat / currentTotal) * 100 : 0;

      const lastWouldRepeat = lastMonthEntries.filter(e => e.would_repeat === true).length;
      const lastTotal = lastMonthEntries.filter(e => e.would_repeat !== null).length;
      const lastRepeatRate = lastTotal > 0 ? (lastWouldRepeat / lastTotal) * 100 : 0;

      if (currentTotal > 0) {
        const repeatChange = lastRepeatRate > 0 ? currentRepeatRate - lastRepeatRate : 0;
        calculatedMetrics.push({
          id: 'intentional_dating',
          title: 'Intentional Choices',
          value: `${currentRepeatRate.toFixed(0)}%`,
          change: repeatChange,
          trend: repeatChange > 0 ? 'up' : repeatChange < 0 ? 'down' : 'stable',
          icon: '🎯',
          description: lastRepeatRate > 0 
            ? `${repeatChange > 0 ? '+' : ''}${repeatChange.toFixed(1)}% from last month`
            : 'Would repeat rate this month'
        });
      }

      // 4. Self-Awareness Growth (Insights completion rate)
      const currentWithInsights = currentMonthEntries.filter(e => e.learned_insights && e.learned_insights.trim().length > 0).length;
      const currentInsightRate = currentMonthEntries.length > 0 ? (currentWithInsights / currentMonthEntries.length) * 100 : 0;

      const lastWithInsights = lastMonthEntries.filter(e => e.learned_insights && e.learned_insights.trim().length > 0).length;
      const lastInsightRate = lastMonthEntries.length > 0 ? (lastWithInsights / lastMonthEntries.length) * 100 : 0;

      if (currentMonthEntries.length > 0) {
        const insightChange = lastInsightRate > 0 ? currentInsightRate - lastInsightRate : 0;
        calculatedMetrics.push({
          id: 'self_awareness',
          title: 'Self-Awareness',
          value: `${currentInsightRate.toFixed(0)}%`,
          change: insightChange,
          trend: insightChange > 0 ? 'up' : insightChange < 0 ? 'down' : 'stable',
          icon: '🌱',
          description: lastInsightRate > 0 
            ? `${insightChange > 0 ? '+' : ''}${insightChange.toFixed(1)}% from last month`
            : 'Insight completion rate'
        });
      }

      // 5. Tag Evolution (most used positive tags)
      const positiveTagsThis = currentMonthEntries
        .flatMap(e => e.tags || [])
        .filter(tag => ['fun', 'meaningful', 'intentional', 'connected', 'authentic', 'comfortable'].includes(tag.toLowerCase()));
      
      const positiveTagsLast = lastMonthEntries
        .flatMap(e => e.tags || [])
        .filter(tag => ['fun', 'meaningful', 'intentional', 'connected', 'authentic', 'comfortable'].includes(tag.toLowerCase()));

      if (positiveTagsThis.length > 0) {
        const tagChange = positiveTagsLast.length > 0 ? ((positiveTagsThis.length - positiveTagsLast.length) / positiveTagsLast.length) * 100 : 0;
        calculatedMetrics.push({
          id: 'positive_experiences',
          title: 'Positive Experiences',
          value: `${positiveTagsThis.length} tags`,
          change: tagChange,
          trend: tagChange > 0 ? 'up' : tagChange < 0 ? 'down' : 'stable',
          icon: '✨',
          description: positiveTagsLast.length > 0 
            ? `${tagChange > 0 ? '+' : ''}${tagChange.toFixed(0)}% positive tags from last month`
            : 'Positive experience tags this month'
        });
      }

      setMetrics(calculatedMetrics);
    } catch (error) {
      console.error('Error calculating growth metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndCalculateMetrics();
  }, [user]);

  return {
    metrics,
    loading,
    refetch: fetchAndCalculateMetrics
  };
};