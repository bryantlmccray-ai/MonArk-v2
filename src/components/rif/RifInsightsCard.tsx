import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useRifBeta, ReflectionInsight } from '@/hooks/useRifBeta';
import { Sparkles, TrendingUp, Heart, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

const INSIGHT_ICONS: Record<ReflectionInsight['type'], React.ReactNode> = {
  pattern: <TrendingUp className="h-4 w-4" />,
  preference: <Heart className="h-4 w-4" />,
  recommendation: <Lightbulb className="h-4 w-4" />
};

const INSIGHT_COLORS: Record<ReflectionInsight['type'], string> = {
  pattern: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  preference: 'text-pink-400 bg-pink-400/10 border-pink-400/30',
  recommendation: 'text-goldenrod bg-goldenrod/10 border-goldenrod/30'
};

export const RifInsightsCard: React.FC = () => {
  const { insights, reflections, loading, getInsightSummary } = useRifBeta();

  if (loading) return null;

  // Don't show if no reflections yet
  if (reflections.length === 0) return null;

  // Show progress indicator if less than 3 reflections
  if (reflections.length < 3) {
    return (
      <Card className="bg-charcoal-gray border-gray-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="h-5 w-5 text-goldenrod" />
            <h3 className="font-medium text-white">MonArk Insights</h3>
          </div>
          <p className="text-sm text-gray-400">
            Complete {3 - reflections.length} more date reflection{3 - reflections.length !== 1 ? 's' : ''} to unlock personalized insights.
          </p>
          <div className="mt-3 flex gap-1">
            {[1, 2, 3].map(i => (
              <div 
                key={i}
                className={cn(
                  "h-2 flex-1 rounded-full",
                  i <= reflections.length ? "bg-goldenrod" : "bg-gray-700"
                )}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const summary = getInsightSummary();

  return (
    <Card className="bg-charcoal-gray border-gray-800">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="h-5 w-5 text-goldenrod" />
          <h3 className="font-medium text-white">MonArk Insights</h3>
          <span className="text-xs text-gray-500 ml-auto">
            Based on {reflections.length} date{reflections.length !== 1 ? 's' : ''}
          </span>
        </div>

        {summary && (
          <div className="mb-4 p-3 rounded-lg bg-goldenrod/10 border border-goldenrod/30">
            <p className="text-sm text-goldenrod">{summary}</p>
          </div>
        )}

        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div 
              key={index}
              className={cn(
                "p-3 rounded-lg border",
                INSIGHT_COLORS[insight.type]
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                {INSIGHT_ICONS[insight.type]}
                <span className="font-medium text-sm">{insight.title}</span>
              </div>
              <p className="text-sm text-gray-300">{insight.description}</p>
            </div>
          ))}
        </div>

        {insights.length === 0 && reflections.length >= 3 && (
          <p className="text-sm text-gray-400">
            Keep reflecting after dates—we're learning your preferences!
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default RifInsightsCard;
