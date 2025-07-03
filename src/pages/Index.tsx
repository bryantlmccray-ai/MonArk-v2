
import React from 'react';
import { OnboardingFlow } from '../components/onboarding/OnboardingFlow';
import { MainApp } from '../components/main/MainApp';
import { AuthPage } from '../components/auth/AuthPage';
import { ProfileCreation } from '../components/profile/ProfileCreation';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = React.useState(false);

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
    return <AuthPage />;
  }

  // If user has a complete profile, skip to main app
  if (profile?.is_profile_complete) {
    return <MainApp />;
  }

  // If user has a profile but it's not complete, show profile creation
  if (profile && !profile.is_profile_complete) {
    return <ProfileCreation onComplete={() => window.location.reload()} />;
  }

  // Show onboarding if user hasn't completed it yet
  if (!hasCompletedOnboarding) {
    return <OnboardingFlow onComplete={() => setHasCompletedOnboarding(true)} />;
  }

  // Show profile creation after onboarding
  return <ProfileCreation onComplete={() => window.location.reload()} />;
};

export default Index;
