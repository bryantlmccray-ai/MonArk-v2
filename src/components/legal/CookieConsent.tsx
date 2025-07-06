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
      <Card className="bg-charcoal-gray border-goldenrod/20 shadow-2xl">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <Cookie className="h-6 w-6 text-goldenrod flex-shrink-0 mt-1" />
            
            <div className="flex-1">
              <h3 className="text-white font-medium mb-2">Cookie Preferences</h3>
              <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                We use cookies to enhance your experience, analyze site usage, and assist with marketing. 
                By continuing, you agree to our use of cookies. You can manage your preferences anytime.
              </p>

              {showDetails && (
                <div className="mb-4 space-y-3 text-sm">
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <h4 className="text-white font-medium mb-1">Essential Cookies</h4>
                    <p className="text-gray-400">Required for basic site functionality and security. Cannot be disabled.</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <h4 className="text-white font-medium mb-1">Analytics Cookies</h4>
                    <p className="text-gray-400">Help us understand how you use our site to improve user experience.</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <h4 className="text-white font-medium mb-1">Marketing Cookies</h4>
                    <p className="text-gray-400">Used to deliver relevant ads and measure campaign effectiveness.</p>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleAcceptAll}
                  className="bg-goldenrod-gradient text-jet-black font-medium hover:shadow-golden-glow"
                >
                  Accept All
                </Button>
                
                <Button
                  onClick={handleAcceptEssential}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-white/10"
                >
                  Essential Only
                </Button>
                
                <Button
                  onClick={handleCustomize}
                  variant="ghost"
                  className="text-goldenrod hover:bg-goldenrod/10"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {showDetails ? 'Hide Details' : 'Customize'}
                </Button>
              </div>

              <div className="mt-3 text-xs text-gray-500">
                Learn more in our{' '}
                <a href="/privacy" className="text-goldenrod hover:underline">
                  Privacy Policy
                </a>
              </div>
            </div>

            <Button
              onClick={() => setShowBanner(false)}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white p-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};