
import React from 'react';
import { OnboardingFlow } from '../components/onboarding/OnboardingFlow';
import { MainApp } from '../components/main/MainApp';
import { AuthPage } from '../components/auth/AuthPage';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { user, loading } = useAuth();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = React.useState(false);

  // Show loading screen while checking auth state
  if (loading) {
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

  // Show onboarding if user hasn't completed it yet
  if (!hasCompletedOnboarding) {
    return <OnboardingFlow onComplete={() => setHasCompletedOnboarding(true)} />;
  }

  // Show main app
  return <MainApp />;
};

export default Index;
