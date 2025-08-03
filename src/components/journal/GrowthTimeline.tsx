import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useGrowthMetrics } from '@/hooks/useGrowthMetrics';

export const GrowthTimeline: React.FC = () => {
  const { metrics, loading } = useGrowthMetrics();

  if (loading) {
    return (
      <div className="space-y-6">
        <h3 className="text-2xl font-display font-semibold text-white">Your Growth Journey</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-charcoal-gray rounded-xl p-6 border border-gray-800 animate-pulse">
              <div className="h-4 bg-gray-700 rounded mb-3 w-3/4"></div>
              <div className="h-8 bg-gray-700 rounded mb-3"></div>
              <div className="h-3 bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (metrics.length === 0) {
    return (
      <div className="bg-charcoal-gray rounded-xl p-8 text-center border border-gray-800">
        <h3 className="text-2xl font-display font-semibold text-white mb-4">Your Growth Journey</h3>
        <div className="py-8 space-y-4">
          <div className="text-7xl mb-6 animate-gentle-pulse">🌱</div>
          <p className="text-gray-300 text-lg font-light">Your growth story starts here!</p>
          <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
            Complete a few journal entries to see how you're evolving in your dating journey.
          </p>
        </div>
      </div>
    );
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-400" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-orange-400" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-400';
      case 'down':
        return 'text-orange-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-display font-semibold text-white mb-2">Your Growth Journey</h3>
          <p className="text-gray-400 font-light tracking-wide">See how you're evolving this month</p>
        </div>
        <div className="text-3xl animate-gentle-pulse">📈</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric) => (
          <div
            key={metric.id}
            className="bg-charcoal-gray rounded-xl p-6 border border-gray-800 hover:border-goldenrod/30 hover:shadow-glow transition-all duration-500 group cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{metric.icon}</span>
                <h4 className="text-white font-medium tracking-wide">{metric.title}</h4>
              </div>
              {getTrendIcon(metric.trend)}
            </div>
            
            <div className="space-y-3">
              <div className="text-3xl font-display font-bold text-white group-hover:text-goldenrod transition-colors duration-300">
                {metric.value}
              </div>
              
              <p className={`text-sm font-light tracking-wide ${getTrendColor(metric.trend)}`}>
                {metric.description}
              </p>
            </div>

            {/* Progress indicator for positive trends */}
            {metric.trend === 'up' && (
              <div className="mt-3 h-1 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-400 to-goldenrod transition-all duration-300"
                  style={{ width: `${Math.min(Math.abs(metric.change) * 2, 100)}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Motivational message */}
      {metrics.length > 0 && (
        <div className="bg-charcoal-gray rounded-2xl p-6 border border-gray-800 hover:border-goldenrod/30 transition-all duration-300">
          <div className="flex items-center space-x-3 mb-3">
            <span className="text-2xl">💡</span>
            <h4 className="text-goldenrod font-display font-medium text-lg">Growth Insight</h4>
          </div>
          <p className="text-gray-300 font-light leading-relaxed tracking-wide">
            {getMotivationalMessage(metrics)}
          </p>
        </div>
      )}
    </div>
  );
};

// Helper function to generate motivational messages based on metrics
const getMotivationalMessage = (metrics: any[]) => {
  const positiveMetrics = metrics.filter(m => m.trend === 'up').length;
  const totalMetrics = metrics.length;
  
  if (positiveMetrics >= totalMetrics * 0.8) {
    return "You're on fire! Your dating journey is showing incredible growth across multiple areas. Keep building on this momentum.";
  } else if (positiveMetrics >= totalMetrics * 0.6) {
    return "Great progress! You're developing stronger self-awareness and making more intentional choices. You've come so far.";
  } else if (positiveMetrics >= totalMetrics * 0.4) {
    return "Steady growth is still growth! Every reflection and insight you gain is moving you closer to the connections you deserve.";
  } else {
    return "Every journey has its seasons. The awareness you're building through journaling is already a huge step forward.";
  }
};