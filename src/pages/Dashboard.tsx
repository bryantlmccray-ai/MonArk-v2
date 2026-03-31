import React from 'react';
import { AuthGuard } from '@/components/common/AuthGuard';
import { MainApp } from '@/components/main/MainApp';
import { ProfileCreation } from '@/components/profile/ProfileCreation';
import { ProfileCompleteScreen } from '@/components/profile/ProfileCompleteScreen';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';

const DashboardContent: React.FC = () => {
  const { profile, loading, refetchProfile, updateProfile } = useProfile();
  const { signOut } = useAuth();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = React.useState(false);
  const [showProfileComplete, setShowProfileComplete] = React.useState(false);
  const [skippedProfile, setSkippedProfile] = React.useState(false);
  const [initialTab, setInitialTab] = React.useState<'weekly' | 'profile'>('weekly');
  const [hasEnteredApp, setHasEnteredApp] = React.useState(false);
  const [autoFixAttempted, setAutoFixAttempted] = React.useState(false);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground text-lg">Loading...</div>
      </div>
    );
  }

  // Show profile complete screen
  if (showProfileComplete || skippedProfile) {
    return (
      <ProfileCompleteScreen
        onContinue={(destination) => {
          setShowProfileComplete(false);
          setSkippedProfile(false);
          setHasEnteredApp(true);
          setInitialTab(destination === 'discovery' ? 'profile' : 'weekly');
        }}
        userName={profile?.bio?.split(' ')[0]}
        isProfileIncomplete={skippedProfile}
      />
    );
  }

  // User entered app from profile complete
  if (hasEnteredApp) {
    return <MainApp initialTab={initialTab} />;
  }

  // Profile complete → main app
  if (profile?.is_profile_complete) {
    return <MainApp initialTab={initialTab} />;
  }

  // Profile exists but incomplete → profile creation
  if (profile && !profile.is_profile_complete) {
    return (
      <ProfileCreation
        onComplete={async () => {
          setInitialTab('profile');
          setHasEnteredApp(true);
          refetchProfile();
        }}
        onCancel={async () => {
          await signOut();
        }}
      />
    );
  }

  // No profile yet → onboarding
  if (!hasCompletedOnboarding) {
    return (
      <OnboardingFlow
        onComplete={() => setHasCompletedOnboarding(true)}
        onSkipToWaiting={() => setSkippedProfile(true)}
      />
    );
  }

  // After onboarding → profile creation
  return (
    <ProfileCreation
      onComplete={async () => {
        setInitialTab('profile');
        setHasEnteredApp(true);
        refetchProfile();
      }}
      onCancel={async () => {
        await signOut();
      }}
    />
  );
};

const Dashboard: React.FC = () => (
  <AuthGuard fallbackPath="/">
    <DashboardContent />
  </AuthGuard>
);

export default Dashboard;
