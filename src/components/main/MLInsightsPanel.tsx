import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, Users, Target, X, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAICompanion } from '@/hooks/useAICompanion';
import { Badge } from '@/components/ui/badge';
import { AICompanionChat } from '@/components/ai/AICompanionChat';

interface MLInsight {
  id: string;
  title: string;
  content: string;
  insight_type: string;
  delivered: boolean;
  generated_at: string;
}

export const MLInsightsPanel: React.FC = () => {
  const [insights, setInsights] = useState<MLInsight[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { hasNewInsights, markInsightsAsRead } = useAICompanion();

  useEffect(() => {
    if (user && isOpen) {
      fetchInsights();
    }
  }, [user, isOpen]);

  const fetchInsights = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('rif_insights')
        .select('*')
        .eq('user_id', user.id)
        .eq('insight_type', 'ml_learning')
        .eq('delivered', false)
        .order('generated_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setInsights(data || []);
    } catch (error) {
      console.error('Error fetching ML insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const markInsightAsRead = async (insightId: string) => {
    try {
      await supabase
        .from('rif_insights')
        .update({ delivered: true, engaged: true })
        .eq('id', insightId);
      
      setInsights(prev => prev.filter(insight => insight.id !== insightId));
    } catch (error) {
      console.error('Error marking insight as read:', error);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'ml_learning':
        return <Brain className="h-5 w-5 text-primary" />;
      case 'compatibility':
        return <Users className="h-5 w-5 text-emerald-400" />;
      case 'preferences':
        return <Target className="h-5 w-5 text-amber-400" />;
      default:
        return <TrendingUp className="h-5 w-5 text-blue-400" />;
    }
  };

  // Always show AI companion chat button
  // Only hide if user is not logged in
  if (!user) return null;

  return (
    <>
      {/* AI Companion Chat */}
      {showAIChat && (
        <AICompanionChat onClose={() => setShowAIChat(false)} />
      )}

      {/* Enhanced trigger button with AI chat option */}
      <div className="fixed bottom-24 right-6 flex flex-col items-end space-y-3 z-50">
        {/* AI Companion Button */}
        <button
          onClick={() => {
            setShowAIChat(true);
            markInsightsAsRead();
          }}
          className="bg-goldenrod hover:bg-goldenrod/90 text-jet-black rounded-full p-4 shadow-golden-glow border border-goldenrod/30 transition-all duration-300 hover:scale-110 relative"
        >
          <MessageCircle className="h-5 w-5" />
          {hasNewInsights && (
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center p-0">
              •
            </Badge>
          )}
        </button>

        {/* Traditional ML Insights Button (if there are technical insights) */}
        {insights.length > 0 && (
          <button
            onClick={() => setIsOpen(true)}
            className="bg-primary/20 border border-primary/30 backdrop-blur-xl rounded-full p-3 hover:bg-primary/30 transition-all duration-300 shadow-lg"
          >
            <Brain className="h-5 w-5 text-primary" />
            <Badge className="absolute -top-2 -right-2 bg-goldenrod text-jet-black text-xs min-w-[20px] h-5 flex items-center justify-center p-0">
              {insights.length}
            </Badge>
          </button>
        )}
      </div>

      {/* Technical ML Insights panel */}
      {isOpen && (
        <div className="fixed inset-0 bg-jet-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-charcoal-gray border border-goldenrod/30 rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-white">Technical Insights</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="text-center text-gray-400 py-8">
                  <Brain className="h-8 w-8 mx-auto mb-2 animate-pulse" />
                  <p>Learning from your preferences...</p>
                </div>
              ) : (
                insights.map((insight) => (
                  <div
                    key={insight.id}
                    className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getInsightIcon(insight.insight_type)}
                        <h4 className="font-medium text-white text-sm">
                          {insight.title}
                        </h4>
                      </div>
                      <button
                        onClick={() => markInsightAsRead(insight.id)}
                        className="text-gray-400 hover:text-white text-xs"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {insight.content}
                    </p>
                    <div className="mt-3 text-xs text-gray-500">
                      {new Date(insight.generated_at).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-700 bg-gray-800/50">
              <p className="text-xs text-gray-400 text-center">
                Technical insights from our ML algorithms. For personalized guidance, try the AI Companion!
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};