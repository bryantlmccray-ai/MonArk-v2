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
    <div
      className="px-5 md:px-6 py-3"
    >
      <motion.h1
        className="font-editorial text-xl md:text-2xl tracking-tight text-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {greeting},{' '}
        <span className="text-primary">{firstName}</span>
        <span className="text-primary/60">.</span>
      </motion.h1>
      <motion.p
        className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground/70 font-body mt-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
      >
        Date well. Date with intention.
      </motion.p>
    </div>
  );
};
