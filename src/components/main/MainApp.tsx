
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
import { NotificationCenter } from '../notifications/NotificationCenter';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNotifications } from '@/hooks/useNotifications';
import { useNotificationTriggers } from '@/hooks/useNotificationTriggers';

export const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('discover');
  const [datesJournalTab, setDatesJournalTab] = useState<'journal' | 'ark'>('journal');
  const [showDebrief, setShowDebrief] = useState(false);
  const [showTrustScore, setShowTrustScore] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const isMobile = useIsMobile();
  const { unreadCount } = useNotifications();
  
  // Set up notification triggers
  useNotificationTriggers();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Reset journal tab to default when leaving dates tab
    if (tab !== 'dates') {
      setDatesJournalTab('journal');
    }
  };

  const handleJournalNavigation = () => {
    setActiveTab('dates');
    setDatesJournalTab('journal');
  };

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'discover':
        return <DiscoveryMap />;
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
        <div className="pb-24">
          {renderActiveScreen()}
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
        
        {/* Notification Bell for Mobile */}
        <div className="fixed bottom-28 right-4 z-30">
          <Button
            onClick={() => setShowNotifications(true)}
            size="sm"
            className="rounded-full w-12 h-12 bg-goldenrod text-jet-black hover:bg-goldenrod/90 shadow-lg relative"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge 
                variant="secondary" 
                className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500 text-white flex items-center justify-center"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>
        </div>

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
        
        {showNotifications && (
          <NotificationCenter 
            isOpen={showNotifications} 
            onClose={() => setShowNotifications(false)} 
          />
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
          
          <Button
            onClick={() => setShowNotifications(true)}
            variant="ghost"
            size="sm"
            className="mr-4 relative text-white hover:text-goldenrod"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <Badge 
                variant="secondary" 
                className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-goldenrod text-jet-black flex items-center justify-center"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>
        </header>

        {/* Sidebar Navigation */}
        <SidebarNavigation activeTab={activeTab} onTabChange={handleTabChange} onArkNavigation={handleJournalNavigation} />

        {/* Main Content */}
        <main className="flex-1 pt-8">
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
        
        {showNotifications && (
          <NotificationCenter 
            isOpen={showNotifications} 
            onClose={() => setShowNotifications(false)} 
          />
        )}
      </div>
    </SidebarProvider>
  );
};
