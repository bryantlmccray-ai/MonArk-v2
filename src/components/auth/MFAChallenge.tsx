import React, { useState } from 'react';
import { Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMFA } from '@/hooks/useMFA';

interface MFAChallengeProps {
  onVerified: () => void;
  onCancel?: () => void;
}

export const MFAChallenge: React.FC<MFAChallengeProps> = ({ onVerified, onCancel }) => {
  const { challengeAndVerify } = useMFA();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (code.length !== 6) return;
    setLoading(true);
    const success = await challengeAndVerify(code);
    setLoading(false);
    if (success) {
      onVerified();
    } else {
      setCode('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && code.length === 6) {
      handleVerify();
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl p-8 w-full max-w-sm space-y-6 shadow-lg">
        <div className="text-center space-y-3">
          <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Admin Verification</h2>
          <p className="text-muted-foreground text-sm">
            Enter the 6-digit code from Google Authenticator to access admin features.
          </p>
        </div>

        <Input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          placeholder="000000"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          onKeyDown={handleKeyDown}
          className="text-center text-2xl tracking-[0.5em] font-mono"
          autoFocus
        />

        <div className="space-y-3">
          <Button onClick={handleVerify} disabled={code.length !== 6 || loading} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Verify & Continue
          </Button>
          {onCancel && (
            <Button variant="ghost" onClick={onCancel} className="w-full text-muted-foreground">
              Go Back
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
