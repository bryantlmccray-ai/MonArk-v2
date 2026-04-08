import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { signInSchema, emailSchema, getFirstError } from '@/lib/validation';
import { MonArkLogo } from '@/components/MonArkLogo';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SignInModal: React.FC<SignInModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = signInSchema.safeParse({ email, password });
    if (!result.success) {
      toast({ title: "Validation error", description: getFirstError(result) || "Please check your inputs", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      if (rememberMe) {
        localStorage.setItem('monark-remember-me', 'true');
      }
      const { error } = await signIn(email, password);
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast({ title: "Login failed", description: "The email or password you entered is incorrect.", variant: "destructive" });
        } else {
          toast({ title: "Login failed", description: "Unable to sign in. Please try again.", variant: "destructive" });
        }
      } else {
        onClose();
      }
    } catch {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/` }
      });
      if (error) {
        toast({ title: "Google Sign-in failed", description: "Something went wrong. Please try again.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    const result = emailSchema.safeParse(resetEmail);
    if (!result.success) {
      toast({ title: "Invalid email", description: "Please enter a valid email address", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(result.data, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setResetSent(true);
      toast({ title: "Reset email sent", description: "Check your email for password reset instructions" });
    } catch {
      toast({ title: "Reset failed", description: "Unable to send reset email. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[420px] p-0 bg-card border-border rounded-2xl overflow-hidden">
        <DialogTitle className="sr-only">Sign In</DialogTitle>
        <DialogDescription className="sr-only">Sign in to your MonArk account</DialogDescription>
        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="text-center space-y-2">
            <MonArkLogo size="lg" className="mb-4" />
            <h2 className="text-2xl font-serif font-bold text-foreground">Welcome Back</h2>
            <p className="text-sm font-body text-muted-foreground">Sign in to continue your journey</p>
          </div>

          {!showForgotPassword ? (
            <>
              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="modal-email" className="text-sm font-medium text-foreground">Email Address</Label>
                  <Input
                    id="modal-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="rounded-xl h-11"
                    required
                    maxLength={255}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="modal-password" className="text-sm font-medium text-foreground">Password</Label>
                  <div className="relative">
                    <Input
                      id="modal-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="rounded-xl h-11 pr-10"
                      required
                      maxLength={128}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="modal-remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label htmlFor="modal-remember" className="text-sm text-muted-foreground cursor-pointer">Remember me</Label>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setShowForgotPassword(true); setResetEmail(email); }}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-xl text-sm tracking-wide font-medium"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-card text-muted-foreground">or</span>
                </div>
              </div>

              {/* Google */}
              <Button
                onClick={handleGoogleSignIn}
                disabled={loading}
                variant="outline"
                className="w-full h-11 rounded-xl border-border bg-card hover:bg-secondary/60 text-foreground"
              >
                <svg className="w-5 h-5 mr-2.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>

              <p className="text-xs text-muted-foreground text-center font-medium">🔒 Your data is encrypted and secure</p>

              {/* Sign up link */}
              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <button
                  onClick={() => { onClose(); /* Let the parent handle navigation to sign-up */ }}
                  className="text-primary font-medium hover:text-primary/80 transition-colors"
                >
                  Join the waitlist
                </button>
              </p>
            </>
          ) : (
            /* Forgot Password */
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-serif font-semibold text-foreground mb-1">Reset Password</h3>
                <p className="text-sm font-body text-muted-foreground">Enter your email and we'll send you a reset link.</p>
              </div>
              {!resetSent ? (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="modal-reset-email" className="text-sm font-medium text-foreground">Email Address</Label>
                    <Input
                      id="modal-reset-email"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="rounded-xl h-11"
                      maxLength={255}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={handlePasswordReset} disabled={loading} className="flex-1 rounded-xl">
                      {loading ? 'Sending...' : 'Send Reset Link'}
                    </Button>
                    <Button onClick={() => setShowForgotPassword(false)} variant="ghost" className="px-4 rounded-xl text-muted-foreground">
                      Back
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 bg-primary/10">
                    <span className="text-xl text-primary">✓</span>
                  </div>
                  <p className="mb-1 font-body font-medium text-foreground">Check your email!</p>
                  <p className="text-sm font-body text-muted-foreground">
                    Reset link sent to <span className="text-primary font-medium">{resetEmail}</span>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
