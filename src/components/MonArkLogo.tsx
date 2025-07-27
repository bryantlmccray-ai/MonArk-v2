
import React from 'react';

interface MonArkLogoProps {
  className?: string;
  showTitle?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  clickable?: boolean;
  variant?: 'default' | 'compact'; // New variant for different layout styles
}

export const MonArkLogo: React.FC<MonArkLogoProps> = ({ 
  className = "", 
  showTitle = false,
  size = 'lg',
  onClick,
  clickable = false,
  variant = 'default'
}) => {
  const sizeClasses = {
    sm: 'h-16',   // Increased from h-8
    md: 'h-24',   // Increased from h-12
    lg: 'h-32',   // Increased from h-16
    xl: 'h-48'    // Increased from h-20
  };

  const LogoImage = () => (
    <div className={`relative ${clickable ? 'cursor-pointer group' : ''}`}>
      {/* Elegant backdrop with soft edges */}
      <div className="absolute -inset-3 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 rounded-full blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
      
      <img 
        src="/lovable-uploads/e11ccc80-2237-4aac-b579-dccb89f8d727.png" 
        alt="MonArk - Date well."
        className={`${sizeClasses[size]} w-auto object-contain transition-all duration-500 relative z-10 ${
          clickable ? 'group-hover:scale-105 group-hover:drop-shadow-2xl filter drop-shadow-lg' : 'drop-shadow-lg'
        } rounded-2xl`}
        onClick={clickable ? onClick : undefined}
      />
      
      {/* Subtle gold rim glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 via-transparent to-accent/20 opacity-30 group-hover:opacity-50 transition-opacity duration-500 pointer-events-none"></div>
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
    <div className={`flex flex-col items-center ${showTitle ? 'gap-2' : 'gap-0'} ${className}`}>
      <div className={clickable ? 'transition-transform duration-300 hover:scale-105' : ''}>
        <LogoImage />
      </div>
      
      {/* Optional title overlay - only show if the logo doesn't include text */}
      {showTitle && (
        <div className="text-center mt-2">
          <p className="text-sm text-primary/60 tracking-wide font-light italic">
            Luxury dating reimagined
          </p>
        </div>
      )}
    </div>
  );
};
