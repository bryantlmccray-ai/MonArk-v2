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

export const PremiumGreeting = ({ firstName }: PremiumGreetingProps) => {
  const greeting = getTimeGreeting();
  const contextLine = getContextLine();

  return (
    <motion.div
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
