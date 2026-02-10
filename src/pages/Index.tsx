import React from 'react';
 import { Navigate } from 'react-router-dom';
import { OnboardingFlow } from '../components/onboarding/OnboardingFlow';
import { MainApp } from '../components/main/MainApp';
import { AuthPage } from '../components/auth/AuthPage';
import { ProfileCreation } from '../components/profile/ProfileCreation';
import { ProfileCompleteScreen } from '../components/profile/ProfileCompleteScreen';
import { EnhancedLandingPage } from '@/components/demo/EnhancedLandingPage';
import { DemoMainApp } from '@/components/demo/DemoMainApp';
import { SplashScreen } from '@/components/splash/SplashScreen';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useDemo } from '@/contexts/DemoContext';
 import { ProfileGate } from '@/components/common/ProfileGate';

const Index = () => {
  const { user, loading: authLoading, isDemoMode, exitDemoMode, signOut } = useAuth();
  const { profile, loading: profileLoading, refetchProfile } = useProfile();
  const { demoData, setDemoMode } = useDemo();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = React.useState(false);
  const [showDemo, setShowDemo] = React.useState(false);
  const [showAuth, setShowAuth] = React.useState(false);
  const [showSplash, setShowSplash] = React.useState(true);
  const [showProfileComplete, setShowProfileComplete] = React.useState(false);
  const [skippedProfile, setSkippedProfile] = React.useState(false);
  const [initialTab, setInitialTab] = React.useState<'weekly' | 'profile'>('weekly');
  const [hasEnteredApp, setHasEnteredApp] = React.useState(false);
   const [navigateToProfile, setNavigateToProfile] = React.useState(false);

  const handleSplashComplete = () => {
    sessionStorage.setItem('monark-splash-seen', 'true');
    setShowSplash(false);
  };

  // Listen for auth state changes to update UI immediately
  React.useEffect(() => {
    const handleAuthChange = () => {
      // Force component re-render on auth change
      
      // Reset showAuth when user is authenticated or demo mode is active
      if (user || isDemoMode) {
        setShowAuth(false);
      }
    };

    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
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
          setInitialTab(destination === 'matches' ? 'weekly' : 'profile');
        }}
        userName={profile?.bio?.split(' ')[0]}
        isProfileIncomplete={skippedProfile}
      />
    );
  }

  // User has entered the app from profile complete screen - show MainApp regardless of profile status
  if (hasEnteredApp) {
     return (
       <ProfileGate 
         featureName="matches and messaging"
         onNavigateToProfile={() => setNavigateToProfile(true)}
       >
         <MainApp initialTab={navigateToProfile ? 'profile' : initialTab} />
       </ProfileGate>
     );
  }

  // If user (real or demo) has a complete profile, show main app
  if (profile?.is_profile_complete) {
     return (
       <ProfileGate 
         featureName="matches and messaging"
         onNavigateToProfile={() => setNavigateToProfile(true)}
       >
         <MainApp initialTab={navigateToProfile ? 'profile' : initialTab} />
       </ProfileGate>
     );
  }

  // If user has a profile but it's not complete, show profile creation
  if (profile && !profile.is_profile_complete) {
    return <ProfileCreation 
      onComplete={async () => {
        await refetchProfile();
        setShowProfileComplete(true);
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
      setShowProfileComplete(true);
    }}
    onCancel={async () => {
      await signOut();
    }}
  />;
};

export default Index;
