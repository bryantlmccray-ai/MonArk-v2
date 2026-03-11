 import React from 'react';
 import { Navigate, useLocation } from 'react-router-dom';
 import { useAuth } from '@/hooks/useAuth';
 import { LoadingSpinner } from './LoadingSpinner';
 
 interface AuthGuardProps {
   children: React.ReactNode;
   fallbackPath?: string;
 }
 
/**
 * AuthGuard - Protects routes requiring a real Supabase session.
 * Demo mode is intentionally NOT trusted here — demo users use
 * DemoMainApp which renders client-side mock data only.
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  fallbackPath = '/' 
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Only allow access with a real Supabase-authenticated user (JWT-backed)
  if (user) {
    return <>{children}</>;
  }

  return <Navigate to={fallbackPath} state={{ from: location }} replace />;
};
 
 export default AuthGuard;