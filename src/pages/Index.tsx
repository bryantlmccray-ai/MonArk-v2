
import React from 'react';
import { OnboardingFlow } from '../components/onboarding/OnboardingFlow';
import { MainApp } from '../components/main/MainApp';
import { AuthPage } from '../components/auth/AuthPage';
import { ProfileCreation } from '../components/profile/ProfileCreation';
import { ProfileCompatibilityDemo } from '@/components/demo/ProfileCompatibilityDemo';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, refetchProfile } = useProfile();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = React.useState(false);
  const [showDemo, setShowDemo] = React.useState(false);

  // Demo mode override
  if (showDemo) {
    return (
      <div className="min-h-screen bg-jet-black">
        <div className="fixed top-4 right-4 z-50">
          <Button
            onClick={() => setShowDemo(false)}
            variant="outline"
            className="text-white border-white/30"
          >
            Exit Demo
          </Button>
        </div>
        <ProfileCompatibilityDemo />
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

  // Show auth page if user is not logged in
  if (!user) {
    return (
      <div>
        <div className="fixed top-4 left-4 z-50">
          <Button
            onClick={() => setShowDemo(true)}
            className="bg-goldenrod-gradient text-jet-black font-medium"
          >
            View Demo
          </Button>
        </div>
        <AuthPage />
      </div>
    );
  }

  // If user has a complete profile, skip to main app
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
