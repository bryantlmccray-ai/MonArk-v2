import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, Download, AlertTriangle, Shield, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const DataDeletionManager: React.FC = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadData = async () => {
    if (!user) return;

    setIsDownloading(true);
    try {
      // Collect user data from various tables
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const { data: rifData } = await supabase
        .from('rif_profiles')
        .select('*')
        .eq('user_id', user.id);

      const { data: journalData } = await supabase
        .from('date_journal')
        .select('*')
        .eq('user_id', user.id);

      const { data: matches } = await supabase
        .from('matches')
        .select('*')
        .eq('user_id', user.id);

      const userData = {
        profile,
        rifData,
        journalData,
        matches,
        exportDate: new Date().toISOString(),
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at
        }
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(userData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `monark-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Data exported successfully",
        description: "Your data has been downloaded as a JSON file",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting your data",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setIsDeleting(true);
    try {
      // Call the complete deletion function
      const { error } = await supabase.rpc('delete_user_completely', {
        user_id_input: user.id
      });

      if (error) throw error;

      // Sign out the user
      await signOut();

      toast({
        title: "Account deleted successfully",
        description: "Your account and all associated data have been permanently deleted",
      });
    } catch (error) {
      toast({
        title: "Deletion failed",
        description: "There was an error deleting your account. Please contact support.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) {
    return (
      <Card className="bg-charcoal-gray border-goldenrod/20">
        <CardContent className="pt-6">
          <div className="text-center text-gray-400">
            <Shield className="h-12 w-12 mx-auto mb-4" />
            <p>Please sign in to access data management features</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-charcoal-gray border-goldenrod/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          <Shield className="h-6 w-6 text-goldenrod" />
          Data Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Data Portability */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-start gap-4">
            <Download className="h-6 w-6 text-blue-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-white font-medium mb-2">Export Your Data</h3>
              <p className="text-blue-200 text-sm mb-4">
                Download a complete copy of all your personal data stored in MonArk. 
                This includes your profile, preferences, journal entries, and interaction history.
              </p>
              <Button
                onClick={handleDownloadData}
                disabled={isDownloading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                {isDownloading ? 'Preparing Export...' : 'Download My Data'}
              </Button>
            </div>
          </div>
        </div>

        {/* Account Deletion */}
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-red-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-white font-medium mb-2">Delete Your Account</h3>
              <p className="text-red-200 text-sm mb-4">
                Permanently delete your MonArk account and all associated data. 
                This action cannot be undone.
              </p>
              
              <div className="bg-red-950/50 rounded-lg p-3 mb-4">
                <h4 className="text-red-300 font-medium mb-2">What will be deleted:</h4>
                <ul className="text-red-200 text-sm space-y-1">
                  <li>• Your profile and personal information</li>
                  <li>• All photos and media files</li>
                  <li>• Journal entries and reflections</li>
                  <li>• Match history and conversations</li>
                  <li>• RIF data and insights</li>
                  <li>• Notification preferences</li>
                </ul>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete My Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-charcoal-gray border-red-500/30">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-400" />
                      Confirm Account Deletion
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-300">
                      This will permanently delete your account and all data associated with it. 
                      This action cannot be undone. Are you absolutely sure you want to proceed?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-gray-600 text-gray-300">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {isDeleting ? 'Deleting...' : 'Yes, Delete Forever'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>

        {/* Privacy Rights Information */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-start gap-4">
            <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-white font-medium mb-2">Your Privacy Rights</h3>
              <p className="text-gray-300 text-sm mb-3">
                Under privacy laws like GDPR and CCPA, you have the right to:
              </p>
              <ul className="text-gray-400 text-sm space-y-1">
                <li>• Access your personal data</li>
                <li>• Correct inaccurate information</li>
                <li>• Delete your personal data</li>
                <li>• Restrict processing of your data</li>
                <li>• Data portability</li>
                <li>• Object to processing</li>
              </ul>
              <p className="text-gray-400 text-xs mt-3">
                For questions about your rights, contact{' '}
                <a href="mailto:privacy@monark.com" className="text-goldenrod hover:underline">
                  privacy@monark.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};