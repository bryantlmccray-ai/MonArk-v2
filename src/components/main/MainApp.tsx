import React, { useState } from 'react';
import { BottomNavigation } from './BottomNavigation';
import { SidebarNavigation } from './SidebarNavigation';
import { MonArkCircle } from './MonArkCircle';
import { Conversations } from './Conversations';
import { DatesJournal } from './DatesJournal';
import { Profile } from './Profile';
import { WeeklyOptionsList } from '../weekly/WeeklyOptionsList';
import { DebriefOverlay } from './overlays/DebriefOverlay';
import { TrustScoreOverlay } from './overlays/TrustScoreOverlay';
import { SettingsOverlay } from './overlays/SettingsOverlay';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNotificationTriggers } from '@/hooks/useNotificationTriggers';

export const MainApp: React.FC = () => {
  // Weekly is now the default/main view - no more discovery swiping
  const [activeTab, setActiveTab] = useState('weekly');
  const [datesJournalTab, setDatesJournalTab] = useState<'dates' | 'ark'>('dates');
  const [showDebrief, setShowDebrief] = useState(false);
  const [showTrustScore, setShowTrustScore] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const isMobile = useIsMobile();
  
  // Email notification triggers
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
        return <WeeklyOptionsList />;
    }
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-jet-black relative">
        <div className="pb-32 px-4">
          {renderActiveScreen()}
        </div>

        <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />

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
        <header className="fixed top-0 left-0 right-0 h-8 flex items-center justify-between bg-jet-black/95 backdrop-blur-xl border-b border-gray-800 z-40">
          <SidebarTrigger className="ml-4 text-white hover:text-goldenrod" />
        </header>

        <SidebarNavigation activeTab={activeTab} onTabChange={handleTabChange} onArkNavigation={handleJournalNavigation} />

        <main className="flex-1 pt-8">
          {renderActiveScreen()}
        </main>

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
