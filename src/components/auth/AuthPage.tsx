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
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const { user, signIn, signUp } = useAuth();
  const { updateProfile } = useProfile();
  const { toast } = useToast();

  // Add effect to listen for successful authentication
  React.useEffect(() => {
    const handleAuthChange = () => {
      // This will be triggered when auth state changes
      if (user) {
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in to MonArk.",
        });
      }
    };

    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, [user, toast]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handlePasswordReset = async () => {
    if (!resetEmail || !validateEmail(resetEmail)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      setResetSent(true);
      toast({
        title: "Reset email sent",
        description: "Check your email for password reset instructions",
      });
    } catch (error: any) {
      toast({
        title: "Reset failed",
        description: error.message || "Failed to send reset email",
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
          description: error.message,
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
      // Complete the signup
      const { error } = await signUp(signupData.email, signupData.password, signupData.name);
      
      if (error) {
        toast({
          title: "Signup failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        // Update profile with age verification data
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
    
    if (!email || !password) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (!validateEmail(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }

    if (!isLogin && !name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name",
        variant: "destructive"
      });
      return;
    }

    if (!isLogin && !agreedToTerms) {
      toast({
        title: "Agreement required",
        description: "Please agree to the Terms of Service and Privacy Policy",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          // More specific error handling
          if (error.message.includes('Invalid login credentials')) {
            toast({
              title: "Login failed",
              description: "The email or password you entered is incorrect. Please try again.",
              variant: "destructive"
            });
          } else if (error.message.includes('Email not confirmed')) {
            toast({
              title: "Email not verified",
              description: "Please check your email and click the verification link before signing in.",
              variant: "destructive"
            });
          } else if (error.message.includes('Too many requests')) {
            toast({
              title: "Too many attempts",
              description: "Please wait a moment before trying again.",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Login failed",
              description: error.message,
              variant: "destructive"
            });
          }
        } else {
          // Sign in successful - don't show toast yet, let auth state handle UI update
          console.log('Sign in successful, waiting for auth state change');
        }
      } else {
        // For signup, show age verification first
        setSignupData({ email, password, name });
        setShowAgeVerification(true);
        setLoading(false);
        return;
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (showAgeVerification) {
    return <AgeVerificationStep onNext={handleAgeVerification} />;
  }

  return (
    <div className="min-h-screen bg-jet-black flex items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8">
        {/* MonArk Logo */}
        <div className="text-center">
          <MonArkLogo size="xl" rotateOnLoad={true} className="mb-12" />
        </div>

        <div className="text-center space-y-4">
          <h1 className="text-3xl font-light text-white">
            {isLogin ? 'Welcome Back' : 'Join MonArk'}
          </h1>
          <p className="text-gray-400">
            {isLogin 
              ? 'Sign in to continue your journey' 
              : 'Create your account to start meaningful connections'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white text-sm font-medium">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="bg-charcoal-gray border-gray-700 text-white placeholder:text-gray-500 focus:border-goldenrod"
                required={!isLogin}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-white text-sm font-medium">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="bg-charcoal-gray border-gray-700 text-white placeholder:text-gray-500 focus:border-goldenrod"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white text-sm font-medium">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="bg-charcoal-gray border-gray-700 text-white placeholder:text-gray-500 focus:border-goldenrod"
              required
            />
            {!isLogin && (
              <p className="text-xs text-gray-500">Must be at least 6 characters</p>
            )}
          </div>

          {!isLogin && (
            <div className="flex items-start gap-3 pt-2">
              <Checkbox
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                className="mt-1 border-goldenrod/50 data-[state=checked]:bg-goldenrod data-[state=checked]:border-goldenrod"
              />
              <p className="text-sm text-gray-400 leading-relaxed">
                I agree to MonArk's{' '}
                <a href="/terms" className="text-goldenrod hover:underline" target="_blank" rel="noopener noreferrer">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-goldenrod hover:underline" target="_blank" rel="noopener noreferrer">
                  Privacy Policy
                </a>
                . I consent to the collection and use of my data as described in these policies.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (!isLogin && !agreedToTerms)}
            className={`w-full py-4 font-semibold rounded-xl transition-all duration-300 ${
              loading || (!isLogin && !agreedToTerms)
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-goldenrod-gradient text-jet-black hover:shadow-golden-glow'
            }`}
          >
            {loading 
              ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-jet-black/30 border-t-jet-black rounded-full animate-spin"></div>
                  <span>{isLogin ? 'Signing in...' : 'Creating account...'}</span>
                </div>
              )
              : (isLogin ? 'Sign In' : 'Create Account')
            }
          </button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-jet-black text-gray-400">or</span>
          </div>
        </div>

        {/* Google Sign-in */}
        <div className="space-y-3">
          <Button
            onClick={handleGoogleSignIn}
            disabled={loading}
            variant="outline"
            className="w-full py-4 bg-white text-gray-800 border-gray-300 hover:bg-gray-50 font-semibold rounded-xl transition-all duration-300"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {isLogin ? 'Continue with Google' : 'Sign up with Google'}
          </Button>
        </div>

        <div className="text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setShowForgotPassword(false);
              setResetSent(false);
            }}
            className="text-goldenrod hover:text-goldenrod/80 transition-colors"
          >
            {isLogin 
              ? "Don't have an account? Sign up" 
              : "Already have an account? Sign in"
            }
          </button>
          
          {isLogin && (
            <div className="mt-2">
              <button
                onClick={() => {
                  setShowForgotPassword(!showForgotPassword);
                  setResetEmail(email);
                }}
                className="text-sm text-gray-400 hover:text-goldenrod transition-colors"
              >
                Forgot your password?
              </button>
            </div>
          )}
        </div>

        {/* Forgot Password Form */}
        {showForgotPassword && (
          <div className="border-t border-gray-700 pt-6 space-y-4">
            <div className="text-center">
              <h3 className="text-white font-medium mb-2">Reset Password</h3>
              <p className="text-gray-400 text-sm">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>
            
            {!resetSent ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="text-white text-sm font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="reset-email"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="bg-charcoal-gray border-gray-700 text-white placeholder:text-gray-500 focus:border-goldenrod"
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handlePasswordReset}
                    disabled={loading}
                    className="flex-1 py-3 bg-goldenrod-gradient text-jet-black font-semibold rounded-xl transition-all duration-300 hover:shadow-golden-glow disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                  
                  <button
                    onClick={() => setShowForgotPassword(false)}
                    className="px-4 py-3 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-white font-medium mb-1">Reset email sent!</p>
                <p className="text-gray-400 text-sm">
                  Check your email for instructions to reset your password.
                </p>
              </div>
            )}
          </div>
        )}

        {!isLogin && (
          <div className="text-center text-xs text-gray-500">
            <p>You must be 18 years or older to use MonArk</p>
          </div>
        )}
      </div>
    </div>
  );
};
