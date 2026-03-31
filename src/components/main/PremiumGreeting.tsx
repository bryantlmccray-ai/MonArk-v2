import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface PremiumGreetingProps {
  firstName: string;
}

const MOBILE_BREAKPOINT = 768;
const MOBILE_FADE_DISTANCE = 120;
const DESKTOP_FADE_DISTANCE = 120;
const DESKTOP_SLIDE_DISTANCE = 180;
const DESKTOP_SLIDE_OFFSET = 24;

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

const getScrollY = (): number => {
  if (typeof window === 'undefined') return 0;

  return (
    window.scrollY ??
    window.pageYOffset ??
    document.scrollingElement?.scrollTop ??
    document.documentElement.scrollTop ??
    0
  );
};

const resetStyles = (element: HTMLDivElement) => {
  element.style.opacity = '1';
  element.style.transform = 'translateY(0px)';
  element.style.willChange = 'auto';
};

const applyMobileStyles = (element: HTMLDivElement, scrollY: number) => {
  element.style.willChange = 'opacity';

  const fadeProgress = Math.min(1, scrollY / MOBILE_FADE_DISTANCE);
  const easedFade = 1 - Math.pow(fadeProgress, 2);

  element.style.opacity = String(easedFade);
  element.style.transform = 'translateY(0px)';
};

const applyDesktopStyles = (element: HTMLDivElement, scrollY: number) => {
  element.style.willChange = 'transform, opacity';

  const slideProgress = Math.min(1, scrollY / DESKTOP_SLIDE_DISTANCE);
  const fadeProgress = Math.min(1, scrollY / DESKTOP_FADE_DISTANCE);
  const easedSlide = 1 - Math.pow(1 - slideProgress, 3);
  const easedFade = 1 - Math.pow(fadeProgress, 2);
  const translateY = easedSlide * DESKTOP_SLIDE_OFFSET;

  element.style.transform = `translateY(-${translateY}px)`;
  element.style.opacity = String(easedFade);
};

export const PremiumGreeting = ({ firstName }: PremiumGreetingProps) => {
  const greeting = getTimeGreeting();
  const contextLine = getContextLine();
  const ref = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const cancelFrame = () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
    };

    const updateStyles = () => {
      const scrollY = getScrollY();
      const isMobile = window.innerWidth < MOBILE_BREAKPOINT;

      if (scrollY <= 0) {
        resetStyles(el);
        return;
      }

      if (isMobile) {
        applyMobileStyles(el, scrollY);
        return;
      }

      applyDesktopStyles(el, scrollY);
    };

    const onScroll = () => {
      cancelFrame();
      rafId.current = requestAnimationFrame(updateStyles);
    };

    resetStyles(el);
    updateStyles();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelFrame();
    };
  }, []);

  return (
    <div
      ref={ref}
      className="py-2"
      style={{ opacity: 1, transform: 'translateY(0px)' }}
    >
      <motion.div
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
    </div>
  );
};
