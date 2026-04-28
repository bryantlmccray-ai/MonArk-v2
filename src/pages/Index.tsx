import React from 'react';
import { OnboardingFlow } from '../components/onboarding/OnboardingFlow';
import { MainApp } from '../components/main/MainApp';
import { AuthPage } from '../components/auth/AuthPage';
import { ProfileCreation } from '../components/profile/ProfileCreation';
  import { ProfileCompleteScreen } from '../components/profile/ProfileCompleteScreen';
import { EnhancedLandingPage } from '@/components/landing/LandingPage';
import { DemoMainApp } from '@/components/demo/DemoMainApp';
import { SplashScreen } from '@/components/splash/SplashScreen';
import { AuthGuard } from '@/components/common/AuthGuard';
import { useAppFlow } from '@/hooks/useAppFlow';

// ─── Index ────────────────────────────────────────────────────────────────────
// Thin orchestrator: reads app-flow state from useAppFlow and renders the
// correct screen. No business logic lives here — all state transitions are
// handled inside the hook.
const Index = () => {
    const {
          // State flags
          showSplash,
          showDemo,
          showAuth,
          authStartMode,
          showProfileComplete,
          skippedProfile,
          hasEnteredApp,
          hasCompletedOnboarding,
          initialTab,
          // Auth / profile data
          user,
          isDemoMode,
          profile,
          authLoading,
          profileLoading,
          // Handlers
          handleSplashComplete,
          handleDemoClose,
          handleSignIn,
          handleSignUp,
          handleStartDemo,
          handleOnboardingComplete,
          handleSkipToWaiting,
          handleProfileCompleteNext,
          handleProfileCreationComplete,
          handleProfileCreationCancel,
          handleExitDemo,
    } = useAppFlow();

    // ── 1. Splash ──────────────────────────────────────────────────────────────
    if (showSplash) {
          return <SplashScreen onComplete={handleSplashComplete} />;
    }

    // ── 2. Demo shell ──────────────────────────────────────────────────────────
    if (showDemo) {
          return <DemoMainApp onClose={handleDemoClose} />;
    }

    // ── 3. Loading ─────────────────────────────────────────────────────────────
    if (authLoading || profileLoading) {
          return (
                  <div className="min-h-screen bg-background flex items-center justify-center">
                          <div className="text-foreground text-lg">Loading...</div>div>
                  </div>div>
                );
    }
  
    // ── 4. Auth page (explicit sign-in / sign-up request) ─────────────────────
    if (showAuth && !isDemoMode) {
          return <AuthPage defaultMode={authStartMode} />;
    }
  
    // ── 5. Landing page (unauthenticated, not in demo) ─────────────────────────
    if (!user && !isDemoMode) {
          return (
        <EnhancedLandingPage
                  onExitToApp={handleSignIn}
                  onStartDemo={handleStartDemo}
                  onSignIn={handleSignIn}
                  onSignUp={handleSignUp}
                />
                );
    }
  
    // ── 6. Profile-complete celebration screen ─────────────────────────────────
    if (showProfileComplete || skippedProfile) {
          return (
                  <ProfileCompleteScreen
                            onContinue={handleProfileCompleteNext}
                            userName={profile?.bio?.split(' ')[0]}
                            isProfileIncomplete={skippedProfile}
                          />
                );
    }
  
    // ── 7. Main app (profile is done, or user explicitly entered) ─────────────
    if (hasEnteredApp || profile?.is_profile_complete) {
          return <AuthGuard><MainApp initialTab={initialTab} /></AuthGuard>AuthGuard>;
    }
  
    // ── 8. Mid-onboarding: profile exists but not complete, still in quiz flow ─
    if (
          profile &&
          !profile.is_profile_complete &&
          (profile.onboarding_step == null || profile.onboarding_step < 10) &&
          !hasCompletedOnboarding
        ) {
          return (
                  <OnboardingFlow
                            onComplete={handleOnboardingComplete}
                            onSkipToWaiting={handleSkipToWaiting}
                            onExit={isDemoMode ? handleExitDemo : undefined}
                            showExitButton={isDemoMode}
                          />
                );
    }
  
    // ── 9. Profile creation (onboarding done, profile data still needed) ───────
    if (profile && !profile.is_profile_complete) {
          return (
                  <ProfileCreation
                            onComplete={handleProfileCreationComplete}
                            onCancel={handleProfileCreationCancel}
                          />
                );
    }
  
    // ── 10. Fresh user — no profile yet ───────────────────────────────────────
    if (!hasCompletedOnboarding) {
          return (
                  <OnboardingFlow
                            onComplete={handleOnboardingComplete}
                            onSkipToWaiting={handleSkipToWaiting}
                            onExit={isDemoMode ? handleExitDemo : undefined}
                            showExitButton={isDemoMode}
                          />
                );
    }
  
    // ── 11. Fallback: onboarding done, now build the profile ──────────────────
    return (
          <ProfileCreation
                  onComplete={handleProfileCreationComplete}
                  onCancel={handleProfileCreationCancel}
                />
        );
};

export default Index;</div>
