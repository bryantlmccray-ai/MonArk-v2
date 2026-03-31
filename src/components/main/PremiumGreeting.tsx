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

    const scrollParent =
      (el.closest('[class*="overflow"]') as HTMLElement) || null;

    const onScroll = () => {
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        const scrollY = scrollParent ? scrollParent.scrollTop : window.scrollY;

        // Two-layer animation driven by raw scrollY:
        // 1) Slide-up: 0→24px over first 180px of scroll
        // 2) Pure opacity dissolve: 0→1 over first 120px of scroll
        const slideProgress = Math.min(1, scrollY / 180);
        const fadeProgress = Math.min(1, scrollY / 120);

        // Ease-out curve for silky deceleration
        const easedSlide = 1 - Math.pow(1 - slideProgress, 3);
        const easedFade = 1 - Math.pow(1 - fadeProgress, 2);

        const translateY = -easedSlide * 24;
        const opacity = 1 - easedFade;

        el.style.transform = `translateY(${translateY}px)`;
        el.style.opacity = String(opacity);
        el.style.willChange = scrollY > 0 ? 'transform, opacity' : 'auto';
      });
    };

    const target = scrollParent || window;
    target.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // sync initial state

    return () => {
      target.removeEventListener('scroll', onScroll);
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
