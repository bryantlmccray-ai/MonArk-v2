import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface PremiumGreetingProps {
  firstName: string;
}

const getTimeGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 21) return 'Good evening';
  return 'Good night';
};

const getContextLine = (): string => {
  const day = new Date().getDay();
  if (day === 0) return 'Your weekly matches are here for you.';
  return 'Date well. Date with intention.';
};

export const PremiumGreeting: React.FC<PremiumGreetingProps> = ({ firstName }) => {
  const greeting = getTimeGreeting();
  const contextLine = getContextLine();
  const ref = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = useCallback(() => {
    if (!ref.current) return;
    const el = ref.current;
    const rect = el.getBoundingClientRect();
    const elHeight = el.offsetHeight;
    // Start fading as soon as the element begins to scroll off-screen
    // Full fade-out after scrolling 180px past the top of the element
    const fadeDistance = 180;
    const scrolled = Math.max(0, -rect.top + elHeight * 0.3);
    const progress = Math.min(1, scrolled / fadeDistance);
    setScrollProgress(progress);
  }, []);

  useEffect(() => {
    const scrollParent = ref.current?.closest('[class*="overflow"]') || window;
    const target = scrollParent === window ? window : scrollParent;
    target.addEventListener('scroll', handleScroll, { passive: true });
    return () => target.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const opacity = 1 - scrollProgress;
  const translateY = -scrollProgress * 24;

  return (
    <motion.div
      ref={ref}
      className="py-2"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        willChange: scrollProgress > 0 ? 'transform, opacity' : 'auto',
      }}
    >
      <h1 className="font-editorial text-2xl md:text-3xl tracking-tight text-foreground">
        {greeting}, <span className="text-primary">{firstName}</span>.
      </h1>
      <p className="text-sm font-caption text-muted-foreground mt-0.5 tracking-wide">
        {contextLine}
      </p>
      <div className="mt-3 h-px bg-primary/30" />
    </motion.div>
  );
};
