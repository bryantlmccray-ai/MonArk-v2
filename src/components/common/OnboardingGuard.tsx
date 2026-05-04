import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { LoadingSpinner } from './LoadingSpinner';

interface OnboardingGuardProps {
    children: React.ReactNode;
}

/**
 * OnboardingGuard - Redirects authenticated users to /onboarding
 * if they have not completed the onboarding flow (onboarding_step < 10
 * or is_profile_complete = false).
 *
 * Must be used INSIDE an AuthGuard so that `user` is guaranteed non-null.
 */
export const OnboardingGuard: React.FC<OnboardingGuardProps> = ({ children }) => {
    const { user } = useAuth();
    const { profile, loading } = useProfile();
    const location = useLocation();

    // Still fetching profile — show spinner to avoid flash
    if (loading) {
          return (
                  <div className="min-h-screen bg-background flex items-center justify-center">
                          <LoadingSpinner />
                  </div>div>
                );
    }
  
    // No profile record yet — send to onboarding to create one
    if (!profile) {
          return <Navigate to="/onboarding" state={{ from: location }} replace />;
    }
  
    // Profile exists but onboarding is incomplete
    const onboardingComplete =
          profile.is_profile_complete === true || (profile.onboarding_step ?? 0) >= 10;
  
    if (!onboardingComplete) {
          return <Navigate to="/onboarding" state={{ from: location }} replace />;
    }
  
    return <>{children}</>>;
};

export default OnboardingGuard;
</></div>
