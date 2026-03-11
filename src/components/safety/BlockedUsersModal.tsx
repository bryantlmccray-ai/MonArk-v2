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
      <DialogContent className="sm:max-w-[500px] max-h-[70vh] overflow-hidden bg-card border-2 border-border shadow-[0_8px_40px_-4px_hsl(var(--foreground)/0.15)]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Ban className="h-5 w-5 text-destructive" />
            Blocked Users
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Manage users you have blocked
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {blockedUsers.length === 0 ? (
            <div className="text-center py-8">
              <Ban className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
              <p className="text-foreground/70 font-medium">No blocked users</p>
              <p className="text-sm text-muted-foreground">
                Users you block will appear here
              </p>
            </div>
          ) : (
            <div className="max-h-[400px] overflow-y-auto space-y-3">
              {blockedUsers.map((blockedUser) => (
                <div
                  key={blockedUser.id}
                  className="bg-muted/50 rounded-xl p-4 border border-border"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                          <Ban className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-foreground font-semibold">Blocked User</p>
                          <p className="text-xs text-muted-foreground">
                            User ID: {blockedUser.blocked_user_id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Blocked {format(new Date(blockedUser.created_at), 'MMM d, yyyy')}
                      </div>
                      
                      {blockedUser.reason && (
                        <div className="text-sm text-foreground/70">
                          <span className="text-muted-foreground">Reason:</span> {blockedUser.reason}
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={() => handleUnblock(blockedUser.blocked_user_id)}
                      disabled={loading}
                      variant="outline"
                      size="sm"
                      className="border-primary/30 text-primary hover:bg-primary/10"
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

        <div className="pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground space-y-1 font-medium">
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
