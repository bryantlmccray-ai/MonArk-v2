import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Ban, Calendar, Unlock } from 'lucide-react';
import { useUserSafety } from '@/hooks/useUserSafety';
import { format } from 'date-fns';

interface BlockedUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BlockedUsersModal: React.FC<BlockedUsersModalProps> = ({
  isOpen,
  onClose
}) => {
  const { blockedUsers, unblockUser, loading } = useUserSafety();

  const handleUnblock = async (userId: string) => {
    const success = await unblockUser(userId);
    if (success) {
      // Refresh is handled automatically by the hook
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[70vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Ban className="h-5 w-5 text-red-400" />
            Blocked Users
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Manage users you have blocked
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {blockedUsers.length === 0 ? (
            <div className="text-center py-8">
              <Ban className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No blocked users</p>
              <p className="text-sm text-gray-500">
                Users you block will appear here
              </p>
            </div>
          ) : (
            <div className="max-h-[400px] overflow-y-auto space-y-3">
              {blockedUsers.map((blockedUser) => (
                <div
                  key={blockedUser.id}
                  className="bg-charcoal-gray/50 rounded-lg p-4 border border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                          <Ban className="h-4 w-4 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">Blocked User</p>
                          <p className="text-xs text-gray-400">
                            User ID: {blockedUser.blocked_user_id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        Blocked {format(new Date(blockedUser.created_at), 'MMM d, yyyy')}
                      </div>
                      
                      {blockedUser.reason && (
                        <div className="text-sm text-gray-300">
                          <span className="text-gray-500">Reason:</span> {blockedUser.reason}
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={() => handleUnblock(blockedUser.blocked_user_id)}
                      disabled={loading}
                      variant="outline"
                      size="sm"
                      className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                    >
                      <Unlock className="h-4 w-4 mr-1" />
                      Unblock
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-gray-700">
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Blocked users cannot message you or see your profile</p>
            <p>• You won't see their profiles in discovery</p>
            <p>• Existing conversations will be hidden</p>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};