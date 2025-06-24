
import React, { useState } from 'react';
import { BottomNavigation } from './BottomNavigation';
import { DiscoveryMap } from './DiscoveryMap';
import { MonArkCircle } from './MonArkCircle';
import { Conversations } from './Conversations';
import { DatesJournal } from './DatesJournal';
import { Profile } from './Profile';
import { DebriefOverlay } from './overlays/DebriefOverlay';
import { TrustScoreOverlay } from './overlays/TrustScoreOverlay';
import { SettingsOverlay } from './overlays/SettingsOverlay';

export const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('discover');
  const [showDebrief, setShowDebrief] = useState(false);
  const [showTrustScore, setShowTrustScore] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

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
};
