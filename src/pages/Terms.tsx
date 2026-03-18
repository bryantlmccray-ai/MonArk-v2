import React from 'react';
import { TermsContent } from '@/components/legal/TermsContent';
import monarkLogoHorizontal from '@/assets/monark-logo-horizontal.png';

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center mb-6">
          <a href="/"><img src={monarkLogoHorizontal} alt="MonArk — Date well." className="h-10 w-auto object-contain" /></a>
        </div>
        <TermsContent />
      </div>
    </div>
  );
}
