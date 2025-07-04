import React, { useState } from 'react';
import { X, User, Bell, Shield, Heart, LogOut, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ProfileCreation } from '@/components/profile/ProfileCreation';
import { UserSafetyOverlay } from '@/components/safety/UserSafetyOverlay';

interface SettingsOverlayProps {
  onClose: () => void;
}

export const SettingsOverlay: React.FC<SettingsOverlayProps> = ({ onClose }) => {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showSafetyCenter, setShowSafetyCenter] = useState(false);
  const { signOut, user } = useAuth();
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

  const handleDeleteProfile = async () => {
    if (!user) return;

    try {
      setIsDeleting(true);

      // Call the delete function using SQL query
      const { error } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (error) {
        console.error('Error checking profile:', error);
        toast({
          title: "Deletion failed",
          description: "There was an error accessing your profile. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Execute the deletion function via SQL
      const { error: deleteError } = await supabase.rpc('delete_user_completely' as any, {
        user_id_input: user.id
      });

      if (deleteError) {
        console.error('Error deleting profile:', deleteError);
        toast({
          title: "Deletion failed",
          description: "There was an error deleting your profile. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Clear local storage
      localStorage.removeItem('hasCompletedOnboarding');
      localStorage.removeItem('profileData');

      toast({
        title: "Profile deleted",
        description: "Your profile and all associated data have been permanently deleted.",
      });

      // Sign out the user
      await signOut();
      onClose();
    } catch (error) {
      console.error('Delete profile error:', error);
      toast({
        title: "Deletion failed",
        description: "There was an error deleting your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const settingsItems = [
    { icon: User, label: 'Edit Profile', action: () => setShowEditProfile(true) },
    { icon: Bell, label: 'Notifications', action: () => {} },
    { icon: Shield, label: 'Safety Center', action: () => setShowSafetyCenter(true) },
    { icon: Heart, label: 'Matching Preferences', action: () => {} },
  ];

  // Handle edit profile completion
  const handleEditProfileComplete = () => {
    setShowEditProfile(false);
    toast({
      title: "Profile updated",
      description: "Your profile has been successfully updated.",
    });
  };

  // Show safety center
  if (showSafetyCenter) {
    return <UserSafetyOverlay onClose={() => setShowSafetyCenter(false)} />;
  }

  // Show edit profile modal
  if (showEditProfile) {
    return (
      <div className="fixed inset-0 z-50">
        <ProfileCreation onComplete={handleEditProfileComplete} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-jet-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-charcoal-gray rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-700 animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            disabled={isSigningOut || isDeleting}
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
              disabled={isSigningOut || isDeleting}
            >
              <item.icon className="h-5 w-5 text-gray-400" />
              <span className="text-white font-medium">{item.label}</span>
            </button>
          ))}

          <div className="mt-8 pt-6 border-t border-gray-700 space-y-3">
            <button 
              onClick={handleSignOut}
              disabled={isSigningOut || isDeleting}
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

            <button 
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isSigningOut || isDeleting}
              className="w-full flex items-center justify-center space-x-2 p-4 bg-transparent border border-red-600 text-red-400 rounded-lg hover:bg-red-600/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="h-5 w-5" />
              <span>Delete Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-jet-black/90 flex items-center justify-center p-4 z-60">
          <div className="bg-charcoal-gray rounded-xl p-6 max-w-sm w-full space-y-4 border border-red-600/30">
            <div className="flex items-center space-x-3 text-red-400">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-lg font-semibold">Delete Profile</h3>
            </div>
            
            <div className="space-y-3">
              <p className="text-gray-300 text-sm">
                This will permanently delete your entire profile and all associated data, including:
              </p>
              <ul className="text-gray-400 text-xs space-y-1 ml-4">
                <li>• Your profile information and photos</li>
                <li>• All conversations and matches</li>
                <li>• Date journal entries</li>
                <li>• RIF insights and reflections</li>
                <li>• All app preferences and settings</li>
              </ul>
              <p className="text-red-400 text-sm font-medium">
                This action cannot be undone.
              </p>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 p-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProfile}
                disabled={isDeleting}
                className="flex-1 p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isDeleting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Forever</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
