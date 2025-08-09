import React from 'react';
import { Heart, MessageCircle, Calendar, Shield, Star, MapPin, Sparkles, Zap } from 'lucide-react';

const FloatingIcon: React.FC<{ 
  icon: React.ComponentType<{ className?: string }>;
  delay: number;
  left: string;
  top: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ icon: Icon, delay, left, top, size = 'md' }) => {
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
        <div className="bg-parchment/80 backdrop-blur-sm rounded-full p-3 shadow-gentle border border-taupe/20">
          <Icon className={`${sizeClasses[size]} text-taupe`} />
        </div>
      </div>
    </div>
  );
};

export const FloatingElements: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating icons scattered around the hero */}
      <FloatingIcon 
        icon={Heart} 
        delay={0} 
        left="10%" 
        top="20%" 
        size="md"
      />
      <FloatingIcon 
        icon={MessageCircle} 
        delay={1500} 
        left="85%" 
        top="15%" 
        size="sm"
      />
      <FloatingIcon 
        icon={Sparkles} 
        delay={3000} 
        left="90%" 
        top="60%" 
        size="lg"
      />
      <FloatingIcon 
        icon={Calendar} 
        delay={4500} 
        left="15%" 
        top="70%" 
        size="md"
      />
      <FloatingIcon 
        icon={Shield} 
        delay={2000} 
        left="80%" 
        top="80%" 
        size="sm"
      />
      <FloatingIcon 
        icon={Star} 
        delay={6000} 
        left="5%" 
        top="50%" 
        size="md"
      />
      <FloatingIcon 
        icon={Zap} 
        delay={1000} 
        left="70%" 
        top="25%" 
        size="sm"
      />
      <FloatingIcon 
        icon={MapPin} 
        delay={7500} 
        left="25%" 
        top="85%" 
        size="lg"
      />
    </div>
  );
};