import React from 'react';
import { OnboardingFlow } from '../components/onboarding/OnboardingFlow';
import { MainApp } from '../components/main/MainApp';
import { AuthPage } from '../components/auth/AuthPage';
import { ProfileCreation } from '../components/profile/ProfileCreation';
import { EnhancedLandingPage } from '@/components/demo/EnhancedLandingPage';
import { DemoMainApp } from '@/components/demo/DemoMainApp';
import { SplashScreen } from '@/components/splash/SplashScreen';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useDemo } from '@/contexts/DemoContext';

const Index = () => {
  const { user, loading: authLoading, isDemoMode, exitDemoMode, signOut } = useAuth();
  const { profile, loading: profileLoading, refetchProfile } = useProfile();
  const { demoData, setDemoMode } = useDemo();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = React.useState(false);
  const [showDemo, setShowDemo] = React.useState(false);
  const [showAuth, setShowAuth] = React.useState(false);
  const [showSplash, setShowSplash] = React.useState(true);

  const handleSplashComplete = () => {
    sessionStorage.setItem('monark-splash-seen', 'true');
    setShowSplash(false);
  };

  // Listen for auth state changes to update UI immediately
  React.useEffect(() => {
    const handleAuthChange = () => {
      // Force component re-render on auth change
      console.log('Auth state changed in Index, user:', user?.id, 'isDemoMode:', isDemoMode);
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
      console.log('Key pressed:', e.key); // Debug log
      if (e.key === 'Escape') {
        console.log('Exiting demo via Escape key'); // Debug log
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
    console.log('Rendering demo app, showDemo:', showDemo, 'demoData.isInDemo:', demoData.isInDemo);
    return <DemoMainApp onClose={() => {
      console.log('Closing demo');
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
        console.log('onExitToApp called - going to auth');
        setShowAuth(true);
      }}
      onStartDemo={() => {
        console.log('Starting demo mode');
        setShowDemo(true);
      }}
    />;
  }

  // If user (real or demo) has a complete profile, show main app
  if (profile?.is_profile_complete) {
    return <MainApp />;
  }

  // If user has a profile but it's not complete, show profile creation
  if (profile && !profile.is_profile_complete) {
    return <ProfileCreation 
      onComplete={() => refetchProfile()} 
      onCancel={async () => {
        // Sign out the user and return to landing page
        console.log('Profile creation cancelled - signing out');
        await signOut();
      }}
    />;
  }

  // Show onboarding if user hasn't completed it yet
  if (!hasCompletedOnboarding) {
    return (
      <OnboardingFlow 
        onComplete={() => setHasCompletedOnboarding(true)} 
        onExit={isDemoMode ? () => exitDemoMode() : undefined}
        showExitButton={isDemoMode}
      />
    );
  }

  // Show profile creation after onboarding
  return <ProfileCreation 
    onComplete={() => refetchProfile()}
    onCancel={async () => {
      // Sign out the user and return to landing page
      console.log('Profile creation cancelled - signing out');
      await signOut();
    }}
  />;
};

export default Index;
