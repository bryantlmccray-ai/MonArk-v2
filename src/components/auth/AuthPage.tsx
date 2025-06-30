
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { AgeVerificationStep } from './AgeVerificationStep';
import { useProfile } from '@/hooks/useProfile';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [signupData, setSignupData] = useState<{email: string; password: string; name: string} | null>(null);
  const { signIn, signUp } = useAuth();
  const { updateProfile } = useProfile();
  const { toast } = useToast();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast({
              title: "Login failed",
              description: "Invalid email or password",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Login failed",
              description: error.message,
              variant: "destructive"
            });
          }
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
          <img 
            src="/lovable-uploads/19cdbd08-40c6-4542-b75d-d8d052388a22.png" 
            alt="MonArk Logo" 
            className="mx-auto w-144 h-144 object-contain mb-6"
          />
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-goldenrod-gradient text-jet-black font-semibold rounded-xl transition-all duration-300 hover:shadow-golden-glow disabled:opacity-50"
          >
            {loading 
              ? (isLogin ? 'Signing in...' : 'Creating account...') 
              : (isLogin ? 'Sign In' : 'Create Account')
            }
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-goldenrod hover:text-goldenrod/80 transition-colors"
          >
            {isLogin 
              ? "Don't have an account? Sign up" 
              : "Already have an account? Sign in"
            }
          </button>
        </div>

        {!isLogin && (
          <div className="text-center text-xs text-gray-500 space-y-1">
            <p>By creating an account, you agree to our Terms of Service</p>
            <p>You must be 18 years or older to use MonArk</p>
          </div>
        )}
      </div>
    </div>
  );
};
