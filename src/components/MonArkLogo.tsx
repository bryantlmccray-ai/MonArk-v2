
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
    sm: 'h-8',
    md: 'h-12', 
    lg: 'h-16',
    xl: 'h-20'
  };

  const LogoImage = () => (
    <img 
      src="/lovable-uploads/e11ccc80-2237-4aac-b579-dccb89f8d727.png" 
      alt="MonArk - Date well."
      className={`${sizeClasses[size]} w-auto object-contain transition-all duration-300 ${
        clickable ? 'hover:scale-105 hover:drop-shadow-lg cursor-pointer' : ''
      }`}
      onClick={clickable ? onClick : undefined}
    />
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
