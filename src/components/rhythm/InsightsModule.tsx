
import React from 'react';
import { Lightbulb, TrendingUp, Calendar, MessageCircle, Heart, Clock } from 'lucide-react';
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
        
        <div className="space-y-4">
          <p className="text-gray-300 text-sm leading-relaxed">
            Your AI companion will discover meaningful patterns in your dating journey and share personalized insights to help you grow.
          </p>
          
          {/* Example insights to show what users can expect */}
          <div className="space-y-3">
            <p className="text-goldenrod text-sm font-medium">Examples of insights you'll receive:</p>
            
            <div className="space-y-2">
              <div className="flex items-start space-x-3 p-3 bg-jet-black/30 rounded-lg border border-gray-700/30">
                <TrendingUp className="h-4 w-4 text-goldenrod mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-300 text-xs font-medium">Pattern Recognition</p>
                  <p className="text-gray-400 text-xs">"You tend to feel most connected during creative activities like art galleries or cooking together."</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-jet-black/30 rounded-lg border border-gray-700/30">
                <Calendar className="h-4 w-4 text-goldenrod mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-300 text-xs font-medium">Weekly Insights</p>
                  <p className="text-gray-400 text-xs">"This week you've been more open to spontaneous plans - this aligns with your growing confidence."</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-jet-black/30 rounded-lg border border-gray-700/30">
                <Heart className="h-4 w-4 text-goldenrod mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-300 text-xs font-medium">Growth Observations</p>
                  <p className="text-gray-400 text-xs">"Your comfort with vulnerability has increased - you're sharing more authentic parts of yourself."</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Clear next steps */}
          <div className="border-t border-gray-700/50 pt-4">
            <p className="text-gray-400 text-sm mb-3">To start generating insights:</p>
            <div className="space-y-2 text-xs text-gray-500">
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-3 w-3" />
                <span>Complete reflection prompts below</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-3 w-3" />
                <span>Log your dating experiences in the Journal tab</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-3 w-3" />
                <span>Check in regularly to track your emotional patterns</span>
              </div>
            </div>
          </div>
        </div>
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
