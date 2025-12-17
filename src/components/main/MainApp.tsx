import React, { useState } from 'react';
import { BottomNavigation } from './BottomNavigation';
import { SidebarNavigation } from './SidebarNavigation';
import { Navigation3DWrapper } from '../3d/Navigation3DWrapper';
import { DiscoveryMap } from './DiscoveryMap';
import { MonArkCircle } from './MonArkCircle';
import { Conversations } from './Conversations';
import { DatesJournal } from './DatesJournal';
import { Profile } from './Profile';
import { WeeklyOptionsList } from '../weekly/WeeklyOptionsList';
import { DebriefOverlay } from './overlays/DebriefOverlay';
import { TrustScoreOverlay } from './overlays/TrustScoreOverlay';
import { SettingsOverlay } from './overlays/SettingsOverlay';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Layers3 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNotificationTriggers } from '@/hooks/useNotificationTriggers';

export const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('discover');
  const [datesJournalTab, setDatesJournalTab] = useState<'dates' | 'ark'>('dates');
  const [showDebrief, setShowDebrief] = useState(false);
  const [showTrustScore, setShowTrustScore] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [use3DNavigation, setUse3DNavigation] = useState(false);
  const isMobile = useIsMobile();
  
  // Email notification triggers (no in-app notifications for MVP)
  useNotificationTriggers();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab !== 'dates') {
      setDatesJournalTab('dates');
    }
  };

  const handleJournalNavigation = () => {
    setActiveTab('dates');
    setDatesJournalTab('dates');
  };

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'discover':
        return <DiscoveryMap />;
      case 'weekly':
        return <WeeklyOptionsList />;
      case 'circle':
        return <MonArkCircle />;
      case 'matches':
        return <Conversations />;
      case 'dates':
        return <DatesJournal onStartDebrief={() => setShowDebrief(true)} initialTab={datesJournalTab} />;
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
        <div className="pb-32 px-4">
          {renderActiveScreen()}
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />

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
        <header className="fixed top-0 left-0 right-0 h-8 flex items-center justify-between bg-jet-black/95 backdrop-blur-xl border-b border-gray-800 z-40">
          <SidebarTrigger className="ml-4 text-white hover:text-goldenrod" />
          
          <div className="flex items-center gap-2 mr-4">
            <Button
              onClick={() => setUse3DNavigation(!use3DNavigation)}
              variant="ghost"
              size="sm"
              className={`text-white hover:text-goldenrod ${use3DNavigation ? 'text-goldenrod' : ''}`}
              title={use3DNavigation ? 'Switch to 2D Navigation' : 'Switch to 3D Navigation'}
            >
              <Layers3 className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Navigation - 3D or Traditional Sidebar */}
        {use3DNavigation ? (
          <div className="fixed left-0 top-8 bottom-0 w-80 z-30">
            <Navigation3DWrapper 
              activeTab={activeTab} 
              onTabChange={handleTabChange}
              className="w-full h-full"
            />
          </div>
        ) : (
          <SidebarNavigation activeTab={activeTab} onTabChange={handleTabChange} onArkNavigation={handleJournalNavigation} />
        )}

        {/* Main Content */}
        <main className={`flex-1 pt-8 ${use3DNavigation ? 'ml-80' : ''}`}>
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
