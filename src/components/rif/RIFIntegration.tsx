
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

  // Add debugging
  console.log('RIFIntegration props:', { mode, collectionType });
  console.log('RIF settings:', rifSettings);
  console.log('Loading:', loading);

  useEffect(() => {
    if (!loading && rifSettings && !rifSettings.rif_enabled && mode === 'collect') {
      console.log('Setting showConsent to true');
      setShowConsent(true);
    }
  }, [loading, rifSettings, mode]);

  if (loading) {
    console.log('RIF Integration loading...');
    return (
      <div className="min-h-screen bg-jet-black flex items-center justify-center">
        <div className="text-white">Loading RIF system...</div>
      </div>
    );
  }

  if (showConsent || mode === 'consent') {
    console.log('Showing RIF consent screen');
    return (
      <RIFConsentScreen 
        onConsent={(consented) => {
          console.log('RIF consent response:', consented);
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
    console.log('Showing RIF data collector');
    return (
      <RIFDataCollector 
        type={collectionType} 
        onComplete={onComplete} 
      />
    );
  }

  if (mode === 'dashboard') {
    console.log('Showing RIF privacy dashboard');
    return <RIFPrivacyDashboard />;
  }

  console.log('RIF Integration - no matching mode, returning null');
  return null;
};
