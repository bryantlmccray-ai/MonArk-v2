import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Shield, AlertTriangle, Ban } from 'lucide-react';
import { useUserSafety } from '@/hooks/useUserSafety';

interface UserActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName?: string;
  conversationId?: string;
}

export const UserActionsModal: React.FC<UserActionsModalProps> = ({
  isOpen,
  onClose,
  userId,
  userName = 'User',
  conversationId
}) => {
  const { blockUser, reportUser, isUserBlocked, loading } = useUserSafety();
  const [activeAction, setActiveAction] = useState<'block' | 'report' | null>(null);
  const [blockReason, setBlockReason] = useState('');
  const [reportType, setReportType] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');

  const isBlocked = isUserBlocked(userId);

  const handleBlock = async () => {
    const success = await blockUser(userId, blockReason || undefined);
    if (success) {
      setBlockReason('');
      setActiveAction(null);
      onClose();
    }
  };

  const handleReport = async () => {
    if (!reportType || !reportReason) return;
    
    const success = await reportUser(
      userId,
      reportType,
      reportReason,
      reportDescription || undefined,
      conversationId
    );
    
    if (success) {
      setReportType('');
      setReportReason('');
      setReportDescription('');
      setActiveAction(null);
      onClose();
    }
  };

  const reportTypes = [
    { value: 'harassment', label: 'Harassment or Bullying' },
    { value: 'spam', label: 'Spam or Unwanted Content' },
    { value: 'inappropriate_content', label: 'Inappropriate Content' },
    { value: 'fake_profile', label: 'Fake Profile' },
    { value: 'threatening_behavior', label: 'Threatening Behavior' },
    { value: 'hate_speech', label: 'Hate Speech' },
    { value: 'scam', label: 'Scam or Fraud' },
    { value: 'underage', label: 'Underage User' },
    { value: 'other', label: 'Other' }
  ];

  const reportReasons = {
    harassment: [
      'Sending unwanted messages',
      'Verbal abuse or insults',
      'Persistent contact after being asked to stop',
      'Other harassment'
    ],
    spam: [
      'Promotional content',
      'Repetitive messages',
      'Bot-like behavior',
      'Other spam'
    ],
    inappropriate_content: [
      'Sexual content',
      'Graphic violence',
      'Illegal content',
      'Other inappropriate content'
    ],
    fake_profile: [
      'Using someone else\'s photos',
      'False personal information',
      'Impersonation',
      'Other fake profile issues'
    ],
    threatening_behavior: [
      'Threats of violence',
      'Threats of harm',
      'Intimidation',
      'Other threatening behavior'
    ],
    hate_speech: [
      'Racial discrimination',
      'Religious discrimination',
      'Gender discrimination',
      'LGBTQ+ discrimination',
      'Other hate speech'
    ],
    scam: [
      'Financial scam',
      'Romance scam',
      'Identity theft attempt',
      'Other scam'
    ],
    underage: [
      'Profile indicates under 18',
      'Behavior suggests underage',
      'Other age-related concern'
    ],
    other: [
      'Privacy violation',
      'Platform misuse',
      'Other safety concern'
    ]
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Shield className="h-5 w-5 text-goldenrod" />
            User Safety Actions
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Take action regarding {userName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!activeAction && (
            <div className="grid gap-4">
              <Button
                onClick={() => setActiveAction('block')}
                variant="outline"
                className="w-full justify-start text-left border-red-500/30 text-red-400 hover:bg-red-500/10"
                disabled={isBlocked}
              >
                <Ban className="h-4 w-4 mr-2" />
                {isBlocked ? 'User Already Blocked' : 'Block User'}
              </Button>
              
              <Button
                onClick={() => setActiveAction('report')}
                variant="outline"
                className="w-full justify-start text-left border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Report User
              </Button>
            </div>
          )}

          {activeAction === 'block' && (
            <div className="space-y-4">
              <div className="text-sm text-gray-300">
                <p className="font-medium mb-2">Block {userName}?</p>
                <p className="text-xs text-gray-400">
                  They won't be able to message you or see your profile. This action can be undone later.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="block-reason" className="text-gray-300">
                  Reason (Optional)
                </Label>
                <Input
                  id="block-reason"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Why are you blocking this user?"
                  className="bg-charcoal-gray border-gray-600 text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => setActiveAction(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBlock}
                  disabled={loading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {loading ? 'Blocking...' : 'Block User'}
                </Button>
              </div>
            </div>
          )}

          {activeAction === 'report' && (
            <div className="space-y-4">
              <div className="text-sm text-gray-300">
                <p className="font-medium mb-2">Report {userName}</p>
                <p className="text-xs text-gray-400">
                  Help us keep MonArk safe by reporting inappropriate behavior.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger className="bg-charcoal-gray border-gray-600 text-white">
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {reportType && (
                <div className="space-y-2">
                  <Label className="text-gray-300">Specific Reason</Label>
                  <Select value={reportReason} onValueChange={setReportReason}>
                    <SelectTrigger className="bg-charcoal-gray border-gray-600 text-white">
                      <SelectValue placeholder="Select specific reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {reportReasons[reportType as keyof typeof reportReasons]?.map((reason) => (
                        <SelectItem key={reason} value={reason}>
                          {reason}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="report-description" className="text-gray-300">
                  Additional Details (Optional)
                </Label>
                <Textarea
                  id="report-description"
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Provide additional context..."
                  className="bg-charcoal-gray border-gray-600 text-white"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => setActiveAction(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReport}
                  disabled={loading || !reportType || !reportReason}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {loading ? 'Reporting...' : 'Submit Report'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};