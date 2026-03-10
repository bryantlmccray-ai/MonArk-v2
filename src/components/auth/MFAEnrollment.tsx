import React, { useState } from 'react';
import { Shield, Copy, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMFA } from '@/hooks/useMFA';
import { toast } from '@/hooks/use-toast';

interface MFAEnrollmentProps {
  onComplete: () => void;
  onCancel?: () => void;
}

export const MFAEnrollment: React.FC<MFAEnrollmentProps> = ({ onComplete, onCancel }) => {
  const { enroll, verify } = useMFA();
  const [step, setStep] = useState<'start' | 'scan' | 'verify'>('start');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [factorId, setFactorId] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleEnroll = async () => {
    setLoading(true);
    const result = await enroll();
    setLoading(false);
    if (result) {
      setQrCode(result.qrCode);
      setSecret(result.secret);
      setFactorId(result.factorId);
      setStep('scan');
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6) return;
    setLoading(true);
    const success = await verify(factorId, code);
    setLoading(false);
    if (success) {
      toast({ title: 'MFA enabled', description: 'Two-factor authentication is now active on your account.' });
      onComplete();
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (step === 'start') {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Shield className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Set Up Two-Factor Authentication</h3>
          <p className="text-muted-foreground text-sm mt-2">
            Use Google Authenticator (or any TOTP app) to add an extra layer of security to your admin account.
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
          )}
          <Button onClick={handleEnroll} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Get Started
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'scan') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground">Scan QR Code</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Open Google Authenticator and scan this QR code
          </p>
        </div>
        
        <div className="flex justify-center">
          <div className="bg-white p-4 rounded-lg">
            <img src={qrCode} alt="MFA QR Code" className="w-48 h-48" />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground text-center">Can't scan? Enter this key manually:</p>
          <div className="flex items-center gap-2 bg-secondary rounded-lg p-3">
            <code className="text-xs text-foreground flex-1 break-all font-mono">{secret}</code>
            <button onClick={copySecret} className="p-1 hover:bg-secondary/80 rounded">
              {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
            </button>
          </div>
        </div>

        <Button className="w-full" onClick={() => setStep('verify')}>
          I've scanned the code
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground">Enter Verification Code</h3>
        <p className="text-muted-foreground text-sm mt-1">
          Enter the 6-digit code from Google Authenticator
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
        className="text-center text-2xl tracking-[0.5em] font-mono"
        autoFocus
      />

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep('scan')} className="flex-1">
          Back
        </Button>
        <Button onClick={handleVerify} disabled={code.length !== 6 || loading} className="flex-1">
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Verify
        </Button>
      </div>
    </div>
  );
};
