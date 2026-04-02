import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface MatchRevealCeremonyProps {
  children: React.ReactNode;
  matchCount: number;
  storageKey?: string;
}

/**
 * A luxury reveal animation that plays once per session when new matches arrive.
 * Shows a brief curtain-style entrance before revealing the actual content.
 */
export const MatchRevealCeremony = ({ children, matchCount, storageKey = 'monark-reveal-seen' }: MatchRevealCeremonyProps) => {
  const [phase, setPhase] = useState<'ceremony' | 'revealed'>(() => {
    const seen = sessionStorage.getItem(storageKey);
    return seen ? 'revealed' : 'ceremony';
  });

  useEffect(() => {
    if (phase === 'ceremony') {
      const timer = setTimeout(() => {
        setPhase('revealed');
        sessionStorage.setItem(storageKey, 'true');
      }, 2800);
      return () => clearTimeout(timer);
    }
  }, [phase, storageKey]);

  if (phase === 'revealed') {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="ceremony"
        className="flex flex-col items-center justify-center py-20 px-6"
        exit={{ opacity: 0, transition: { duration: 0.4 } }}
      >
        {/* Radiant glow */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        </motion.div>

        {/* Sparkle icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6"
        >
          <div className="w-16 h-16 rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-primary" />
          </div>
        </motion.div>

        {/* Title line */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: 'easeOut' }}
          className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-3"
        >
          Curated for you
        </motion.p>

        {/* Main heading */}
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7, ease: 'easeOut' }}
          className="font-serif text-3xl text-foreground text-center leading-snug"
        >
          Your new Ark<br />
          <span className="text-primary">has arrived.</span>
        </motion.h2>

        {/* Match count */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          className="mt-4 text-sm text-muted-foreground font-light"
        >
          {matchCount} {matchCount === 1 ? 'match' : 'matches'} hand-selected this week
        </motion.p>

        {/* Decorative line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 1.8, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 h-px w-16 bg-primary/30 origin-center"
        />
      </motion.div>
    </AnimatePresence>
  );
};
