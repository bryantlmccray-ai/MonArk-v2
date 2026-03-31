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
  const rafId = useRef<number>(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mobileQuery = window.matchMedia('(max-width: 767px)');

    const onScroll = () => {
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
        const isMobile = mobileQuery.matches;

        if (scrollY === 0) {
          el.style.transform = 'none';
          el.style.opacity = '1';
          el.style.willChange = 'auto';
          return;
        }

        if (isMobile) {
          // Mobile: pure opacity dissolve, no movement
          const fadeProgress = Math.min(1, scrollY / 120);
          const easedFade = 1 - Math.pow(1 - fadeProgress, 2);
          el.style.transform = 'none';
          el.style.opacity = String(1 - easedFade);
        } else {
          // Desktop: slide-up + fade combined
          const slideProgress = Math.min(1, scrollY / 180);
          const fadeProgress = Math.min(1, scrollY / 180);
          const easedSlide = 1 - Math.pow(1 - slideProgress, 3);
          const easedFade = 1 - Math.pow(1 - fadeProgress, 2);
          el.style.transform = `translateY(${-easedSlide * 24}px)`;
          el.style.opacity = String(1 - easedFade);
        }

        el.style.willChange = 'transform, opacity';
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <motion.div
      ref={ref}
      className="py-2"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
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
