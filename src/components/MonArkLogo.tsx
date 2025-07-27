
import React from 'react';

interface MonArkLogoProps {
  className?: string;
  showTitle?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  clickable?: boolean;
  variant?: 'default' | 'compact'; // New variant for different layout styles
  animated?: boolean; // New prop for enabling animations
}

export const MonArkLogo: React.FC<MonArkLogoProps> = ({ 
  className = "", 
  showTitle = false,
  size = 'lg',
  onClick,
  clickable = false,
  variant = 'default',
  animated = false
}) => {
  const sizeClasses = {
    sm: 'h-16',   // Increased from h-8
    md: 'h-24',   // Increased from h-12
    lg: 'h-32',   // Increased from h-16
    xl: 'h-48'    // Increased from h-20
  };

  const LogoImage = () => (
    <div className={`relative ${clickable ? 'cursor-pointer group' : ''} ${animated ? 'animate-gentle-float' : ''}`}>
      {/* Animated backdrop with soft edges */}
      <div className={`absolute -inset-4 bg-gradient-to-br from-primary/15 via-primary/5 to-accent/10 rounded-full blur-2xl transition-all duration-700 ${
        animated ? 'animate-gentle-pulse opacity-40' : 'opacity-60'
      } ${clickable ? 'group-hover:opacity-90 group-hover:scale-110' : ''}`}></div>
      
      {/* Shimmer overlay for animated logos */}
      {animated && (
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-shimmer opacity-60"></div>
      )}
      
      <img 
        src="/lovable-uploads/e11ccc80-2237-4aac-b579-dccb89f8d727.png" 
        alt="MonArk - Date well."
        className={`${sizeClasses[size]} w-auto object-contain relative z-10 rounded-2xl transition-all duration-700 ${
          clickable ? 'group-hover:scale-105 group-hover:drop-shadow-2xl' : ''
        } ${animated ? 'drop-shadow-xl animate-subtle-glow' : 'drop-shadow-lg'}`}
        onClick={clickable ? onClick : undefined}
      />
      
      {/* Elegant gold rim with animation */}
      <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/25 via-transparent to-accent/25 pointer-events-none transition-all duration-700 ${
        animated ? 'animate-gentle-pulse opacity-40' : 'opacity-30'
      } ${clickable ? 'group-hover:opacity-60' : ''}`}></div>
    </div>
  );

  if (variant === 'compact') {
    return (
      <div className={`flex items-center ${className}`}>
        <LogoImage />
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center ${showTitle ? 'gap-2' : 'gap-0'} ${className} ${animated ? 'animate-fade-in-up' : ''}`}>
      <div className={`${clickable ? 'transition-transform duration-300 hover:scale-105' : ''} ${animated ? 'animate-entrance-delay' : ''}`}>
        <LogoImage />
      </div>
      
      {/* Optional title overlay with animation */}
      {showTitle && (
        <div className={`text-center mt-2 ${animated ? 'animate-fade-in-up animation-delay-300' : ''}`}>
          <p className="text-sm text-primary/60 tracking-wide font-light italic animate-gentle-pulse">
            Luxury dating reimagined
          </p>
        </div>
      )}
    </div>
  );
};
