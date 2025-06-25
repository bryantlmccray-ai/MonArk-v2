
import React, { useState, useEffect } from 'react';
import { RIFConsentScreen } from './RIFConsentScreen';
import { RIFDataCollector } from './RIFDataCollector';
import { RIFPrivacyDashboard } from './RIFPrivacyDashboard';
import { useRIF } from '@/hooks/useRIF';

interface RIFIntegrationProps {
  mode: 'consent' | 'collect' | 'dashboard';
  collectionType?: 'onboarding' | 'post_date' | 'check_in' | 'behavioral';
  onComplete?: () => void;
}

export const RIFIntegration: React.FC<RIFIntegrationProps> = ({ 
  mode, 
  collectionType = 'onboarding', 
  onComplete 
}) => {
  const { rifSettings, loading } = useRIF();
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    if (!loading && rifSettings && !rifSettings.rif_enabled && mode === 'collect') {
      setShowConsent(true);
    }
  }, [loading, rifSettings, mode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-jet-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (showConsent || mode === 'consent') {
    return (
      <RIFConsentScreen 
        onConsent={(consented) => {
          if (consented) {
            setShowConsent(false);
            if (mode === 'consent') onComplete?.();
          } else {
            onComplete?.();
          }
        }} 
      />
    );
  }

  if (mode === 'collect') {
    return (
      <RIFDataCollector 
        type={collectionType} 
        onComplete={onComplete} 
      />
    );
  }

  if (mode === 'dashboard') {
    return <RIFPrivacyDashboard />;
  }

  return null;
};
