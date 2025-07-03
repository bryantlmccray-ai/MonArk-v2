
import React from 'react';
import { OnboardingFlow } from '../components/onboarding/OnboardingFlow';
import { MainApp } from '../components/main/MainApp';
import { AuthPage } from '../components/auth/AuthPage';
import { ProfileCreation } from '../components/profile/ProfileCreation';
import { EnhancedLandingPage } from '@/components/demo/EnhancedLandingPage';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useDemo } from '@/contexts/DemoContext';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, refetchProfile } = useProfile();
  const { demoData, setDemoMode } = useDemo();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = React.useState(false);
  const [showDemo, setShowDemo] = React.useState(false);

  // Demo mode override - accessible regardless of auth status
  if (showDemo) {
    return (
      <div className="min-h-screen bg-jet-black">
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setShowDemo(false)}
            className="px-4 py-2 bg-charcoal-gray/80 text-white rounded-lg border border-goldenrod/30 hover:bg-charcoal-gray transition-colors"
          >
            Exit Demo
          </button>
        </div>
        <EnhancedLandingPage onExitToApp={() => setShowDemo(false)} />
      </div>
    );
  }


  // Show loading screen while checking auth state
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-jet-black flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  // Show enhanced landing page if user is not logged in
  if (!user) {
    return <EnhancedLandingPage />;
  }

  // If user has a complete profile, show main app with demo access
  if (profile?.is_profile_complete) {
    return (
      <div className="relative">
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={() => setShowDemo(true)}
            className="px-4 py-2 bg-goldenrod-gradient text-jet-black font-medium rounded-lg hover:shadow-golden-glow transition-all duration-300"
          >
            View Demo
          </button>
        </div>
        <MainApp />
      </div>
    );
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
