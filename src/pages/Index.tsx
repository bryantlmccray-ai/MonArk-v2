import React from 'react';
import { OnboardingFlow } from '../components/onboarding/OnboardingFlow';
import { MainApp } from '../components/main/MainApp';
import { AuthPage } from '../components/auth/AuthPage';
import { ProfileCreation } from '../components/profile/ProfileCreation';
import { ProfileCompleteScreen } from '../components/profile/ProfileCompleteScreen';
import { EnhancedLandingPage } from '@/components/demo/EnhancedLandingPage';
import { DemoMainApp } from '@/components/demo/DemoMainApp';
import { SplashScreen } from '@/components/splash/SplashScreen';
import { AuthGuard } from '@/components/common/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useDemo } from '@/contexts/DemoContext';

const Index = () => {
  const { user, loading: authLoading, isDemoMode, exitDemoMode, signOut } = useAuth();
  const { profile, loading: profileLoading, refetchProfile, updateProfile } = useProfile();
  const { demoData, setDemoMode } = useDemo();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = React.useState(false);
  const [showDemo, setShowDemo] = React.useState(false);
  const [showAuth, setShowAuth] = React.useState(false);
  const [showSplash, setShowSplash] = React.useState(true);
  const [showProfileComplete, setShowProfileComplete] = React.useState(false);
  const [skippedProfile, setSkippedProfile] = React.useState(false);
  const [initialTab, setInitialTab] = React.useState<'weekly' | 'profile'>('weekly');
  const [hasEnteredApp, setHasEnteredApp] = React.useState(false);
  const [autoFixAttempted, setAutoFixAttempted] = React.useState(false);

  const handleSplashComplete = () => {
    sessionStorage.setItem('monark-splash-seen', 'true');
    setShowSplash(false);
  };

  // React to auth state changes via useAuth context (driven by Supabase onAuthStateChange)
  React.useEffect(() => {
    if (user || isDemoMode) {
      setShowAuth(false);
    }
  }, [user, isDemoMode]);

  // Add escape key listener to exit demo
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowDemo(false);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Auto-fix: onboarding_step >= 10 but is_profile_complete not set
  React.useEffect(() => {
    if (
      profile &&
      !profile.is_profile_complete &&
      profile.onboarding_step != null &&
      profile.onboarding_step >= 10 &&
      !autoFixAttempted
    ) {
      setAutoFixAttempted(true);
      const fix = async () => {
        try {
          const success = await updateProfile({ is_profile_complete: true });
          if (success) {
            console.log('Auto-fixed is_profile_complete flag');
            refetchProfile();
            setShowProfileComplete(true);
          }
        } catch (e) {
          console.error('Auto-fix failed:', e);
        }
      };
      fix();
    }
  }, [profile, autoFixAttempted, updateProfile, refetchProfile]);

  // Show splash screen on first visit
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  // Separate demo mode that shows DemoMainApp (for landing page "Try Demo" button)
  if (showDemo || demoData.isInDemo) {
    return <DemoMainApp onClose={() => {
      setShowDemo(false);
      setDemoMode(false);
    }} />;
  }

  // Guest/Demo mode from auth page - goes through full onboarding flow
  // Check if user is in demo mode (isDemoMode) but hasn't completed profile yet


  // Show loading screen while checking auth state
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground text-lg">Loading...</div>
      </div>
    );
  }

  // Show auth page if requested (and not in demo mode)
  if (showAuth && !isDemoMode) {
    return <AuthPage />;
  }

  // Show enhanced landing page if user is not logged in and not in demo mode
  if (!user && !isDemoMode) {
    return <EnhancedLandingPage 
      onExitToApp={() => {
        
        setShowAuth(true);
      }}
      onStartDemo={() => {
        
        setShowDemo(true);
      }}
    />;
  }

  // Show profile complete screen after finishing profile OR when user skipped profile
  if (showProfileComplete || skippedProfile) {
    return (
      <ProfileCompleteScreen 
        onContinue={(destination) => {
          setShowProfileComplete(false);
          setSkippedProfile(false);
          setHasEnteredApp(true);
          // Set the initial tab based on user's choice
          setInitialTab(destination === 'discovery' ? 'profile' : 'weekly');
        }}
        userName={profile?.bio?.split(' ')[0]}
        isProfileIncomplete={skippedProfile}
      />
    );
  }

  // User has entered the app from profile complete screen - show MainApp regardless of profile status
  // AuthGuard re-verifies server-side auth so DevTools manipulation of hasEnteredApp is harmless
  if (hasEnteredApp) {
    return <AuthGuard><MainApp initialTab={initialTab} /></AuthGuard>;
  }

  // If user (real or demo) has a complete profile, show main app
  if (profile?.is_profile_complete) {
    return <AuthGuard><MainApp initialTab={initialTab} /></AuthGuard>;
  }

  // If user has a profile but it's not complete, show profile creation

  if (profile && !profile.is_profile_complete) {
    return <ProfileCreation 
      onComplete={async () => {
        setInitialTab('profile');
        setHasEnteredApp(true);
        refetchProfile();
      }} 
      onCancel={async () => {
        await signOut();
      }}
    />;
  }

  // Show onboarding if user hasn't completed it yet
  if (!hasCompletedOnboarding) {
    return (
      <OnboardingFlow 
        onComplete={() => setHasCompletedOnboarding(true)} 
        onSkipToWaiting={() => setSkippedProfile(true)}
        onExit={isDemoMode ? () => exitDemoMode() : undefined}
        showExitButton={isDemoMode}
      />
    );
  }

  // Show profile creation after onboarding
  return <ProfileCreation 
    onComplete={async () => {
      await refetchProfile();
      setInitialTab('profile');
      setHasEnteredApp(true);
    }}
    onCancel={async () => {
      await signOut();
    }}
  />;
};

export default Index;
