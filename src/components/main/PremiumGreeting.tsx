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

export const PremiumGreeting = ({ firstName }: PremiumGreetingProps) => {
  const greeting = getTimeGreeting();

  return (
    <motion.div
      className="sticky top-[53px] md:top-12 z-30 bg-background/95 backdrop-blur-xl border-b border-border/30 px-5 md:px-6 py-3"
      initial={{ opacity: 0, y: -6, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.h1
        className="font-editorial text-xl md:text-2xl tracking-tight text-foreground"
        initial={{ opacity: 0, letterSpacing: '0.06em' }}
        animate={{ opacity: 1, letterSpacing: '-0.01em' }}
        transition={{ duration: 1.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        {greeting},{' '}
        <motion.span
          className="text-primary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.7, ease: 'easeOut' }}
        >
          {firstName}
        </motion.span>
        <motion.span
          className="text-primary/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.3 }}
        >
          .
        </motion.span>
      </motion.h1>
      <motion.p
        className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground/70 font-body mt-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, delay: 1.6, ease: 'easeOut' }}
      >
        Date well. Date with intention.
      </motion.p>
    </motion.div>
  );
};
