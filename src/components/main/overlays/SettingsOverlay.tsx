import React, { useState } from 'react';
import { X, User, Shield, LogOut, Trash2, AlertTriangle } from 'lucide-react';
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
      await signOut();
      localStorage.removeItem('hasCompletedOnboarding');
      localStorage.removeItem('profileData');
      document.cookie = 'authToken=; Max-Age=0; path=/;';
      document.cookie = 'refreshToken=; Max-Age=0; path=/;';
      toast({ title: "Signed out successfully", description: "You've been signed out of your account." });
      onClose();
    } catch (error) {
      console.error('Sign out error:', error);
      localStorage.removeItem('hasCompletedOnboarding');
      localStorage.removeItem('profileData');
      toast({ title: "Signed out locally", description: "You've been signed out locally. Please refresh if needed.", variant: "destructive" });
      onClose();
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleDeleteProfile = async () => {
    if (!user) return;
    try {
      setIsDeleting(true);
      const { error } = await supabase.from('user_profiles').select('id').eq('user_id', user.id).limit(1);
      if (error) {
        console.error('Error checking profile:', error);
        toast({ title: "Deletion failed", description: "There was an error accessing your profile. Please try again.", variant: "destructive" });
        return;
      }
      const { error: deleteError } = await supabase.rpc('delete_user_completely' as any, { user_id_input: user.id });
      if (deleteError) {
        console.error('Error deleting profile:', deleteError);
        toast({ title: "Deletion failed", description: "There was an error deleting your profile. Please try again.", variant: "destructive" });
        return;
      }
      localStorage.removeItem('hasCompletedOnboarding');
      localStorage.removeItem('profileData');
      toast({ title: "Profile deleted", description: "Your profile and all associated data have been permanently deleted." });
      await signOut();
      onClose();
    } catch (error) {
      console.error('Delete profile error:', error);
      toast({ title: "Deletion failed", description: "There was an error deleting your profile. Please try again.", variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const settingsItems = [
    { icon: User, label: 'Edit Profile', action: () => setShowEditProfile(true) },
    { icon: Shield, label: 'Safety Center', action: () => setShowSafetyCenter(true) },
  ];

  const handleEditProfileComplete = () => {
    setShowEditProfile(false);
    toast({ title: "Profile updated", description: "Your profile has been successfully updated." });
  };

  if (showSafetyCenter) {
    return <UserSafetyOverlay onClose={() => setShowSafetyCenter(false)} />;
  }

  if (showEditProfile) {
    return (
      <div className="fixed inset-0 z-50">
        <ProfileCreation onComplete={handleEditProfileComplete} onCancel={() => setShowEditProfile(false)} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-card rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-border animate-slide-up shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium text-foreground">Settings</h2>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground transition-colors" disabled={isSigningOut || isDeleting}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {settingsItems.map((item, index) => (
            <button
              key={index}
              onClick={item.action}
              className="w-full flex items-center space-x-3 p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
              disabled={isSigningOut || isDeleting}
            >
              <item.icon className="h-5 w-5 text-muted-foreground" />
              <span className="text-foreground font-medium">{item.label}</span>
            </button>
          ))}

          <div className="mt-8 pt-6 border-t border-border space-y-3">
            <button 
              onClick={handleSignOut}
              disabled={isSigningOut || isDeleting}
              className="w-full flex items-center justify-center space-x-2 p-4 bg-transparent border border-border text-muted-foreground rounded-lg hover:border-destructive hover:text-destructive transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSigningOut ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent"></div>
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
              className="w-full flex items-center justify-center space-x-2 p-4 bg-transparent border border-destructive text-destructive rounded-lg hover:bg-destructive/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="h-5 w-5" />
              <span>Delete Profile</span>
            </button>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-foreground/80 flex items-center justify-center p-4 z-60">
          <div className="bg-card rounded-xl p-6 max-w-sm w-full space-y-4 border border-destructive/30 shadow-lg">
            <div className="flex items-center space-x-3 text-destructive">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-lg font-semibold">Delete Profile</h3>
            </div>
            
            <div className="space-y-3">
              <p className="text-secondary-foreground text-sm">
                This will permanently delete your entire profile and all associated data, including:
              </p>
              <ul className="text-muted-foreground text-xs space-y-1 ml-4">
                <li>• Your profile information and photos</li>
                <li>• All conversations and matches</li>
                <li>• Date journal entries</li>
                <li>• All app preferences and settings</li>
              </ul>
              <p className="text-destructive text-sm font-medium">
                This action cannot be undone.
              </p>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 p-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProfile}
                disabled={isDeleting}
                className="flex-1 p-3 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isDeleting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-destructive-foreground border-t-transparent"></div>
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
