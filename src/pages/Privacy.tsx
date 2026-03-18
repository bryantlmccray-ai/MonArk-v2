import React, { useState } from 'react';
import { PrivacyPolicyContent } from '@/components/legal/PrivacyPolicyContent';
import { PrivacyDataPortal } from '@/components/privacy/PrivacyDataPortal';
import { DataDeletionManager } from '@/components/privacy/DataDeletionManager';
import { Button } from '@/components/ui/button';
import { FileText, Settings } from 'lucide-react';
import monarkLogoHorizontal from '@/assets/monark-logo-horizontal.png';

export default function Privacy() {
  const [activeTab, setActiveTab] = useState<'policy' | 'data'>('policy');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Brand header */}
        <div className="flex justify-center mb-6">
          <a href="/"><img src={monarkLogoHorizontal} alt="MonArk — Date well." className="h-10 w-auto object-contain" /></a>
        </div>
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-card rounded-lg p-1 border border-border">
            <Button
              variant={activeTab === 'policy' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('policy')}
              className={`${
                activeTab === 'policy'
                  ? ''
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileText className="h-4 w-4 mr-2" />
              Privacy Policy
            </Button>
            <Button
              variant={activeTab === 'data' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('data')}
              className={`${
                activeTab === 'data'
                  ? ''
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Settings className="h-4 w-4 mr-2" />
              Data Management
            </Button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'policy' ? (
          <PrivacyPolicyContent />
        ) : (
          <div className="space-y-8">
            <PrivacyDataPortal />
            <DataDeletionManager />
          </div>
        )}
      </div>
    </div>
  );
}
