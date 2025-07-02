
import React, { useState } from 'react';
import { BottomNavigation } from './BottomNavigation';
import { SidebarNavigation } from './SidebarNavigation';
import { DiscoveryMap } from './DiscoveryMap';
import { MonArkCircle } from './MonArkCircle';
import { Conversations } from './Conversations';
import { DatesJournal } from './DatesJournal';
import { Profile } from './Profile';
import { DebriefOverlay } from './overlays/DebriefOverlay';
import { TrustScoreOverlay } from './overlays/TrustScoreOverlay';
import { SettingsOverlay } from './overlays/SettingsOverlay';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';

export const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('discover');
  const [showDebrief, setShowDebrief] = useState(false);
  const [showTrustScore, setShowTrustScore] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const isMobile = useIsMobile();

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'discover':
        return <DiscoveryMap />;
      case 'circle':
        return <MonArkCircle />;
      case 'matches':
        return <Conversations />;
      case 'dates':
        return <DatesJournal onStartDebrief={() => setShowDebrief(true)} />;
      case 'profile':
        return (
          <Profile
            onOpenTrustScore={() => setShowTrustScore(true)}
            onOpenSettings={() => setShowSettings(true)}
          />
        );
      default:
        return <DiscoveryMap />;
    }
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-jet-black relative">
        {/* Main Content */}
        <div className="pb-24">
          {renderActiveScreen()}
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Overlays */}
        {showDebrief && (
          <DebriefOverlay onClose={() => setShowDebrief(false)} />
        )}
        
        {showTrustScore && (
          <TrustScoreOverlay onClose={() => setShowTrustScore(false)} />
        )}
        
        {showSettings && (
          <SettingsOverlay onClose={() => setShowSettings(false)} />
        )}
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-jet-black">
        {/* Desktop Header with Trigger */}
        <header className="fixed top-0 left-0 right-0 h-12 flex items-center bg-jet-black/95 backdrop-blur-xl border-b border-gray-800 z-40">
          <SidebarTrigger className="ml-4 text-white hover:text-goldenrod" />
        </header>

        {/* Sidebar Navigation */}
        <SidebarNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Main Content */}
        <main className="flex-1 pt-12">
          {renderActiveScreen()}
        </main>

        {/* Overlays */}
        {showDebrief && (
          <DebriefOverlay onClose={() => setShowDebrief(false)} />
        )}
        
        {showTrustScore && (
          <TrustScoreOverlay onClose={() => setShowTrustScore(false)} />
        )}
        
        {showSettings && (
          <SettingsOverlay onClose={() => setShowSettings(false)} />
        )}
      </div>
    </SidebarProvider>
  );
};
