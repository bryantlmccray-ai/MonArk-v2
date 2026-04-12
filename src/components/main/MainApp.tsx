import React, { useState, useEffect } from 'react';
import { BottomNavigation } from './BottomNavigation';
import { SidebarNavigation } from './SidebarNavigation';
import { MonArkCircle } from './MonArkCircle';
import { Conversations } from './Conversations';
import { DatesJournal } from './DatesJournal';
import { Profile } from './Profile';
import { SundayMatches } from '../matching/SundayMatches';
import { DebriefOverlay } from './overlays/DebriefOverlay';
import { TrustScoreOverlay } from './overlays/TrustScoreOverlay';
import { SettingsOverlay } from './overlays/SettingsOverlay';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNotificationTriggers } from '@/hooks/useNotificationTriggers';
import { RifInsightsCard } from '@/components/rif/RifInsightsCard';
import { PostDateReflection } from '@/components/rif/PostDateReflection';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useContactFeedback } from '@/hooks/useContactFeedback';
import { ContactShareFeedback } from '@/components/feedback/ContactShareFeedback';
import { MilestoneCardShowcase } from '@/components/social/MilestoneCardShowcase';
import { DiscoverMode } from '@/components/matching/DiscoverMode';
import { PendingConnections } from '@/components/matching/PendingConnections';
import { useProgressiveProfile } from '@/hooks/useProgressiveProfile';
import RIFQuiz from '@/components/onboarding/RIFQuiz';
import { ProfileGate } from '@/components/common/ProfileGate';
import PaywallModal from '@/components/PaywallModal';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MonArkLogo } from '@/components/MonArkLogo';
import NotificationBell from '@/components/NotificationBell';
import { Settings, LogOut } from 'lucide-react';
import { PremiumGreeting } from './PremiumGreeting';

interface MainAppProps {
  initialTab?: string;
}

export const MainApp: React.FC<MainAppProps> = ({ initialTab = 'weekly' }) => {
  // Weekly is now the default/main view - no more discovery swiping
  const [activeTab, setActiveTab] = useState(initialTab);
  const [datesJournalTab, setDatesJournalTab] = useState<'dates' | 'ark'>('dates');
  const [showDebrief, setShowDebrief] = useState(false);
  const [showTrustScore, setShowTrustScore] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPostDateReflection, setShowPostDateReflection] = useState(false);
  const [reflectionPartnerName, setReflectionPartnerName] = useState('');
  const isMobile = useIsMobile();
  const { showPaywall, setShowPaywall, tier } = useSubscription();
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  
  const firstName = profile?.first_name || user?.user_metadata?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'there';
  const avatarUrl = profile?.photos?.[0] || user?.user_metadata?.avatar_url || null;
  const initials = firstName.slice(0, 2).toUpperCase();
  
  
  // Progressive daily profile question
  const { question: dailyQ, showCard: showDailyQ, submitAnswer: submitDailyQ, isSubmitting: dailyQSubmitting, dismiss: dismissDailyQ } = useProgressiveProfile();

  // Email notification triggers
  useNotificationTriggers();
  
  // Contact share feedback
  const { 
    pendingFeedback, 
    showFeedback, 
    loading: feedbackLoading,
    setShowFeedback, 
    submitFeedback 
  } = useContactFeedback();
  
  // Analytics tracking
  const { recordSession, recordWeeklyOptionsView } = useAnalytics();
  const [isSigningOut, setIsSigningOut] = React.useState(false);
  const handleSignOut = async () => {
    setIsSigningOut(true);
    try { await signOut(); } finally { setIsSigningOut(false); }
  };
  
  // Record session on mount
  useEffect(() => {
    recordSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for cross-component navigation events
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.tab) setActiveTab(detail.tab);
    };
    window.addEventListener('monark-navigate', handler);
    return () => window.removeEventListener('monark-navigate', handler);
  }, []);

  // Track weekly options view when tab changes
  useEffect(() => {
    if (activeTab === 'weekly') {
      recordWeeklyOptionsView();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

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
          return <SundayMatches />;
      case 'circle':
         return (
           <ProfileGate 
             featureName="your circle"
             onNavigateToProfile={() => handleTabChange('profile')}
           >
             <MonArkCircle />
           </ProfileGate>
         );
      case 'matches':
         return (
           <ProfileGate 
             featureName="conversations"
             onNavigateToProfile={() => handleTabChange('profile')}
           >
             <Conversations />
           </ProfileGate>
         );
      case 'dates':
        return (
          <DatesJournal 
            onStartDebrief={() => setShowDebrief(true)} 
            initialTab={datesJournalTab}
            onDateCompleted={handleDateCompleted}
          />
        );
      case 'discover':
        return <DiscoverMode />;
      case 'shareables':
        return <MilestoneCardShowcase />;
      case 'rif':
        return (
          <RIFQuiz 
            userId={user?.id || ''} 
            onComplete={() => handleTabChange('profile')} 
            onSkip={() => handleTabChange('profile')} 
          />
        );
      case 'profile':
         return (
          <Profile
            onOpenTrustScore={() => setShowTrustScore(true)}
            onOpenSettings={() => setShowSettings(true)}
            onNavigate={handleTabChange}
          />
        );
      default:
         return (
           <ProfileGate 
             featureName="weekly matches"
             onNavigateToProfile={() => handleTabChange('profile')}
           >
             <SundayMatches />
           </ProfileGate>
         );
    }
  };

  if (isMobile) {
    return (
      <div className="h-screen bg-background relative flex flex-col overflow-hidden isolate">
        {/* Mobile header with logo + avatar */}
        <header className="flex-shrink-0 z-40 flex items-center justify-between px-5 py-3 bg-card/98 backdrop-blur-2xl border-b border-border/50" style={{ boxShadow: '0 1px 12px rgba(90, 70, 50, 0.06)' }}>
          <img 
            src="/lovable-uploads/e11ccc80-2237-4aac-b579-dccb89f8d727.png" 
            alt="MonArk" 
            className="h-8 w-8 rounded-full object-contain"
          />
          <div className="flex items-center gap-3">
            {user && <NotificationBell userId={user.id} />}
            <button
              onClick={() => setShowSettings(true)}
              disabled={isSigningOut}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-all active:scale-95"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" />
            </button>
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all disabled:opacity-50 active:scale-95"
              aria-label="Sign out"
            >
              {isSigningOut ? <span className="h-5 w-5 animate-spin border-2 border-current border-t-transparent rounded-full inline-block" /> : <LogOut className="h-5 w-5" />}
            </button>
            <button onClick={() => handleTabChange('profile')} aria-label="Profile" className="group">
              <Avatar className="h-8 w-8 border-2 border-primary/30 group-hover:border-primary/60 transition-colors shadow-sm">
                {avatarUrl ? <AvatarImage src={avatarUrl} alt={firstName} className="object-cover" /> : null}
                <AvatarFallback className="bg-muted text-primary font-caption text-xs tracking-wider">{initials}</AvatarFallback>
              </Avatar>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto pb-24">
          {/* Greeting pinned inside scroll area */}
          <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-xl border-b border-border/30">
            <PremiumGreeting firstName={firstName} />
          </div>
          <div className="px-5 pt-3 space-y-5">

           
           {/* RIF Beta Insights Card */}
           {activeTab === 'profile' && <RifInsightsCard />}

           {/* Daily profile question — shown on weekly tab only */}
           {activeTab === 'weekly' && showDailyQ && (
             <div className="bg-card border border-primary/20 rounded-2xl p-4 shadow-sm">
               <div className="flex items-start gap-3">
                 <span className="text-primary text-lg mt-0.5">✨</span>
                 <div className="flex-1 min-w-0">
                   <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Today’s question</p>
                   <p className="text-sm font-medium text-foreground leading-snug mb-3">{dailyQ.prompt}</p>
                   <textarea
                     id="daily-q-input"
                     rows={3}
                     placeholder="Your answer sharpens your Sunday matches…"
                     className="w-full text-sm bg-muted/50 border border-border/60 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-primary/40 text-foreground placeholder:text-muted-foreground/60"
                   />
                   <div className="flex items-center gap-2 mt-2">
                     <button
                       className="text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50"
                       disabled={dailyQSubmitting}
                       onClick={() => {
                         const el = document.getElementById('daily-q-input') as HTMLTextAreaElement;
                         if (el?.value.trim()) submitDailyQ(el.value);
                       }}
                     >
                       {dailyQSubmitting ? 'Saving…' : 'Save answer'}
                     </button>
                     <button onClick={dismissDailyQ} className="text-xs text-muted-foreground hover:text-foreground">
                       Skip today
                     </button>
                   </div>
                 </div>
               </div>
             </div>
           )}

           {/* Pending connections — shown on weekly tab */}
           {activeTab === 'weekly' && (
             <PendingConnections />
           )}
          
           {renderActiveScreen()}
          </div>
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

        {/* Contact Share Feedback Modal */}
        {pendingFeedback && (
          <ContactShareFeedback
            matchName={pendingFeedback.matchName}
            open={showFeedback}
            onClose={() => setShowFeedback(false)}
            onSubmit={submitFeedback}
            loading={feedbackLoading}
          />
         )}

        <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} currentTier={tier} />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="h-screen flex w-full bg-background overflow-hidden">
        <header className="fixed top-0 left-0 right-0 h-12 flex items-center justify-between bg-card/98 backdrop-blur-2xl border-b border-border/50 z-40" style={{ boxShadow: '0 1px 12px rgba(90, 70, 50, 0.06)' }}>
          <SidebarTrigger className="ml-4 text-muted-foreground hover:text-primary transition-colors" />
        </header>

        <SidebarNavigation activeTab={activeTab} onTabChange={handleTabChange} onArkNavigation={handleJournalNavigation} onUpgrade={() => setShowPaywall(true)} />

        <main className="flex-1 pt-12 overflow-y-auto">
          <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-xl border-b border-border/30">
            <PremiumGreeting firstName={firstName} />
          </div>

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

        {/* Contact Share Feedback Modal */}
        {pendingFeedback && (
          <ContactShareFeedback
            matchName={pendingFeedback.matchName}
            open={showFeedback}
            onClose={() => setShowFeedback(false)}
            onSubmit={submitFeedback}
            loading={feedbackLoading}
          />
         )}

        <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} currentTier={tier} />
      </div>
    </SidebarProvider>
  );
};
