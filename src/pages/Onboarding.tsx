import React from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { useAuth } from '@/hooks/useAuth';

/**
 * Onboarding page — accessible at /onboarding.
 *
 * Protected by AuthGuard in App.tsx (requires a real Supabase session).
 * Once OnboardingFlow calls onComplete, the user is sent to /dashboard.
 * The OnboardingGuard on /dashboard will verify is_profile_complete = true
 * before granting access.
 */
const Onboarding: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleComplete = () => {
          // Clear the localStorage step tracker so future logins don't re-enter onboarding
          try {
                  localStorage.removeItem('monark_onboarding_step');
          } catch {}
          navigate('/dashboard', { replace: true });
    };

    const handleSkipToWaiting = () => {
          try {
                  localStorage.removeItem('monark_onboarding_step');
          } catch {}
          navigate('/dashboard', { replace: true });
    };

    return (
          <OnboardingFlow
                  onComplete={handleComplete}
                  onSkipToWaiting={handleSkipToWaiting}
                />
        );
};

export default Onboarding;
