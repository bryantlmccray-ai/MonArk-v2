
import React from 'react';

interface MonArkLogoProps {
  className?: string;
  showTitle?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  clickable?: boolean;
}

export const MonArkLogo: React.FC<MonArkLogoProps> = ({ 
  className = "", 
  showTitle = false,
  size = 'lg',
  onClick,
  clickable = false
}) => {
  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16', 
    lg: 'h-20 w-20',
    xl: 'h-24 w-24'
  };

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {showTitle && (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-yellow-400 tracking-wider">MonArk</h1>
          <p className="text-sm text-yellow-400/80 tracking-wide animate-pulse">date well.</p>
        </div>
      )}
      
      {/* The Logo Component */}
      <div 
        className={`relative ${clickable ? 'cursor-pointer transform transition-transform hover:scale-105' : ''}`}
        onClick={clickable ? onClick : undefined}
      >
        {/* Visual Effects Container: The glowing, pulsing backdrop */}
        <div className="absolute -inset-2 bg-yellow-400 rounded-full blur-xl opacity-25 animate-pulse"></div>

        {/* SVG Logo Container: Defines size and color */}
        <div className={`relative ${sizeClasses[size]} text-yellow-400 flex items-center justify-center bg-gray-900/50 rounded-full backdrop-blur-sm ${clickable ? 'hover:bg-gray-800/70 transition-colors' : ''}`}>
          {/* SVG element with a 100x100 coordinate system */}
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* 
              The "M" shape is drawn with a single path.
              It uses 'currentColor' to inherit the yellow color from its parent.
              The stroke-based design with no fill gives it a clean, outline look.
            */}
            <path 
              d="M25 75V25H35L50 50L65 25H75V75H65V40L50 65L35 40V75H25Z" 
              stroke="currentColor" 
              strokeWidth="5"
              fill="none"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
