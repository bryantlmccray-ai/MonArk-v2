import React from 'react';
import { Heart, MessageCircle, Calendar, Shield, Star, MapPin, Sparkles, Zap, Crown, Diamond } from 'lucide-react';

const FloatingIcon: React.FC<{ 
  icon: React.ComponentType<{ className?: string }>;
  delay: number;
  left: string;
  top: string;
  size?: 'sm' | 'md' | 'lg';
  luxury?: boolean;
}> = ({ icon: Icon, delay, left, top, size = 'md', luxury = false }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div 
      className="absolute pointer-events-none z-10"
      style={{ 
        left, 
        top,
        animationDelay: `${delay}ms`
      }}
    >
      <div className="animate-float hover-glow">
        <div className={`${luxury ? 'bg-gradient-to-br from-goldenrod/30 to-gold-dark/40 backdrop-blur-lg border-goldenrod/40 shadow-glow' : 'bg-parchment/80 backdrop-blur-sm border-taupe/20 shadow-gentle'} rounded-full p-3 border transition-all duration-500 hover:scale-110`}>
          <Icon className={`${sizeClasses[size]} ${luxury ? 'text-goldenrod animate-gentle-pulse' : 'text-taupe'}`} />
        </div>
      </div>
    </div>
  );
};

export const FloatingElements: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Premium floating icons with luxury variants */}
      <FloatingIcon 
        icon={Crown} 
        delay={0} 
        left="8%" 
        top="15%" 
        size="lg"
        luxury={true}
      />
      <FloatingIcon 
        icon={Diamond} 
        delay={2000} 
        left="88%" 
        top="12%" 
        size="md"
        luxury={true}
      />
      <FloatingIcon 
        icon={Heart} 
        delay={1000} 
        left="12%" 
        top="25%" 
        size="md"
      />
      <FloatingIcon 
        icon={Sparkles} 
        delay={3500} 
        left="85%" 
        top="65%" 
        size="lg"
        luxury={true}
      />
      <FloatingIcon 
        icon={Star} 
        delay={5000} 
        left="5%" 
        top="55%" 
        size="md"
        luxury={true}
      />
      <FloatingIcon 
        icon={MessageCircle} 
        delay={1500} 
        left="90%" 
        top="40%" 
        size="sm"
      />
      <FloatingIcon 
        icon={Shield} 
        delay={4000} 
        left="78%" 
        top="85%" 
        size="md"
      />
      <FloatingIcon 
        icon={Calendar} 
        delay={6500} 
        left="18%" 
        top="75%" 
        size="sm"
      />
      
      {/* Luxury gradient overlays */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-goldenrod/5 to-transparent pointer-events-none animate-shimmer" />
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-gold-dark/10 to-transparent pointer-events-none animate-gentle-pulse" />
    </div>
  );
};