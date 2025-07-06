
import React from 'react';
import { OnboardingFlow } from '../components/onboarding/OnboardingFlow';
import { MainApp } from '../components/main/MainApp';
import { AuthPage } from '../components/auth/AuthPage';
import { ProfileCreation } from '../components/profile/ProfileCreation';
import { EnhancedLandingPage } from '@/components/demo/EnhancedLandingPage';
import { DemoMainApp } from '@/components/demo/DemoMainApp';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useDemo } from '@/contexts/DemoContext';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, refetchProfile } = useProfile();
  const { demoData, setDemoMode } = useDemo();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = React.useState(false);
  const [showDemo, setShowDemo] = React.useState(false);
  const [showAuth, setShowAuth] = React.useState(false);

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

  // Demo mode override - accessible regardless of auth status  
  if (showDemo || demoData.isInDemo) {
    console.log('Rendering demo, showDemo:', showDemo, 'demoData.isInDemo:', demoData.isInDemo);
    return <DemoMainApp onClose={() => {
      console.log('Closing demo');
      setShowDemo(false);
      setDemoMode(false);
    }} />;
  }


  // Show loading screen while checking auth state
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-jet-black flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  // Show auth page if requested
  if (showAuth) {
    return <AuthPage />;
  }

  // Show enhanced landing page if user is not logged in
  if (!user) {
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

  // If user has a complete profile, show main app
  if (profile?.is_profile_complete) {
    return <MainApp />;
  }

  // If user has a profile but it's not complete, show profile creation
  if (profile && !profile.is_profile_complete) {
    return <ProfileCreation onComplete={() => refetchProfile()} />;
  }

  // Show onboarding if user hasn't completed it yet
  if (!hasCompletedOnboarding) {
    return <OnboardingFlow onComplete={() => setHasCompletedOnboarding(true)} />;
  }

  // Show profile creation after onboarding
  return <ProfileCreation onComplete={() => refetchProfile()} />;
};

export default Index;
