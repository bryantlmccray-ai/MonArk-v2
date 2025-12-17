import React, { useState } from 'react';
import { Download, Edit, Trash2, Shield, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const PrivacyDataPortal: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleDataExport = async () => {
    if (!user) return;

    try {
      setIsExporting(true);
      
      // Compile all user data
      const [
        profileData,
        rifProfile,
        rifSettings,
        reflections,
        dateJournal,
        rifState
      ] = await Promise.all([
        supabase.from('user_profiles').select('*').eq('user_id', user.id).single(),
        supabase.from('rif_profiles').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('rif_settings').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('rif_reflections').select('*').eq('user_id', user.id),
        supabase.from('date_journal').select('*').eq('user_id', user.id),
        supabase.from('user_rif_state').select('*').eq('user_id', user.id).maybeSingle()
      ]);

      const userData = {
        exportDate: new Date().toISOString(),
        userInfo: {
          id: user.id,
          email: user.email,
          createdAt: user.created_at
        },
        profile: profileData.data,
        rifProfile: rifProfile.data,
        rifSettings: rifSettings.data,
        reflections: reflections.data,
        dateJournal: dateJournal.data,
        rifState: rifState.data,
        exportNote: "This export contains all personal data associated with your MonArk account as of the export date."
      };

      // Create downloadable file
      const blob = new Blob([JSON.stringify(userData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `monark-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Data exported successfully",
        description: "Your personal data has been downloaded to your device.",
      });
    } catch (error) {
      console.error('Data export error:', error);
      toast({
        title: "Export failed",
        description: "There was an error exporting your data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    try {
      setIsDeleting(true);

      // Execute complete profile deletion
      const { error } = await supabase.rpc('delete_user_completely' as any, {
        user_id_input: user.id
      });

      if (error) {
        console.error('Error deleting profile:', error);
        toast({
          title: "Deletion failed",
          description: "There was an error deleting your account. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Account deleted",
        description: "Your account and all associated data have been permanently deleted.",
      });

      // Sign out the user
      await signOut();
    } catch (error) {
      console.error('Delete account error:', error);
      toast({
        title: "Deletion failed",
        description: "There was an error deleting your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <Shield className="h-6 w-6 text-goldenrod" />
        <h2 className="text-xl font-semibold text-white">Privacy & Data Management</h2>
      </div>

      <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <CheckCircle className="h-5 w-5 text-amber-400 mt-0.5" />
          <div>
            <h3 className="text-amber-400 font-medium">Your Privacy Rights</h3>
            <p className="text-amber-200 text-sm mt-1">
              MonArk is committed to protecting your privacy. You have complete control over your personal data.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Access My Data */}
        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <div className="flex items-start space-x-3">
            <Download className="h-5 w-5 text-goldenrod mt-1" />
            <div className="flex-1">
              <h3 className="text-white font-medium">Access My Data</h3>
              <p className="text-gray-400 text-sm mt-1">
                Download a complete copy of all personal data associated with your account in a machine-readable format.
              </p>
              <ul className="text-gray-500 text-xs mt-2 space-y-1">
                <li>• Profile information and photos</li>
                <li>• Dating preferences and style</li>
                <li>• Journal entries and reflections</li>
                <li>• Date history and preferences</li>
                <li>• Privacy settings and consent history</li>
              </ul>
            </div>
          </div>
          <Button
            onClick={handleDataExport}
            disabled={isExporting}
            className="w-full bg-goldenrod-gradient text-jet-black font-medium"
          >
            {isExporting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-jet-black border-t-transparent mr-2"></div>
                Preparing Export...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export My Data
              </>
            )}
          </Button>
        </div>

        {/* Correct My Data */}
        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <div className="flex items-start space-x-3">
            <Edit className="h-5 w-5 text-goldenrod mt-1" />
            <div className="flex-1">
              <h3 className="text-white font-medium">Correct My Data</h3>
              <p className="text-gray-400 text-sm mt-1">
                Update your personal information, preferences, and privacy settings.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="border-gray-600 text-gray-300 hover:border-goldenrod/50"
              onClick={() => window.location.href = '/profile'}
            >
              Edit Profile
            </Button>
            <Button
              variant="outline"
              className="border-gray-600 text-gray-300 hover:border-goldenrod/50"
              onClick={() => window.location.href = '/settings'}
            >
              Privacy Settings
            </Button>
          </div>
        </div>

        {/* Delete My Account */}
        <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-6 space-y-4">
          <div className="flex items-start space-x-3">
            <Trash2 className="h-5 w-5 text-red-400 mt-1" />
            <div className="flex-1">
              <h3 className="text-red-400 font-medium">Delete My Account & Data</h3>
              <p className="text-red-200 text-sm mt-1">
                Permanently delete your account and all associated personal data. This action cannot be undone.
              </p>
              <div className="bg-red-900/30 rounded p-3 mt-3">
                <p className="text-red-300 text-xs font-medium">What will be deleted:</p>
                <ul className="text-red-400 text-xs mt-1 space-y-1">
                  <li>• Your profile and all photos</li>
                  <li>• All conversations and matches</li>
                  <li>• Date journal and reflections</li>
                  <li>• Dating preferences and style</li>
                  <li>• All preferences and settings</li>
                </ul>
              </div>
            </div>
          </div>
          <Button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isDeleting}
            variant="destructive"
            className="w-full bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete My Account
          </Button>
        </div>
      </div>

      {/* Legal Information */}
      <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4 text-gray-400" />
          <span className="text-gray-300 text-sm font-medium">Legal Information</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <a href="/privacy" className="text-goldenrod hover:underline">
            Privacy Policy
          </a>
          <a href="/terms" className="text-goldenrod hover:underline">
            Terms of Service
          </a>
          <a href="/data-processing" className="text-goldenrod hover:underline">
            Data Processing Agreement
          </a>
          <a href="/cookie-policy" className="text-goldenrod hover:underline">
            Cookie Policy
          </a>
        </div>
        <p className="text-gray-500 text-xs">
          MonArk complies with GDPR, CCPA, CPRA, and Washington's My Health My Data Act.
        </p>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-jet-black/90 flex items-center justify-center p-4 z-60">
          <div className="bg-charcoal-gray rounded-xl p-6 max-w-sm w-full space-y-4 border border-red-600/30">
            <div className="flex items-center space-x-3 text-red-400">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-lg font-semibold">Confirm Account Deletion</h3>
            </div>
            
            <div className="space-y-3">
              <p className="text-gray-300 text-sm">
                Are you absolutely sure you want to delete your account? This will permanently remove:
              </p>
              <ul className="text-gray-400 text-xs space-y-1 ml-4">
                <li>• Your entire profile and all photos</li>
                <li>• All conversations, matches, and connections</li>
                <li>• Date journal entries and reflections</li>
                <li>• Dating preferences and style data</li>
                <li>• All app preferences and settings</li>
              </ul>
              <p className="text-red-400 text-sm font-medium">
                This action cannot be undone and you will not be able to recover your data.
              </p>
            </div>

            <div className="flex space-x-3 pt-2">
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                variant="destructive"
                className="flex-1 bg-red-600 hover:bg-red-700 flex items-center justify-center space-x-2"
              >
                {isDeleting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Yes, Delete Forever</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};