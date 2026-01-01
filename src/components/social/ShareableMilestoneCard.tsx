import React from 'react';
import { motion } from 'framer-motion';
import { MonArkLogo } from '../MonArkLogo';
import { Badge } from '@/components/ui/badge';

interface ShareableMilestoneCardProps {
  variant?: 'story' | 'feed';
  milestoneType?: 'first-match' | 'first-date' | 'connection' | 'weekly-insight';
  headline?: string;
  subtext?: string;
  accentColor?: 'terracotta' | 'sage' | 'navy';
}

export const ShareableMilestoneCard: React.FC<ShareableMilestoneCardProps> = ({
  variant = 'story',
  milestoneType = 'first-match',
  headline = 'MY FIRST MATCH',
  subtext,
  accentColor = 'terracotta'
}) => {
  const isStory = variant === 'story';
  
  // Aspect ratio classes
  const containerClass = isStory 
    ? 'aspect-[9/16] max-w-[360px]' 
    : 'aspect-square max-w-[400px]';

  // Color palette based on accent
  const accentColors = {
    terracotta: {
      accent: 'hsl(15, 45%, 55%)',
      accentLight: 'hsl(15, 35%, 75%)',
      glow: 'rgba(194, 130, 104, 0.3)'
    },
    sage: {
      accent: 'hsl(140, 25%, 45%)',
      accentLight: 'hsl(140, 20%, 65%)',
      glow: 'rgba(130, 160, 130, 0.3)'
    },
    navy: {
      accent: 'hsl(220, 40%, 25%)',
      accentLight: 'hsl(220, 30%, 45%)',
      glow: 'rgba(60, 80, 120, 0.3)'
    }
  };

  const colors = accentColors[accentColor];

  // Milestone-specific icons/symbols
  const getMilestoneSymbol = () => {
    switch (milestoneType) {
      case 'first-match':
        return '◇';
      case 'first-date':
        return '◈';
      case 'connection':
        return '◆';
      case 'weekly-insight':
        return '○';
      default:
        return '◇';
    }
  };

  return (
    <div 
      className={`${containerClass} relative overflow-hidden rounded-2xl`}
      style={{
        background: 'linear-gradient(165deg, hsl(220, 25%, 12%) 0%, hsl(220, 30%, 8%) 100%)'
      }}
    >
      {/* Grain texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.08] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Abstract journey line - the "Ark" motif */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M -10 75 Q 25 65, 40 50 T 70 35 T 110 20"
          fill="none"
          stroke={colors.accent}
          strokeWidth="0.3"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.6 }}
          transition={{ duration: 2, ease: "easeOut" }}
        />
        <motion.path
          d="M -5 80 Q 30 70, 45 55 T 75 40 T 115 25"
          fill="none"
          stroke={colors.accentLight}
          strokeWidth="0.15"
          strokeLinecap="round"
          strokeDasharray="2 4"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.4 }}
          transition={{ duration: 2.5, ease: "easeOut", delay: 0.3 }}
        />
      </svg>

      {/* Subtle glow effect */}
      <div 
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none"
        style={{ background: colors.glow }}
      />

      {/* Content container */}
      <div className="relative z-10 h-full flex flex-col justify-between p-8">
        {/* Top section - decorative */}
        <motion.div 
          className="flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div 
            className="text-3xl opacity-20"
            style={{ color: colors.accent }}
          >
            {getMilestoneSymbol()}
          </div>
        </motion.div>

        {/* Middle section - main content */}
        <div className={`flex-1 flex flex-col ${isStory ? 'justify-center' : 'justify-center'} items-start`}>
          {/* Pre-headline */}
          <motion.p 
            className="text-sm tracking-[0.25em] uppercase mb-4 font-light"
            style={{ 
              color: colors.accentLight,
              fontFamily: "'Inter', 'system-ui', sans-serif"
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            This week my ark brought me
          </motion.p>

          {/* Main headline */}
          <motion.h1 
            className="text-3xl md:text-4xl font-normal tracking-[0.15em] leading-tight mb-6"
            style={{ 
              fontFamily: "'Canela', 'Playfair Display', 'Georgia', serif",
              color: 'hsl(35, 30%, 92%)'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {headline}
          </motion.h1>

          {/* Optional subtext */}
          {subtext && (
            <motion.p 
              className="text-sm opacity-60 max-w-[200px]"
              style={{ 
                fontFamily: "'Inter', 'system-ui', sans-serif",
                color: 'hsl(35, 20%, 80%)'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 0.7 }}
            >
              {subtext}
            </motion.p>
          )}

          {/* Emotional Intelligence indicator */}
          <motion.div 
            className="mt-8 flex items-center gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center border"
              style={{ 
                borderColor: colors.accent,
                background: `${colors.accent}15`
              }}
            >
              <span 
                className="text-xs"
                style={{ color: colors.accent }}
              >
                EQ
              </span>
            </div>
            <span 
              className="text-xs tracking-wider opacity-50"
              style={{ color: 'hsl(35, 20%, 80%)' }}
            >
              Emotional Intelligence Match
            </span>
          </motion.div>
        </div>

        {/* Bottom section - branding */}
        <motion.div 
          className="flex items-center justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="flex items-center gap-3">
            <MonArkLogo size="sm" showTitle={false} />
            <span 
              className="text-lg tracking-[0.2em] font-light"
              style={{ 
                fontFamily: "'Canela', 'Playfair Display', serif",
                color: 'hsl(35, 30%, 92%)'
              }}
            >
              MonArk
            </span>
          </div>
          <Badge 
            variant="outline" 
            className="border-white/20 bg-white/5 text-white/60 text-[10px] tracking-wider"
          >
            BETA
          </Badge>
        </motion.div>
      </div>
    </div>
  );
};
