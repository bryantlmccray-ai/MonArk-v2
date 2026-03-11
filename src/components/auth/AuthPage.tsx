import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { AgeVerificationStep } from './AgeVerificationStep';
import { useProfile } from '@/hooks/useProfile';
import { MonArkLogo } from '@/components/MonArkLogo';
import { supabase } from '@/integrations/supabase/client';
import { signInSchema, signUpSchema, emailSchema, getFirstError } from '@/lib/validation';
import { motion } from 'framer-motion';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [signupData, setSignupData] = useState<{email: string; password: string; name: string} | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem('monark-remember-me') === 'true');
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const { user, signIn, signUp, enterDemoMode } = useAuth();
  const { updateProfile } = useProfile();
  const { toast } = useToast();

  // Show welcome toast when user authenticates (driven by React context, not window events)
  React.useEffect(() => {
    if (user) {
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in to MonArk.",
      });
    }
  }, [user, toast]);

  const handlePasswordReset = async () => {
    const result = emailSchema.safeParse(resetEmail);
    if (!result.success) {
      toast({
        title: "Invalid email",
        description: getFirstError(result) || "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(result.data, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setResetSent(true);
      toast({
        title: "Reset email sent",
        description: "Check your email for password reset instructions",
      });
    } catch (error: any) {
      toast({
        title: "Reset failed",
        description: "Unable to send reset email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        toast({
          title: "Google Sign-in failed",
          description: "Something went wrong with Google sign-in. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Something went wrong with Google sign-in. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAgeVerification = async (ageData: { dateOfBirth: Date; ageConfirmed: boolean }) => {
    if (!signupData) return;

    setLoading(true);
    try {
      const { error } = await signUp(signupData.email, signupData.password, signupData.name);
      
      if (error) {
        toast({
          title: "Signup failed",
          description: "Unable to create your account. Please try again.",
          variant: "destructive"
        });
      } else {
        await updateProfile({
          date_of_birth: ageData.dateOfBirth.toISOString().split('T')[0],
          age_verified: true,
        });

        toast({
          title: "Account created!",
          description: "Welcome to MonArk! Please check your email to verify your account.",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setShowAgeVerification(false);
      setSignupData(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      const result = signInSchema.safeParse({ email, password });
      if (!result.success) {
        toast({
          title: "Validation error",
          description: getFirstError(result) || "Please check your inputs",
          variant: "destructive"
        });
        return;
      }
    } else {
      const result = signUpSchema.safeParse({ email, password, name, agreedToTerms });
      if (!result.success) {
        toast({
          title: "Validation error",
          description: getFirstError(result) || "Please check your inputs",
          variant: "destructive"
        });
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        if (rememberMe) {
          localStorage.setItem('monark-remember-me', 'true');
          localStorage.setItem('monark-saved-email', email);
        } else {
          localStorage.removeItem('monark-remember-me');
          localStorage.removeItem('monark-saved-email');
        }
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast({ title: "Login failed", description: "The email or password you entered is incorrect.", variant: "destructive" });
          } else if (error.message.includes('Email not confirmed')) {
            toast({ title: "Email not verified", description: "Please check your email and click the verification link.", variant: "destructive" });
          } else if (error.message.includes('Too many requests')) {
            toast({ title: "Too many attempts", description: "Please wait a moment before trying again.", variant: "destructive" });
          } else {
            toast({ title: "Login failed", description: "Unable to sign in. Please try again.", variant: "destructive" });
          }
        }
      } else {
        setSignupData({ email, password, name });
        setShowAgeVerification(true);
        setLoading(false);
        return;
      }
    } catch (err) {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (showAgeVerification) {
    return <AgeVerificationStep onNext={handleAgeVerification} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden bg-background">
      {/* Subtle warm radial glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none opacity-40"
        style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.08) 0%, transparent 70%)" }}
      />

      <motion.div
        className="w-full max-w-sm space-y-6 relative z-10"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Logo */}
        <div className="text-center">
          <MonArkLogo size="xl" rotateOnLoad={true} className="mb-8" />
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">
            {isLogin ? 'Welcome Back' : 'Join MonArk'}
          </h1>
          <p className="font-body text-sm text-muted-foreground">
            {isLogin 
              ? 'Sign in to continue your journey' 
              : 'Create your account to start meaningful connections'
            }
          </p>
        </div>

        {/* Auth card */}
        <div className="bg-card border border-border/60 rounded-2xl p-6 space-y-5 shadow-[var(--shadow-elevated)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm font-medium text-foreground">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="rounded-xl h-11"
                  required={!isLogin}
                  maxLength={100}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email Address
              </Label>
              <Input
                id="email"
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
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="rounded-xl h-11"
                required
                maxLength={128}
              />
              {!isLogin && (
                <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
              )}
            </div>

            {isLogin && (
              <div className="flex items-center gap-3">
                <Checkbox
                  id="remember-me"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className="border-primary/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label htmlFor="remember-me" className="text-sm text-muted-foreground cursor-pointer">
                  Remember me
                </Label>
              </div>
            )}

            {!isLogin && (
              <div className="flex items-start gap-3 pt-1">
                <Checkbox
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                  className="mt-1 border-primary/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <p className="text-sm leading-relaxed text-muted-foreground">
                  I agree to MonArk's{' '}
                  <a href="/terms" className="text-primary font-medium hover:underline" target="_blank" rel="noopener noreferrer">Terms of Service</a>{' '}
                  and{' '}
                  <a href="/privacy" className="text-primary font-medium hover:underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
                </p>
              </div>
            )}

            <motion.button
              type="submit"
              disabled={loading || (!isLogin && !agreedToTerms)}
              className="w-full py-3 font-semibold rounded-xl transition-all duration-200 text-sm tracking-wide bg-primary text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_1px_3px_hsl(var(--primary)/0.15),0_2px_8px_hsl(var(--primary)/0.1)]"
              whileHover={!loading ? { scale: 1.01, boxShadow: "0 4px 20px hsl(var(--primary) / 0.25)" } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
            >
              {loading 
                ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                    <span>{isLogin ? 'Signing in...' : 'Creating account...'}</span>
                  </div>
                )
                : (isLogin ? 'Sign In' : 'Create Account')
              }
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-card text-muted-foreground">or</span>
            </div>
          </div>

          {/* Google + Demo */}
          <div className="space-y-3">
            <Button
              onClick={handleGoogleSignIn}
              disabled={loading}
              variant="outline"
              className="w-full h-11 font-semibold rounded-xl border-border bg-card hover:bg-secondary/60 text-foreground transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {isLogin ? 'Continue with Google' : 'Sign up with Google'}
            </Button>

            <Button
              onClick={enterDemoMode}
              disabled={loading}
              variant="outline"
              className="w-full h-11 font-medium rounded-xl border-dashed border-primary/30 text-primary hover:bg-primary/5 transition-all duration-200"
            >
              🧪 Continue as Guest (Demo Mode)
            </Button>
          </div>
        </div>

        {/* Toggle + Forgot */}
        <div className="text-center space-y-1.5">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setShowForgotPassword(false);
              setResetSent(false);
            }}
            className="transition-colors font-body text-sm text-primary hover:text-primary/80"
          >
            {isLogin 
              ? "Don't have an account? Sign up" 
              : "Already have an account? Sign in"
            }
          </button>
          
          {isLogin && (
            <div>
              <button
                onClick={() => {
                  setShowForgotPassword(!showForgotPassword);
                  setResetEmail(email);
                }}
                className="text-sm transition-colors text-muted-foreground hover:text-foreground"
              >
                Forgot your password?
              </button>
            </div>
          )}
        </div>

        {/* Forgot Password */}
        {showForgotPassword && (
          <div className="bg-card border border-border/60 rounded-2xl p-6 space-y-4 shadow-[var(--shadow-elevated)]">
            <div className="text-center">
              <h3 className="font-serif font-semibold text-foreground mb-1">Reset Password</h3>
              <p className="text-sm font-body text-muted-foreground">
                Enter your email and we'll send you a reset link.
              </p>
            </div>
            
            {!resetSent ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="reset-email" className="text-sm font-medium text-foreground">
                    Email Address
                  </Label>
                  <Input
                    id="reset-email"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="rounded-xl h-11"
                    maxLength={255}
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button
                    onClick={handlePasswordReset}
                    disabled={loading}
                    className="flex-1 rounded-xl"
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                  
                  <Button
                    onClick={() => setShowForgotPassword(false)}
                    variant="ghost"
                    className="px-4 rounded-xl text-muted-foreground"
                  >
                    Cancel
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
      </motion.div>
    </div>
  );
};
