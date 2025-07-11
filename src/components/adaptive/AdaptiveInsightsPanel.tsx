import React from 'react';
import { Brain, TrendingUp, Heart, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAdaptiveDiscovery, AdaptiveInsight } from '@/hooks/useAdaptiveDiscovery';

interface AdaptiveInsightsPanelProps {
  className?: string;
}

export const AdaptiveInsightsPanel: React.FC<AdaptiveInsightsPanelProps> = ({ className }) => {
  const { 
    insights, 
    currentJourneyStage,
    markInsightAsDelivered, 
    markInsightAsEngaged, 
    dismissInsight,
    loading 
  } = useAdaptiveDiscovery();

  const getInsightIcon = (type: AdaptiveInsight['insight_type']) => {
    switch (type) {
      case 'pattern_recognition':
        return Brain;
      case 'preference_shift':
        return TrendingUp;
      case 'growth_opportunity':
        return Heart;
      default:
        return AlertCircle;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-emerald-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleEngagement = async (insight: AdaptiveInsight) => {
    await markInsightAsEngaged(insight.id);
    await markInsightAsDelivered(insight.id);
  };

  const handleDismiss = async (insight: AdaptiveInsight) => {
    await dismissInsight(insight.id);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/3"></div>
          <div className="h-3 bg-muted rounded w-full"></div>
          <div className="h-3 bg-muted rounded w-2/3"></div>
        </div>
      </Card>
    );
  }

  if (insights.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Brain className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No New Insights</h3>
        <p className="text-muted-foreground">
          MonArk is learning about your preferences. Keep using the app to unlock personalized insights!
        </p>
        {currentJourneyStage && (
          <Badge variant="secondary" className="mt-4">
            Current Stage: {currentJourneyStage.stage.charAt(0).toUpperCase() + currentJourneyStage.stage.slice(1)}
          </Badge>
        )}
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {currentJourneyStage && (
        <Card className="p-4 border-l-4 border-l-primary">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Your Journey Stage</h4>
              <p className="text-sm text-muted-foreground">
                Currently: <span className="font-medium">{currentJourneyStage.stage}</span>
              </p>
            </div>
            <Badge variant="outline">
              Day {Math.ceil((Date.now() - new Date(currentJourneyStage.stage_start_date).getTime()) / (1000 * 60 * 60 * 24))}
            </Badge>
          </div>
        </Card>
      )}

      {insights.map((insight) => {
        const Icon = getInsightIcon(insight.insight_type);
        
        return (
          <Card key={insight.id} className="p-6 relative">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">{insight.insight_title}</h3>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant="outline" 
                      className={getConfidenceColor(insight.confidence_level)}
                    >
                      {Math.round(insight.confidence_level * 100)}% confidence
                    </Badge>
                  </div>
                </div>
                
                <p className="text-muted-foreground mb-4">
                  {insight.insight_content}
                </p>
                
                {insight.actionable_suggestions && insight.actionable_suggestions.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Suggestions:</h4>
                    <ul className="space-y-1">
                      {insight.actionable_suggestions.map((suggestion, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start">
                          <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleEngagement(insight)}
                    className="flex items-center space-x-1"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Got it</span>
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDismiss(insight)}
                    className="flex items-center space-x-1"
                  >
                    <X className="h-4 w-4" />
                    <span>Dismiss</span>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};