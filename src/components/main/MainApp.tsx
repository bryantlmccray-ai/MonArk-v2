
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
import { NotificationCenter } from '../notifications/NotificationCenter';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Layers3 } from 'lucide-react';
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
  const [use3DNavigation, setUse3DNavigation] = useState(false);
  const isMobile = useIsMobile();
  
  // Re-enable notification hooks with unique channel names
  const { unreadCount } = useNotifications();
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
        
        {/* Notification Bell for Mobile */}
        <div className="fixed bottom-36 right-4 z-30">
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
        
        <NotificationCenter 
          open={showNotifications} 
          onOpenChange={setShowNotifications} 
        />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-jet-black">
        {/* Desktop Header with Trigger */}
        <header className="fixed top-0 left-0 right-0 h-8 flex items-center justify-between bg-jet-black/95 backdrop-blur-xl border-b border-gray-800 z-40">
          <SidebarTrigger className="ml-4 text-white hover:text-goldenrod" />
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setUse3DNavigation(!use3DNavigation)}
              variant="ghost"
              size="sm"
              className={`text-white hover:text-goldenrod ${use3DNavigation ? 'text-goldenrod' : ''}`}
              title={use3DNavigation ? 'Switch to 2D Navigation' : 'Switch to 3D Navigation'}
            >
              <Layers3 className="h-4 w-4" />
            </Button>
            
            <Button
              onClick={() => setShowNotifications(true)}
              variant="ghost"
              size="sm"
              className="relative text-white hover:text-goldenrod"
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
        
        <NotificationCenter 
          open={showNotifications} 
          onOpenChange={setShowNotifications} 
        />
      </div>
    </SidebarProvider>
  );
};
