import React from 'react';

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

export const PremiumGreeting: React.FC<PremiumGreetingProps> = ({ firstName }) => {
  const greeting = getTimeGreeting();

  return (
    <div className="py-2">
      <h1 className="font-editorial text-2xl md:text-3xl tracking-tight text-foreground">
        {greeting}, <span className="text-primary">{firstName}</span>.
      </h1>
      <p className="text-sm font-caption text-muted-foreground mt-0.5 tracking-wide">
        Date well. Date with intention.
      </p>
    </div>
  );
};
