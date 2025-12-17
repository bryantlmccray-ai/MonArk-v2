import React, { useState, useEffect } from 'react';
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
import { RifInsightsCard } from '@/components/rif/RifInsightsCard';
import { PostDateReflection } from '@/components/rif/PostDateReflection';
import { useAnalytics } from '@/hooks/useAnalytics';

export const MainApp: React.FC = () => {
  // Weekly is now the default/main view - no more discovery swiping
  const [activeTab, setActiveTab] = useState('weekly');
  const [datesJournalTab, setDatesJournalTab] = useState<'dates' | 'ark'>('dates');
  const [showDebrief, setShowDebrief] = useState(false);
  const [showTrustScore, setShowTrustScore] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPostDateReflection, setShowPostDateReflection] = useState(false);
  const [reflectionPartnerName, setReflectionPartnerName] = useState('');
  const isMobile = useIsMobile();
  
  // Email notification triggers
  useNotificationTriggers();
  
  // Analytics tracking
  const { recordSession, recordWeeklyOptionsView } = useAnalytics();
  
  // Record session on mount
  useEffect(() => {
    recordSession();
  }, [recordSession]);

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

  // Handler for triggering post-date reflection
  const handleDateCompleted = (partnerName: string = '') => {
    setReflectionPartnerName(partnerName);
    setShowPostDateReflection(true);
  };

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'weekly':
        // Track weekly options view
        recordWeeklyOptionsView();
        return <WeeklyOptionsList />;
      case 'circle':
        return <MonArkCircle />;
      case 'matches':
        return <Conversations />;
      case 'dates':
        return (
          <DatesJournal 
            onStartDebrief={() => setShowDebrief(true)} 
            initialTab={datesJournalTab}
            onDateCompleted={handleDateCompleted}
          />
        );
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
      <div className="min-h-screen bg-background relative">
        <div className="pb-32 px-4 space-y-4">
          {/* RIF Beta Insights Card */}
          {activeTab === 'profile' && <RifInsightsCard />}
          
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

        {/* Post-Date Reflection Modal */}
        <PostDateReflection
          isOpen={showPostDateReflection}
          onClose={() => setShowPostDateReflection(false)}
          partnerName={reflectionPartnerName}
        />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <header className="fixed top-0 left-0 right-0 h-8 flex items-center justify-between bg-background/95 backdrop-blur-xl border-b border-border z-40">
          <SidebarTrigger className="ml-4 text-foreground hover:text-goldenrod" />
        </header>

        <SidebarNavigation activeTab={activeTab} onTabChange={handleTabChange} onArkNavigation={handleJournalNavigation} />

        <main className="flex-1 pt-8">
          {/* RIF Beta Insights Card for desktop */}
          {activeTab === 'profile' && (
            <div className="px-6 mb-4">
              <RifInsightsCard />
            </div>
          )}
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

        {/* Post-Date Reflection Modal */}
        <PostDateReflection
          isOpen={showPostDateReflection}
          onClose={() => setShowPostDateReflection(false)}
          partnerName={reflectionPartnerName}
        />
      </div>
    </SidebarProvider>
  );
};
