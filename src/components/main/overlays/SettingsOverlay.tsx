
import React, { useState } from 'react';
import { X, User, Bell, Shield, Heart, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface SettingsOverlayProps {
  onClose: () => void;
}

export const SettingsOverlay: React.FC<SettingsOverlayProps> = ({ onClose }) => {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      
      // Clear session data and sign out
      await signOut();
      
      // Clear any additional local storage data
      localStorage.removeItem('hasCompletedOnboarding');
      localStorage.removeItem('profileData');
      
      // Clear any cookies if needed
      document.cookie = 'authToken=; Max-Age=0; path=/;';
      document.cookie = 'refreshToken=; Max-Age=0; path=/;';
      
      toast({
        title: "Signed out successfully",
        description: "You've been signed out of your account.",
      });
      
      onClose();
    } catch (error) {
      console.error('Sign out error:', error);
      
      // Even if server-side logout fails, clear local data
      localStorage.removeItem('hasCompletedOnboarding');
      localStorage.removeItem('profileData');
      
      toast({
        title: "Signed out locally",
        description: "You've been signed out locally. Please refresh if needed.",
        variant: "destructive",
      });
      
      onClose();
    } finally {
      setIsSigningOut(false);
    }
  };

  const settingsItems = [
    { icon: User, label: 'Edit Profile', action: () => {} },
    { icon: Bell, label: 'Notifications', action: () => {} },
    { icon: Shield, label: 'Privacy & Safety', action: () => {} },
    { icon: Heart, label: 'Matching Preferences', action: () => {} },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-jet-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-charcoal-gray rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-700 animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            disabled={isSigningOut}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {settingsItems.map((item, index) => (
            <button
              key={index}
              onClick={item.action}
              className="w-full flex items-center space-x-3 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
              disabled={isSigningOut}
            >
              <item.icon className="h-5 w-5 text-gray-400" />
              <span className="text-white font-medium">{item.label}</span>
            </button>
          ))}

          <div className="mt-8 pt-6 border-t border-gray-700">
            <button 
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full flex items-center justify-center space-x-2 p-4 bg-transparent border border-gray-600 text-gray-400 rounded-lg hover:border-red-500 hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSigningOut ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"></div>
                  <span>Signing out...</span>
                </>
              ) : (
                <>
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
