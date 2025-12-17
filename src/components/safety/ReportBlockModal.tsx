import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Ban, Flag } from 'lucide-react';
import { useUserSafety } from '@/hooks/useUserSafety';

interface ReportBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  conversationId?: string;
}

const reportReasons = [
  { value: 'inappropriate_content', label: 'Inappropriate content' },
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'spam', label: 'Spam or scam' },
  { value: 'fake_profile', label: 'Fake profile' },
  { value: 'other', label: 'Other' },
];

export const ReportBlockModal: React.FC<ReportBlockModalProps> = ({
  isOpen,
  onClose,
  userId,
  userName,
  conversationId
}) => {
  const { blockUser, reportUser, loading } = useUserSafety();
  const [action, setAction] = useState<'block' | 'report'>('block');
  const [reportReason, setReportReason] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async () => {
    if (action === 'block') {
      const success = await blockUser(userId, 'Blocked from chat');
      if (success) onClose();
    } else {
      if (!reportReason) return;
      const success = await reportUser(
        userId,
        reportReason,
        reportReasons.find(r => r.value === reportReason)?.label || reportReason,
        description || undefined,
        conversationId
      );
      if (success) onClose();
    }
  };

  const resetForm = () => {
    setAction('block');
    setReportReason('');
    setDescription('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        resetForm();
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Block or Report {userName}</DialogTitle>
          <DialogDescription>
            Take action to protect yourself
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Action Selection */}
          <div className="flex gap-2">
            <Button
              variant={action === 'block' ? 'default' : 'outline'}
              onClick={() => setAction('block')}
              className="flex-1"
            >
              <Ban className="h-4 w-4 mr-2" />
              Block
            </Button>
            <Button
              variant={action === 'report' ? 'default' : 'outline'}
              onClick={() => setAction('report')}
              className="flex-1"
            >
              <Flag className="h-4 w-4 mr-2" />
              Report
            </Button>
          </div>

          {action === 'block' ? (
            <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
              <p className="font-medium mb-2">Blocking {userName} will:</p>
              <ul className="space-y-1 text-xs">
                <li>• Remove them from your matches</li>
                <li>• Prevent them from contacting you</li>
                <li>• Hide your profile from them</li>
              </ul>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Why are you reporting?</Label>
                <RadioGroup value={reportReason} onValueChange={setReportReason}>
                  {reportReasons.map((reason) => (
                    <div key={reason.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={reason.value} id={reason.value} />
                      <Label htmlFor={reason.value} className="text-sm font-normal">
                        {reason.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Additional details (optional)</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us more about what happened..."
                  className="min-h-[80px]"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || (action === 'report' && !reportReason)}
              variant={action === 'block' ? 'destructive' : 'default'}
              className="flex-1"
            >
              {loading ? 'Processing...' : action === 'block' ? 'Block User' : 'Submit Report'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};