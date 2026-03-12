import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

interface JournalEntry {
  id: string;
  date_completed: string;
  rating: number | null;
  tags: string[];
  partner_name: string;
  date_activity: string;
  would_repeat: boolean | null;
  reflection_notes: string | null;
  learned_insights: string | null;
}

export const useJournalEngagement = () => {
  const { user } = useAuth();
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [weeklyGoal, setWeeklyGoal] = useState(3);
  const [entriesThisWeek, setEntriesThisWeek] = useState(0);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch journal entries
  const fetchJournalEntries = async () => {
    if (!user) {
      console.log('No user found, cannot fetch journal entries');
      return;
    }

    console.log('Fetching journal entries for user:', user.id);

    try {
      const { data, error } = await supabase
        .from('date_journal')
        .select('*')
        .eq('user_id', user.id)
        .order('date_completed', { ascending: false });

      if (error) {
        console.error('Supabase error fetching journal entries:', error);
        throw error;
      }
      
      console.log('Journal entries fetched:', data);
      setJournalEntries(data || []);
      
      // Generate achievements even with empty entries so locked ones show
      if (data !== null) {
        const generatedAchievements = generateAchievements(data || []);
        console.log('Generated achievements:', generatedAchievements);
        setAchievements(generatedAchievements);
      }
    } catch (error) {
      console.error('Error fetching journal entries:', error);
    }
  };

  // Calculate streak
  const calculateStreak = (entries: JournalEntry[]) => {
    if (!entries.length) return 0;

    const sortedEntries = entries
      .filter(e => e.date_completed)
      .sort((a, b) => new Date(b.date_completed).getTime() - new Date(a.date_completed).getTime());

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const entry of sortedEntries) {
      const entryDate = new Date(entry.date_completed);
      entryDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
      } else if (daysDiff === streak + 1) {
        // Allow for one day gap
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  // Calculate entries this week
  const calculateEntriesThisWeek = (entries: JournalEntry[]) => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    startOfWeek.setHours(0, 0, 0, 0);

    return entries.filter(entry => {
      const entryDate = new Date(entry.date_completed);
      return entryDate >= startOfWeek;
    }).length;
  };

  // Generate achievements
  const generateAchievements = (entries: JournalEntry[]): Achievement[] => {
    const totalEntries = entries.length;
    const streak = calculateStreak(entries);
    const averageRating = entries.filter(e => e.rating).reduce((sum, e) => sum + (e.rating || 0), 0) / entries.filter(e => e.rating).length || 0;
    const uniqueActivities = new Set(entries.map(e => e.date_activity.toLowerCase())).size;

    return [
      {
        id: 'first_entry',
        title: 'First Steps',
        description: 'Complete your first journal entry',
        icon: 'pencil',
        unlocked: totalEntries >= 1,
      },
      {
        id: 'week_streak',
        title: 'Consistent Reflector',
        description: 'Maintain a 7-day journaling streak',
        icon: 'flame',
        unlocked: streak >= 7,
        progress: Math.min(streak, 7),
        maxProgress: 7,
      },
      {
        id: 'ten_entries',
        title: 'Experienced Dater',
        description: 'Complete 10 journal entries',
        icon: 'sparkles',
        unlocked: totalEntries >= 10,
        progress: Math.min(totalEntries, 10),
        maxProgress: 10,
      },
      {
        id: 'high_ratings',
        title: 'Quality Connections',
        description: 'Maintain an average rating above 4',
        icon: '⭐',
        unlocked: averageRating >= 4 && totalEntries >= 5,
      },
      {
        id: 'diverse_activities',
        title: 'Adventure Seeker',
        description: 'Try 10 different types of activities',
        icon: '🎯',
        unlocked: uniqueActivities >= 10,
        progress: Math.min(uniqueActivities, 10),
        maxProgress: 10,
      },
      {
        id: 'month_streak',
        title: 'Dedication Master',
        description: 'Maintain a 30-day journaling streak',
        icon: '🏆',
        unlocked: streak >= 30,
        progress: Math.min(streak, 30),
        maxProgress: 30,
      },
    ];
  };

  // Generate personalized insights
  const generateInsights = (entries: JournalEntry[]): string[] => {
    if (entries.length < 3) return [];

    const insights: string[] = [];
    
    // Analyze patterns
    const recentEntries = entries.slice(0, 5);
    const hasPositiveTrend = recentEntries.filter(e => e.rating && e.rating >= 4).length >= 3;
    
    if (hasPositiveTrend) {
      insights.push("Your recent dates show a positive trend! You're getting better at choosing compatible matches.");
    }

    // Activity preferences
    const activities = entries.reduce((acc, entry) => {
      const activity = entry.date_activity.toLowerCase();
      if (activity.includes('coffee')) acc.coffee++;
      else if (activity.includes('dinner')) acc.dinner++;
      else if (activity.includes('walk') || activity.includes('park')) acc.outdoor++;
      return acc;
    }, { coffee: 0, dinner: 0, outdoor: 0 });

    const favoriteActivity = Object.entries(activities).sort(([,a], [,b]) => b - a)[0];
    if (favoriteActivity && favoriteActivity[1] > 2) {
      insights.push(`You seem to enjoy ${favoriteActivity[0]} dates the most. Consider this when planning future dates!`);
    }

    // Growth insights
    if (entries.length >= 10) {
      insights.push("You've completed over 10 journal entries! This level of self-reflection is helping you grow and find better matches.");
    }

    return insights.slice(0, 3);
  };

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchJournalEntries();
      setLoading(false);
    };

    if (user) {
      loadData();
    }
  }, [user]);

  // Update calculations when entries change
  useEffect(() => {
    // Always generate achievements even with empty entries
    setCurrentStreak(calculateStreak(journalEntries));
    setEntriesThisWeek(calculateEntriesThisWeek(journalEntries));
    setAchievements(generateAchievements(journalEntries));
    setInsights(generateInsights(journalEntries));
  }, [journalEntries]);

  const setReminder = async (enabled: boolean, time?: string) => {
    // This would integrate with push notification system
    console.log('Setting reminder:', enabled, time);
    // Store preference in user settings
  };

  return {
    journalEntries,
    currentStreak,
    weeklyGoal,
    entriesThisWeek,
    achievements,
    insights,
    loading,
    refetchEntries: fetchJournalEntries,
    setReminder,
  };
};