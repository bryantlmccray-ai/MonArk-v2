import React from 'react';

interface CompatibilityHighlightsProps {
  highlights: string[];
  isVeryHighlighted?: boolean;
}

export const CompatibilityHighlights: React.FC<CompatibilityHighlightsProps> = ({
  highlights,
  isVeryHighlighted
}) => {
  if (highlights.length === 0) return null;

  return (
    <div className="space-y-1">
      <p className={`text-xs font-medium ${
        isVeryHighlighted ? 'text-primary' : 'text-goldenrod'
      }`}>
        {isVeryHighlighted ? '✨ Perfect Match Potential:' : 'Connection potential:'}
      </p>
      {highlights.slice(0, isVeryHighlighted ? 3 : 2).map((highlight, index) => (
        <div key={index} className="flex items-start text-gray-300 text-xs">
          <div className={`w-1 h-1 rounded-full mr-2 mt-1.5 flex-shrink-0 ${
            isVeryHighlighted ? 'bg-primary animate-pulse' : 'bg-goldenrod'
          }`} />
          <span className="line-clamp-1">{highlight}</span>
        </div>
      ))}
    </div>
  );
};