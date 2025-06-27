
import React from 'react';
import { Lightbulb, TrendingUp, Calendar } from 'lucide-react';
import type { RIFInsight } from '@/hooks/useRhythm';

interface InsightsModuleProps {
  insights: RIFInsight[];
}

export const InsightsModule: React.FC<InsightsModuleProps> = ({ insights }) => {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'behavioral_pattern':
        return TrendingUp;
      case 'weekly':
        return Calendar;
      default:
        return Lightbulb;
    }
  };

  if (insights.length === 0) {
    return (
      <div className="bg-charcoal-gray rounded-xl p-6 border border-gray-800">
        <div className="flex items-center space-x-3 mb-4">
          <Lightbulb className="h-5 w-5 text-goldenrod" />
          <h3 className="text-white font-medium">Insights & Patterns</h3>
        </div>
        <p className="text-gray-400 text-sm">
          Your personalized insights will appear here as you engage with the app. 
          Keep exploring to discover patterns in your dating journey.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-charcoal-gray rounded-xl p-6 border border-gray-800">
      <div className="flex items-center space-x-3 mb-6">
        <Lightbulb className="h-5 w-5 text-goldenrod" />
        <h3 className="text-white font-medium">Insights & Patterns</h3>
      </div>
      
      <div className="space-y-4">
        {insights.map((insight) => {
          const InsightIcon = getInsightIcon(insight.insight_type);
          
          return (
            <div 
              key={insight.id} 
              className="p-4 bg-jet-black/50 rounded-lg border border-gray-700/50 hover:border-goldenrod/30 transition-colors"
            >
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-goldenrod/10 rounded-lg">
                  <InsightIcon className="h-4 w-4 text-goldenrod" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-medium text-sm mb-2">{insight.title}</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">{insight.content}</p>
                  <div className="text-xs text-gray-500 mt-2">
                    {new Date(insight.generated_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
