import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface MFAState {
  isEnrolled: boolean;
  isVerified: boolean; // aal2
  needsVerification: boolean; // enrolled but aal1
  loading: boolean;
}

export const useMFA = () => {
  const [state, setState] = useState<MFAState>({
    isEnrolled: false,
    isVerified: false,
    needsVerification: false,
    loading: true,
  });

  const checkMFAStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (error) throw error;

      const isEnrolled = data.nextLevel === 'aal2' || data.currentLevel === 'aal2';
      const isVerified = data.currentLevel === 'aal2';
      const needsVerification = isEnrolled && !isVerified;

      setState({ isEnrolled, isVerified, needsVerification, loading: false });
    } catch (error) {
      console.error('MFA status check failed:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    checkMFAStatus();
  }, [checkMFAStatus]);

  const enroll = async (): Promise<{ qrCode: string; secret: string; factorId: string } | null> => {
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Google Authenticator',
      });
      if (error) throw error;

      return {
        qrCode: data.totp.qr_code,
        secret: data.totp.secret,
        factorId: data.id,
      };
    } catch (error: any) {
      console.error('MFA enrollment failed:', error);
      toast({
        title: 'Enrollment failed',
        description: error.message || 'Could not set up MFA',
        variant: 'destructive',
      });
      return null;
    }
  };

  const verify = async (factorId: string, code: string): Promise<boolean> => {
    try {
      const { data: challengeData, error: challengeError } = 
        await supabase.auth.mfa.challenge({ factorId });
      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code,
      });
      if (verifyError) throw verifyError;

      await checkMFAStatus();
      return true;
    } catch (error: any) {
      console.error('MFA verification failed:', error);
      toast({
        title: 'Verification failed',
        description: error.message || 'Invalid code. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const challengeAndVerify = async (code: string): Promise<boolean> => {
    try {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totpFactor = factors?.totp?.[0];
      if (!totpFactor) {
        toast({ title: 'No MFA factor found', description: 'Please set up MFA first.', variant: 'destructive' });
        return false;
      }
      return await verify(totpFactor.id, code);
    } catch (error: any) {
      console.error('MFA challenge failed:', error);
      return false;
    }
  };

  const unenroll = async (): Promise<boolean> => {
    try {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totpFactor = factors?.totp?.[0];
      if (!totpFactor) return true;

      const { error } = await supabase.auth.mfa.unenroll({ factorId: totpFactor.id });
      if (error) throw error;

      await checkMFAStatus();
      toast({ title: 'MFA disabled', description: 'Two-factor authentication has been removed.' });
      return true;
    } catch (error: any) {
      console.error('MFA unenroll failed:', error);
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return false;
    }
  };

  return {
    ...state,
    enroll,
    verify,
    challengeAndVerify,
    unenroll,
    refresh: checkMFAStatus,
  };
};
