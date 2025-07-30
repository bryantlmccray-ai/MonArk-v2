import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { MonArkLogo } from '@/components/MonArkLogo';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a valid session for password reset
    const checkSession = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (session?.session?.user) {
        setIsValidSession(true);
      } else {
        toast({
          title: "Invalid reset link",
          description: "This password reset link is invalid or has expired.",
          variant: "destructive"
        });
        navigate('/');
      }
    };

    checkSession();
  }, [navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
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

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Password updated!",
        description: "Your password has been successfully updated. You can now sign in with your new password.",
      });

      // Redirect to home page after successful reset
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Reset failed",
        description: error.message || "Failed to update password",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-jet-black flex items-center justify-center px-6">
        <div className="text-center">
          <MonArkLogo size="xl" className="mb-6" />
          <p className="text-gray-400">Validating reset link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-jet-black flex items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8">
        {/* MonArk Logo */}
        <div className="text-center">
          <MonArkLogo size="xl" rotateOnLoad={true} className="mb-12" />
        </div>

        <div className="text-center space-y-4">
          <h1 className="text-3xl font-light text-white">Reset Your Password</h1>
          <p className="text-gray-400">
            Enter your new password below
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white text-sm font-medium">
              New Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your new password"
              className="bg-charcoal-gray border-gray-700 text-white placeholder:text-gray-500 focus:border-goldenrod"
              required
            />
            <p className="text-xs text-gray-500">Must be at least 6 characters</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-white text-sm font-medium">
              Confirm New Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              className="bg-charcoal-gray border-gray-700 text-white placeholder:text-gray-500 focus:border-goldenrod"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-goldenrod-gradient text-jet-black font-semibold rounded-xl transition-all duration-300 hover:shadow-golden-glow disabled:opacity-50"
          >
            {loading ? 'Updating Password...' : 'Update Password'}
          </Button>
        </form>

        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="text-goldenrod hover:text-goldenrod/80 transition-colors text-sm"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}