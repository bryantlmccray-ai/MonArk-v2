 import React from 'react';
 import { Navigate, useLocation } from 'react-router-dom';
 import { useAuth } from '@/hooks/useAuth';
 import { LoadingSpinner } from './LoadingSpinner';
 
 interface AuthGuardProps {
   children: React.ReactNode;
   fallbackPath?: string;
 }
 
 /**
  * AuthGuard - Protects routes requiring authentication
  * Redirects unauthenticated users to the landing page
  */
 export const AuthGuard: React.FC<AuthGuardProps> = ({ 
   children, 
   fallbackPath = '/' 
 }) => {
   const { user, loading, isDemoMode } = useAuth();
   const location = useLocation();
 
   // Show loading spinner while checking auth state
   if (loading) {
     return (
       <div className="min-h-screen bg-background flex items-center justify-center">
         <LoadingSpinner />
       </div>
     );
   }
 
   // Allow access if user is authenticated or in demo mode
   if (user || isDemoMode) {
     return <>{children}</>;
   }
 
   // Redirect to landing/login with return path
   return <Navigate to={fallbackPath} state={{ from: location }} replace />;
 };
 
 export default AuthGuard;