import React, { useState, useEffect } from 'react';
import { RIFConsentScreen } from './RIFConsentScreen';
import { useRIF } from '@/hooks/useRIF';

interface RIFIntegrationProps {
  mode: 'consent' | 'collect' | 'dashboard';
  collectionType?: 'onboarding' | 'post_date' | 'check_in' | 'behavioral';
  onComplete?: () => void;
}

/**
 * MVP RIF Integration - Basic Consent Only
 * Full RIF framework (behavioral tracking, insights, dashboard) cut for MVP
 * Only basic intake questions (10-15) to power matching
 */
export const RIFIntegration: React.FC<RIFIntegrationProps> = ({ 
  mode, 
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

  // All modes now show consent screen or complete immediately
  // Full RIF dashboard and behavioral collection cut for MVP
  if (showConsent || mode === 'consent') {
    return (
      <RIFConsentScreen 
        onConsent={(consented) => {
          if (consented) {
            setShowConsent(false);
          }
          onComplete?.();
        }} 
      />
    );
  }

  // For collect and dashboard modes, just complete immediately (MVP simplification)
  if (mode === 'collect' || mode === 'dashboard') {
    onComplete?.();
    return null;
  }

  return null;
};
