import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Cookie } from 'lucide-react';

export const CookieConsent: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('monark-cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('monark-cookie-consent', JSON.stringify({
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: Date.now()
    }));
    setShowBanner(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem('monark-cookie-consent', JSON.stringify({
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: Date.now()
    }));
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="max-w-4xl mx-auto bg-card border-2 border-border rounded-xl shadow-[0_-8px_40px_-4px_hsl(var(--foreground)/0.25)] p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Cookie className="h-5 w-5 text-primary flex-shrink-0" />

          <p className="flex-1 text-foreground/80 text-sm leading-relaxed font-medium">
            We use cookies to enhance your experience. Essential cookies are always active.{' '}
            <a href="/privacy" className="text-primary hover:underline font-semibold">
              Privacy Policy
            </a>
          </p>

          <div className="flex gap-3 flex-shrink-0">
            <Button onClick={handleAcceptAll} size="sm">
              Accept All
            </Button>
            <Button onClick={handleAcceptEssential} variant="outline" size="sm">
              Essential Only
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
