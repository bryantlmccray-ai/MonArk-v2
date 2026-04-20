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
import { CompassPage } from '@/components/compass/CompassPage';
import { DatePlansTab } from './DatePlansTab';
import { PendingConnections } from '@/components/matching/PendingConnections';
import { useProgressiveProfile } from '@/hooks/useProgressiveProfile';
import { useRIF } from '@/hooks/useRIF';
import RIFQuiz from '@/components/onboarding/RIFQuiz';
import { ProfileGate } from '@/components/common/ProfileGate';
import PaywallModal from '@/components/PaywallModal';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import NotificationBell from '@/components/NotificationBell';
import { Settings, LogOut, Sparkles, Heart, RotateCcw } from 'lucide-react';
import { PremiumGreeting } from './PremiumGreeting';
import { motion } from 'framer-motion';

type RIFProfileType = NonNullable<ReturnType<typeof useRIF>['rifProfile']>;

const DIM_CONFIGS: Array<{
  pctKey: keyof RIFProfileType;
  label: string;
  description: string;
  barColor: string;
  textColor: string;
}> = [
  {
    pctKey: 'intent_clarity_pct',
    label: 'Intent Clarity',
    description: "How clearly you know what you are looking for.",
    barColor: 'bg-primary',
    textColor: 'text-primary',
  },
  {
    pctKey: 'emotional_readiness_pct',
    label: 'Emotional Readiness',
    description: 'Your capacity to show up present and open.',
    barColor: 'bg-accent',
    textColor: 'text-accent',
  },
  {
    pctKey: 'pacing_preferences_pct',
    label: 'Pacing Preference',
    description: 'The rhythm that feels natural to you.',
    barColor: 'bg-[hsl(350,30%,62%)]',
    textColor: 'text-[hsl(350,30%,62%)]',
  },
  {
    pctKey: 'boundary_respect_pct',
    label: 'Boundary Respect',
    description: 'How you hold and honor limits — yours and others.',
    barColor: 'bg-[hsl(22,38%,36%)]',
    textColor: 'text-[hsl(22,38%,36%)]',
  },
  {
    pctKey: 'post_date_alignment_pct',
    label: 'Post-Date Alignment',
    description: 'Your follow-through and communication after connection.',
    barColor: 'bg-muted-foreground',
    textColor: 'text-muted-foreground',
  },
];

const RIFResultsDashboard: React.FC<{
  rifProfile: RIFProfileType;
  onRetake: () => void;
}> = ({ rifProfile, onRetake }) => {
  const avgPct =
    (rifProfile.intent_clarity_pct +
      rifProfile.emotional_readiness_pct +
      rifProfile.pacing_preferences_pct +
      rifProfile.boundary_respect_pct +
      rifProfile.post_date_alignment_pct) /
    5;

  const archetype =
    avgPct >= 80
      ? { label: 'The Intentional Partner', tagline: 'You date with clarity, depth, and purpose.' }
      : avgPct >= 60 && rifProfile.emotional_readiness_pct >= 70
      ? { label: 'The Hopeful Romantic', tagline: "You lead with your heart and that is a strength." }
      : { label: 'The Guarded Opener', tagline: "You are learning to open on your own terms." };

  return (
    <div className="space-y-5 px-5 pt-3 pb-8">
      <div>
        <p className="text-[11px] tracking-[0.2em] text-primary uppercase font-medium mb-1">
          Relational Intelligence Framework
        </p>
        <h1 className="text-2xl font-serif font-bold text-foreground">Your RIF Profile</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Your dating intelligence snapshot — updated as you engage with MonArk
        </p>
      </div>

      <div className="bg-card border border-primary/20 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
            <Heart className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">You are</p>
            <p className="font-serif text-lg font-medium text-foreground">{archetype.label}</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground italic mt-1 pl-12">{archetype.tagline}</p>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-medium text-foreground">Your RIF deepens over time</p>
          <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
            Answer daily questions on the Home tab — each response sharpens your Sunday matches without
            requiring another sit-down quiz. Your scores update automatically.
          </p>
        </div>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm">
        <p className="text-[11px] tracking-[0.15em] text-primary uppercase font-medium mb-4">
          Your Dimensions
        </p>
        <div className="space-y-5">
          {DIM_CONFIGS.map(({ pctKey, label, description, barColor, textColor }) => {
            const pct = rifProfile[pctKey] as number;
            return (
              <div key={pctKey as string}>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-sm font-medium text-foreground">{label}</span>
                  <span className={`font-serif text-xl font-normal ${textColor}`}>{pct}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{description}</p>
                <div className="h-[3px] bg-secondary rounded overflow-hidden">
                  <motion.div
                    className={`h-full rounded ${barColor}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={onRetake}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Retake assessment
      </button>
    </div>
  );
};

interface MainAppProps {
  initialTab?: string;
}

export const MainApp: React.FC<MainAppProps> = ({ initialTab = 'weekly' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [datesJournalTab, setDatesJournalTab] = useState<'dates' | 'ark'>('dates');
  const [showDebrief, setShowDebrief] = useState(false);
  const [showTrustScore, setShowTrustScore] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPostDateReflection, setShowPostDateReflection] = useState(false);
  const [reflectionPartnerName, setReflectionPartnerName] = useState('');
  const [rifRetakeMode, setRifRetakeMode] = useState(false);

  const isMobile = useIsMobile();
  const { showPaywall, setShowPaywall, tier } = useSubscription();
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const { rifProfile, loading: rifLoading } = useRIF();

  const firstName =
    profile?.first_name ||
    user?.user_metadata?.name?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    'there';
  const avatarUrl = profile?.photos?.[0] || user?.user_metadata?.avatar_url || null;
  const initials = firstName.slice(0, 2).toUpperCase();

  const {
    question: dailyQ,
    showCard: showDailyQ,
    submitAnswer: submitDailyQ,
    isSubmitting: dailyQSubmitting,
    dismiss: dismissDailyQ,
  } = useProgressiveProfile();

  useNotificationTriggers();

  const {
    pendingFeedback,
    showFeedback,
    loading: feedbackLoading,
    setShowFeedback,
    submitFeedback,
  } = useContactFeedback();

  const { recordSession, recordWeeklyOptionsView } = useAnalytics();
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } finally {
      setIsSigningOut(false);
    }
  };

  useEffect(() => {
    recordSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.tab) setActiveTab(detail.tab);
    };
    window.addEventListener('monark-navigate', handler);
    return () => window.removeEventListener('monark-navigate', handler);
  }, []);

  useEffect(() => {
    if (activeTab === 'weekly') recordWeeklyOptionsView();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab !== 'dates') setDatesJournalTab('dates');
    if (tab !== 'rif') setRifRetakeMode(false);
  };

  const handleJournalNavigation = () => {
    setActiveTab('dates');
    setDatesJournalTab('dates');
  };

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
          <ProfileGate featureName="your circle" onNavigateToProfile={() => handleTabChange('profile')}>
            <MonArkCircle />
          </ProfileGate>
        );
      case 'matches':
        return (
          <ProfileGate featureName="conversations" onNavigateToProfile={() => handleTabChange('profile')}>
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
      case 'compass':
        return <CompassPage />;
      case 'plans':
        return <DatePlansTab onNavigateCompass={() => handleTabChange('compass')} />;
      case 'shareables':
        return <MilestoneCardShowcase />;
      case 'rif':
        if (!rifLoading && rifProfile && !rifRetakeMode) {
          return <RIFResultsDashboard rifProfile={rifProfile} onRetake={() => setRifRetakeMode(true)} />;
        }
        return (
          <RIFQuiz
            userId={user?.id || ''}
            onComplete={() => {
              setRifRetakeMode(false);
              handleTabChange('profile');
            }}
            onSkip={() => {
              setRifRetakeMode(false);
              handleTabChange('profile');
            }}
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
          <ProfileGate featureName="weekly matches" onNavigateToProfile={() => handleTabChange('profile')}>
            <SundayMatches />
          </ProfileGate>
        );
    }
  };

  if (isMobile) {
    return (
      <div className="h-screen bg-background relative flex flex-col overflow-hidden isolate">
        <header
          className="flex-shrink-0 z-40 flex items-center justify-between px-5 py-3 bg-card/98 backdrop-blur-2xl border-b border-border/50"
          style={{ boxShadow: '0 1px 12px rgba(90, 70, 50, 0.06)' }}
        >
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
              {isSigningOut ? (
                <span className="h-5 w-5 animate-spin border-2 border-current border-t-transparent rounded-full inline-block" />
              ) : (
                <LogOut className="h-5 w-5" />
              )}
            </button>
            <button onClick={() => handleTabChange('profile')} aria-label="Profile" className="group">
              <Avatar className="h-8 w-8 border-2 border-primary/30 group-hover:border-primary/60 transition-colors shadow-sm">
                {avatarUrl ? <AvatarImage src={avatarUrl} alt={firstName} className="object-cover" /> : null}
                <AvatarFallback className="bg-muted text-primary font-caption text-xs tracking-wider">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto pb-24">
          <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-xl border-b border-border/30">
            <PremiumGreeting firstName={firstName} />
          </div>
          <div className="px-5 pt-3 space-y-5">
            {activeTab === 'profile' && <RifInsightsCard />}
            {activeTab === 'weekly' && showDailyQ && (
              <div className="bg-card border border-primary/20 rounded-2xl p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="text-primary text-lg mt-0.5">✨</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                      Today's question
                    </p>
                    <p className="text-sm font-medium text-foreground leading-snug mb-3">
                      {dailyQ.prompt}
                    </p>
                    <textarea
                      id="daily-q-input"
                      rows={3}
                      placeholder="Your answer sharpens your Sunday matches..."
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
                        {dailyQSubmitting ? 'Saving...' : 'Save answer'}
                      </button>
                      <button onClick={dismissDailyQ} className="text-xs text-muted-foreground hover:text-foreground">
                        Skip today
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'weekly' && <PendingConnections />}
            {renderActiveScreen()}
          </div>
        </div>

        <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
        {showDebrief && <DebriefOverlay onClose={() => setShowDebrief(false)} />}
        {showTrustScore && <TrustScoreOverlay onClose={() => setShowTrustScore(false)} />}
        {showSettings && <SettingsOverlay onClose={() => setShowSettings(false)} />}
        <PostDateReflection
          isOpen={showPostDateReflection}
          onClose={() => setShowPostDateReflection(false)}
          partnerName={reflectionPartnerName}
        />
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
        <header
          className="fixed top-0 left-0 right-0 h-12 flex items-center justify-between bg-card/98 backdrop-blur-2xl border-b border-border/50 z-40"
          style={{ boxShadow: '0 1px 12px rgba(90, 70, 50, 0.06)' }}
        >
          <SidebarTrigger className="ml-4 text-muted-foreground hover:text-primary transition-colors" />
        </header>
        <SidebarNavigation
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onArkNavigation={handleJournalNavigation}
          onUpgrade={() => setShowPaywall(true)}
        />
        <main className="flex-1 pt-12 overflow-y-auto">
          <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-xl border-b border-border/30">
            <PremiumGreeting firstName={firstName} />
          </div>
          {activeTab === 'profile' && (
            <div className="px-6 mb-4">
              <RifInsightsCard />
            </div>
          )}
          {renderActiveScreen()}
        </main>
        {showDebrief && <DebriefOverlay onClose={() => setShowDebrief(false)} />}
        {showTrustScore && <TrustScoreOverlay onClose={() => setShowTrustScore(false)} />}
        {showSettings && <SettingsOverlay onClose={() => setShowSettings(false)} />}
        <PostDateReflection
          isOpen={showPostDateReflection}
          onClose={() => setShowPostDateReflection(false)}
          partnerName={reflectionPartnerName}
        />
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
