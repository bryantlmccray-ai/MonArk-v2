import React from 'react';
import { PrivacyDataPortal } from '@/components/privacy/PrivacyDataPortal';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-jet-black">
      <div className="container mx-auto px-4 py-8">
        <PrivacyDataPortal />
      </div>
    </div>
  );
}