import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMFA } from '@/hooks/useMFA';
import { useAdmin } from '@/hooks/useAdmin';
import { MFAEnrollment } from './MFAEnrollment';
import { MFAChallenge } from './MFAChallenge';

interface AdminMFAGateProps {
  children: React.ReactNode;
}

export const AdminMFAGate: React.FC<AdminMFAGateProps> = ({ children }) => {
  const { isModerator, loading: adminLoading } = useAdmin();
  const { isEnrolled, isVerified, needsVerification, loading: mfaLoading } = useMFA();
  const [mfaPassed, setMfaPassed] = useState(false);
  const navigate = useNavigate();

  // Show loading while checking permissions
  if (adminLoading || mfaLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-8 w-8 animate-spin mx-auto mb-4 text-goldenrod" />
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Not an admin/moderator — redirect
  if (!isModerator) {
    return <Navigate to="/" replace />;
  }

  // MFA not enrolled — require enrollment
  if (!isEnrolled) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-2xl p-8 w-full max-w-md shadow-lg">
          <MFAEnrollment 
            onComplete={() => setMfaPassed(true)} 
            onCancel={() => navigate('/')} 
          />
        </div>
      </div>
    );
  }

  // MFA enrolled but not verified this session
  if (needsVerification && !mfaPassed) {
    return (
      <MFAChallenge 
        onVerified={() => setMfaPassed(true)} 
        onCancel={() => navigate('/')} 
      />
    );
  }

  // ✅ Verified (aal2) or just passed challenge
  return <>{children}</>;
};
