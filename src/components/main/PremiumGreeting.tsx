import React from 'react';

interface PremiumGreetingProps {
  displayName: string;
}

const getTimeGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

export const PremiumGreeting: React.FC<PremiumGreetingProps> = ({ displayName }) => {
  const greeting = getTimeGreeting();

  return (
    <div className="py-2">
      <h1 className="font-editorial text-2xl md:text-3xl tracking-tight text-foreground">
        {greeting}, <span className="text-primary">{displayName}</span>
      </h1>
      <p className="text-sm font-caption text-muted-foreground mt-0.5 tracking-wide">
        Date well. Date with intention.
      </p>
    </div>
  );
};
