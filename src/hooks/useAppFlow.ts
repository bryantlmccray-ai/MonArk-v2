/**
 * useAppFlow — MonArk top-level application state machine
 *
 * Owns every piece of state that was previously scattered across Index.tsx.
 * Index.tsx is now a pure orchestrator: it reads from this hook and renders
 * the correct screen. All business logic, side-effects, and transitions live
 * here instead.
 *
 * State machine overview:
 *   splash → landing | demo | loading → auth | onboarding → profile-creation
 *   → profile-complete → main-app
 */

import React from 'react';
import { useAuth } from './useAuth';
import { useProfile } from './useProfile';
import { useDemo } from '@/contexts/DemoContext';
import { supabase } from '@/integrations/supabase/client';

export const useAppFlow = () => {
    const { user, loading: authLoading, isDemoMode, exitDemoMode, signOut } = useAuth();
    const { profile, loading: profileLoading, refetchProfile, updateProfile } = useProfile();
    const { demoData, setDemoMode } = useDemo();

    // ─── Local UI state ────────────────────────────────────────────────────────
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = React.useState(false);
    const [showDemo, setShowDemo]           = React.useState(false);
    const [showAuth, setShowAuth]           = React.useState(false);
    const [authStartMode, setAuthStartMode] = React.useState<'login' | 'signup'>('login');
    const [showSplash, setShowSplash]       = React.useState(
          () => sessionStorage.getItem('monark-splash-seen-v8') !== 'true',
        );
    const [showProfileComplete, setShowProfileComplete] = React.useState(false);
    const [skippedProfile, setSkippedProfile]           = React.useState(false);
    const [initialTab, setInitialTab] = React.useState<'weekly' | 'profile'>('weekly');
    const [hasEnteredApp, setHasEnteredApp]   = React.useState(false);
    const [autoFixAttempted, setAutoFixAttempted] = React.useState(false);

    // ─── Derived demo flag (hook + context) ───────────────────────────────────
    const isInDemo = showDemo || demoData.isInDemo;

    // ─── Effect: clear auth overlay when user authenticates ───────────────────
    React.useEffect(() => {
          if (user || isDemoMode) setShowAuth(false);
    }, [user, isDemoMode]);

    // ─── Effect: escape key closes demo ───────────────────────────────────────
    React.useEffect(() => {
          const onKey = (e: KeyboardEvent) => {
                  if (e.key === 'Escape') setShowDemo(false);
          };
          window.addEventListener('keydown', onKey);
          return () => window.removeEventListener('keydown', onKey);
    }, []);

    // ─── Effect: persist pending age-verification from localStorage ───────────
    // Age DOB is stored in localStorage before email confirmation so it
    // survives the email-confirmation redirect. On next load with a live user
    // we flush it to user_profiles.
    React.useEffect(() => {
          if (!user) return;
          const raw = localStorage.getItem('monark-pending-age-verification');
          if (!raw) return;
          try {
                  const { dateOfBirth, userId } = JSON.parse(raw);
                  if (userId && userId !== user.id) return; // belongs to a different user
            const persist = async () => {
                      const { data: existing } = await supabase
                        .from('user_profiles')
                        .select('id')
                        .eq('user_id', user.id)
                        .maybeSingle();
                      if (existing) {
                                  await supabase
                                    .from('user_profiles')
                                    .update({ date_of_birth: dateOfBirth, age_verified: true, updated_at: new Date().toISOString() })
                                    .eq('user_id', user.id);
                      } else {
                                  await supabase
                                    .from('user_profiles')
                                    .insert({ user_id: user.id, date_of_birth: dateOfBirth, age_verified: true });
                      }
                      localStorage.removeItem('monark-pending-age-verification');
                      console.log('[useAppFlow] Persisted pending age verification');
                      refetchProfile();
            };
                  persist().catch((err) => {
                            console.error('[useAppFlow] Failed to persist age verification:', err);
                            localStorage.removeItem('monark-pending-age-verification');
                  });
          } catch {
                  localStorage.removeItem('monark-pending-age-verification');
          }
    }, [user, refetchProfile]);

    // ─── Effect: auto-fix is_profile_complete flag inconsistency ──────────────
    // If onboarding_step >= 10 but is_profile_complete is still false (e.g. a
    // failed write at the last step), quietly patch the record so the user is
    // not stuck in the onboarding loop.
    React.useEffect(() => {
          if (
                  profile &&
                  !profile.is_profile_complete &&
                  profile.onboarding_step != null &&
                  profile.onboarding_step >= 10 &&
                  !autoFixAttempted
                ) {
                  setAutoFixAttempted(true);
                  updateProfile({ is_profile_complete: true })
                    .then((ok) => {
                                if (ok) {
                                              console.log('[useAppFlow] Auto-fixed is_profile_complete');
                                              refetchProfile();
                                              setShowProfileComplete(true);
                                }
                    })
                    .catch((e) => console.error('[useAppFlow] Auto-fix failed:', e));
          }
    }, [profile, autoFixAttempted, updateProfile, refetchProfile]);

    // ─── Handlers ─────────────────────────────────────────────────────────────

    const handleSplashComplete = React.useCallback(() => {
          sessionStorage.setItem('monark-splash-seen-v8', 'true');
          setShowSplash(false);
    }, []);

    const handleDemoClose = React.useCallback(() => {
          setShowDemo(false);
          setDemoMode(false);
    }, [setDemoMode]);

    const handleSignIn = React.useCallback(() => {
          setAuthStartMode('login');
          setShowAuth(true);
    }, []);

    const handleSignUp = React.useCallback(() => {
          setAuthStartMode('signup');
          setShowAuth(true);
    }, []);

    const handleStartDemo = React.useCallback(() => {
          setShowDemo(true);
    }, []);

    const handleExitDemo = React.useCallback(() => {
          exitDemoMode();
    }, [exitDemoMode]);

    const handleOnboardingComplete = React.useCallback(() => {
          setHasCompletedOnboarding(true);
    }, []);

    const handleSkipToWaiting = React.useCallback(() => {
          setSkippedProfile(true);
    }, []);

    const handleProfileCompleteNext = React.useCallback(
          (destination: string) => {
                  setShowProfileComplete(false);
                  setSkippedProfile(false);
                  setHasEnteredApp(true);
                  setInitialTab(destination === 'discovery' ? 'profile' : 'weekly');
          },
          [],
        );

    const handleProfileCreationComplete = React.useCallback(async () => {
          setInitialTab('profile');
          setHasEnteredApp(true);
          await refetchProfile();
    }, [refetchProfile]);

    const handleProfileCreationCancel = React.useCallback(async () => {
          await signOut();
    }, [signOut]);

    // ─── Return ───────────────────────────────────────────────────────────────
    return {
          // State
          showSplash,
          showDemo: isInDemo,
          showAuth,
          authStartMode,
          showProfileComplete,
          skippedProfile,
          hasEnteredApp,
          hasCompletedOnboarding,
          initialTab,
          // Auth / profile
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
          handleExitDemo,
          handleOnboardingComplete,
          handleSkipToWaiting,
          handleProfileCompleteNext,
          handleProfileCreationComplete,
          handleProfileCreationCancel,
    };
};
