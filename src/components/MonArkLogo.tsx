
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
    sm: 'h-18',   // Increased more for better frame fill
    md: 'h-28',   // Increased more for better frame fill
    lg: 'h-36',   // Increased more for better frame fill
    xl: 'h-52'    // Increased more for better frame fill
  };

  const LogoImage = () => (
    <div className={`relative ${clickable ? 'cursor-pointer group' : ''} ${animated ? 'animate-gentle-float' : ''}`}>
      {/* Larger, softer animated backdrop */}
      <div className={`absolute -inset-6 bg-gradient-to-br from-primary/15 via-primary/5 to-accent/10 rounded-full blur-3xl transition-all duration-700 ${
        animated ? 'animate-gentle-pulse opacity-50' : 'opacity-70'
      } ${clickable ? 'group-hover:opacity-95 group-hover:scale-115' : ''}`}></div>
      
      {/* Secondary soft glow layer */}
      <div className={`absolute -inset-4 bg-gradient-to-br from-accent/20 via-transparent to-primary/15 rounded-full blur-2xl transition-all duration-700 ${
        animated ? 'animate-gentle-pulse opacity-40' : 'opacity-50'
      } ${clickable ? 'group-hover:opacity-80' : ''}`}></div>
      
      {/* Shimmer overlay for animated logos */}
      {animated && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-primary/25 to-transparent animate-shimmer opacity-70"></div>
      )}
      
      <img 
        src="/lovable-uploads/e11ccc80-2237-4aac-b579-dccb89f8d727.png" 
        alt="MonArk - Date well."
        className={`${sizeClasses[size]} w-auto object-contain relative z-10 rounded-full transition-all duration-700 p-2 ${
          clickable ? 'group-hover:scale-105 group-hover:drop-shadow-2xl' : ''
        } ${animated ? 'drop-shadow-2xl animate-subtle-glow' : 'drop-shadow-xl'}`}
        onClick={clickable ? onClick : undefined}
        style={{ filter: 'drop-shadow(0 0 20px rgba(212, 175, 55, 0.4))' }}
      />
      
      {/* Ultra-soft gold rim with enhanced blur */}
      <div className={`absolute inset-2 rounded-full bg-gradient-to-br from-primary/30 via-transparent to-accent/30 pointer-events-none transition-all duration-700 blur-sm ${
        animated ? 'animate-gentle-pulse opacity-50' : 'opacity-40'
      } ${clickable ? 'group-hover:opacity-70' : ''}`}></div>
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
