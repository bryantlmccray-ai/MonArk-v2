import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Heart, MapPin, Clock, Users, Calendar, Lightbulb, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface JournalInsightsDashboardProps {
  onBack: () => void;
  journalEntries: any[];
}

export const JournalInsightsDashboard: React.FC<JournalInsightsDashboardProps> = ({
  onBack,
  journalEntries
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('3months');

  // Calculate insights from journal entries
  const calculateInsights = () => {
    if (!journalEntries.length) return null;

    const ratings = journalEntries.filter(e => e.rating && typeof e.rating === 'number').map(e => e.rating as number);
    const avgRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0;
    
    // Activity frequency
    const activities = journalEntries.reduce((acc, entry) => {
      const activity = entry.date_activity?.toLowerCase() || '';
      if (activity.includes('coffee')) acc.coffee++;
      else if (activity.includes('dinner') || activity.includes('restaurant')) acc.dinner++;
      else if (activity.includes('walk') || activity.includes('park')) acc.outdoor++;
      else if (activity.includes('movie') || activity.includes('film')) acc.entertainment++;
      else acc.other++;
      return acc;
    }, { coffee: 0, dinner: 0, outdoor: 0, entertainment: 0, other: 0 });

    // Rating trends over time
    const ratingTrends = journalEntries
      .filter(e => e.rating && typeof e.rating === 'number' && e.date_completed)
      .sort((a, b) => new Date(a.date_completed).getTime() - new Date(b.date_completed).getTime())
      .slice(-10)
      .map((entry, index) => ({
        date: new Date(entry.date_completed).toLocaleDateString(),
        rating: entry.rating as number,
        index: index + 1
      }));

    // Most common tags
    const tagFrequency = journalEntries
      .flatMap(e => Array.isArray(e.tags) ? e.tags : [])
      .reduce((acc: Record<string, number>, tag: string) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {});

    const topTags = Object.entries(tagFrequency)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count: count as number }));

    // Personal growth insights
    const insights = [];
    
    if (avgRating > 4) {
      insights.push("You consistently have highly rated dates! You're great at choosing compatible partners and activities.");
    } else if (avgRating > 3) {
      insights.push("Your dates are generally positive. Consider what made your highest-rated experiences special.");
    }

    if (activities.coffee > activities.dinner) {
      insights.push("You prefer casual coffee dates over formal dinners. This suggests you value conversation and getting to know someone naturally.");
    }

    if (journalEntries.length > 10) {
      insights.push("You're actively dating and learning about yourself! This self-reflection will help you find better matches.");
    }

    const wouldRepeatPercentage = journalEntries.filter(e => e.would_repeat === true).length / journalEntries.length * 100;
    if (wouldRepeatPercentage > 70) {
      insights.push("You have a high rate of wanting to repeat activities, showing you're good at choosing enjoyable experiences.");
    }

    return {
      avgRating: avgRating.toFixed(1),
      totalDates: journalEntries.length,
      activities,
      ratingTrends,
      topTags,
      insights,
      wouldRepeatPercentage: wouldRepeatPercentage.toFixed(0)
    };
  };

  const data = calculateInsights();

  if (!data) {
    return (
      <div className="min-h-screen bg-jet-black p-6">
        <div className="max-w-md mx-auto text-center pt-20">
          <Lightbulb className="h-16 w-16 text-goldenrod mx-auto mb-4" />
          <h2 className="text-xl font-medium text-white mb-2">No Insights Yet</h2>
          <p className="text-gray-400 mb-6">
            Complete a few journal entries to unlock personalized insights about your dating patterns and growth.
          </p>
          <Button onClick={onBack} className="bg-goldenrod hover:bg-goldenrod/90 text-jet-black">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Journal
          </Button>
        </div>
      </div>
    );
  }

  const activityData = Object.entries(data.activities)
    .filter(([, count]) => (count as number) > 0)
    .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value: value as number }));

  const COLORS = ['#DAA520', '#B8860B', '#CD853F', '#D2691E', '#BC8F8F'];

  return (
    <div className="min-h-screen bg-jet-black p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-light text-white">Your Dating Insights</h1>
            <p className="text-gray-400 text-sm">Discover patterns and growth in your dating journey</p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-charcoal-gray border-gray-800">
            <CardContent className="p-4 text-center">
              <Calendar className="h-6 w-6 text-goldenrod mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{data.totalDates}</div>
              <div className="text-xs text-gray-400">Total Dates</div>
            </CardContent>
          </Card>
          
          <Card className="bg-charcoal-gray border-gray-800">
            <CardContent className="p-4 text-center">
              <Heart className="h-6 w-6 text-goldenrod mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{data.avgRating}</div>
              <div className="text-xs text-gray-400">Avg Rating</div>
            </CardContent>
          </Card>
          
          <Card className="bg-charcoal-gray border-gray-800">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 text-goldenrod mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{data.wouldRepeatPercentage}%</div>
              <div className="text-xs text-gray-400">Would Repeat</div>
            </CardContent>
          </Card>
          
          <Card className="bg-charcoal-gray border-gray-800">
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 text-goldenrod mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{data.topTags.length}</div>
              <div className="text-xs text-gray-400">Favorite Vibes</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Rating Trends */}
          <Card className="bg-charcoal-gray border-gray-800">
            <CardHeader>
              <CardTitle className="text-white text-lg">Rating Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.ratingTrends}>
                  <XAxis dataKey="index" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                  <YAxis domain={[1, 5]} axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                  <Bar dataKey="rating" fill="#DAA520" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Activity Breakdown */}
          <Card className="bg-charcoal-gray border-gray-800">
            <CardHeader>
              <CardTitle className="text-white text-lg">Favorite Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={activityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {activityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-4">
                {activityData.map((entry, index) => (
                  <Badge
                    key={entry.name}
                    className="text-xs"
                    style={{ backgroundColor: COLORS[index % COLORS.length] + '20', color: COLORS[index % COLORS.length], borderColor: COLORS[index % COLORS.length] + '40' }}
                  >
                    {entry.name}: {entry.value}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Personal Insights */}
        <Card className="bg-charcoal-gray border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center space-x-2">
              <Lightbulb className="h-5 w-5 text-goldenrod" />
              <span>Personal Growth Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.insights.map((insight, index) => (
              <div key={index} className="p-4 bg-jet-black rounded-lg border border-gray-700">
                <p className="text-gray-300">{insight}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Tags */}
        {data.topTags.length > 0 && (
          <Card className="bg-charcoal-gray border-gray-800">
            <CardHeader>
              <CardTitle className="text-white text-lg">Your Dating Vibes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {data.topTags.map(({ tag, count }) => (
                  <Badge
                    key={tag}
                    className="bg-goldenrod/20 text-goldenrod border-goldenrod/30 px-3 py-1"
                  >
                    {tag} ({count})
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};