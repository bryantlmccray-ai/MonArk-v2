import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Cookie, Settings } from 'lucide-react';

export const CookieConsent: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

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

  const handleCustomize = () => {
    setShowDetails(!showDetails);  
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Card className="bg-card border-2 border-foreground/20 shadow-[0_-8px_40px_-4px_hsl(var(--foreground)/0.25)]">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <Cookie className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
            
            <div className="flex-1">
              <h3 className="text-foreground font-medium mb-2">Cookie Preferences</h3>
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                We use cookies to enhance your experience, analyze site usage, and assist with marketing. 
                By continuing, you agree to our use of cookies. You can manage your preferences anytime.
              </p>

              {showDetails && (
                <div className="mb-4 space-y-3 text-sm">
                  <div className="bg-muted rounded-lg p-3">
                    <h4 className="text-foreground font-medium mb-1">Essential Cookies</h4>
                    <p className="text-muted-foreground">Required for basic site functionality and security. Cannot be disabled.</p>
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <h4 className="text-foreground font-medium mb-1">Analytics Cookies</h4>
                    <p className="text-muted-foreground">Help us understand how you use our site to improve user experience.</p>
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <h4 className="text-foreground font-medium mb-1">Marketing Cookies</h4>
                    <p className="text-muted-foreground">Used to deliver relevant ads and measure campaign effectiveness.</p>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleAcceptAll}
                >
                  Accept All
                </Button>
                
                <Button
                  onClick={handleAcceptEssential}
                  variant="outline"
                >
                  Essential Only
                </Button>
                
                <Button
                  onClick={handleCustomize}
                  variant="ghost"
                  className="text-primary hover:bg-primary/10"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {showDetails ? 'Hide Details' : 'Customize'}
                </Button>
              </div>

              <div className="mt-3 text-xs text-muted-foreground">
                Learn more in our{' '}
                <a href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </a>
              </div>
            </div>

            <Button
              onClick={() => setShowBanner(false)}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground p-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
