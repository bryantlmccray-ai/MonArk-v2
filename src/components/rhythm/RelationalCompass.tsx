
import React from 'react';
import { Heart, Compass, Sparkles, Target } from 'lucide-react';
import type { RIFState } from '@/hooks/useRhythm';

interface RelationalCompassProps {
  rifState: RIFState | null;
}

export const RelationalCompass: React.FC<RelationalCompassProps> = ({ rifState }) => {
  const getStateIcon = (state: string) => {
    switch (state.toLowerCase()) {
      case 'exploring':
        return Compass;
      case 'grounded':
        return Target;
      case 'open':
        return Heart;
      case 'flowing':
        return Sparkles;
      default:
        return Compass;
    }
  };

  const getStateGradient = (colorPalette: any) => {
    if (!colorPalette) return 'from-blue-500 to-blue-600';
    
    const primary = colorPalette.primary || '#3B82F6';
    const secondary = colorPalette.secondary || '#93C5FD';
    
    return `from-[${primary}] to-[${secondary}]`;
  };

  if (!rifState) {
    return (
      <div className="bg-charcoal-gray rounded-xl p-6 border border-gray-800 animate-pulse">
        <div className="h-6 bg-gray-700 rounded mb-4"></div>
        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
      </div>
    );
  }

  const StateIcon = getStateIcon(rifState.current_state);

  return (
    <div className="bg-charcoal-gray rounded-xl p-6 border border-gray-800 relative overflow-hidden">
      {/* Subtle animated background */}
      <div className="absolute inset-0 opacity-5">
        <div className={`absolute inset-0 bg-gradient-to-r ${getStateGradient(rifState.color_palette)} animate-pulse`}></div>
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center space-x-4 mb-4">
          <div className={`p-3 rounded-full bg-gradient-to-r ${getStateGradient(rifState.color_palette)} bg-opacity-20`}>
            <StateIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-white font-medium text-lg">Relational Compass</h3>
            <p className="text-gray-400 text-sm">Your current emotional space</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-300 text-sm">Current State:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium bg-opacity-20 bg-gradient-to-r ${getStateGradient(rifState.color_palette)} text-white`}>
              {rifState.current_state}
            </span>
          </div>
          
          {rifState.state_description && (
            <p className="text-gray-300 text-sm leading-relaxed">
              {rifState.state_description}
            </p>
          )}
          
          <div className="text-xs text-gray-500 mt-4">
            Last updated: {new Date(rifState.last_updated).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};
