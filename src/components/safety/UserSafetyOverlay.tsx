import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Ban, 
  AlertTriangle, 
  Phone,
  X,
  ExternalLink
} from 'lucide-react';
import { useUserSafety } from '@/hooks/useUserSafety';
import { SafetySettingsModal } from './SafetySettingsModal';
import { BlockedUsersModal } from './BlockedUsersModal';
import { format } from 'date-fns';

interface UserSafetyOverlayProps {
  onClose: () => void;
}

export const UserSafetyOverlay: React.FC<UserSafetyOverlayProps> = ({ onClose }) => {
  const { blockedUsers, userReports } = useUserSafety();
  const [showSafetySettings, setShowSafetySettings] = useState(false);
  const [showBlockedUsers, setShowBlockedUsers] = useState(false);

  const getReportStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'resolved':
        return 'bg-green-500/20 text-green-400';
      case 'dismissed':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-blue-500/20 text-blue-400';
    }
  };

  const emergencyResources = [
    {
      name: 'Crisis Text Line',
      number: 'Text HOME to 741741',
      description: 'Free 24/7 support via text'
    },
    {
      name: 'National DV Hotline',
      number: '1-800-799-7233',
      description: '24/7 domestic violence support'
    }
  ];

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="min-h-screen p-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-semibold text-foreground">Safety Center</h1>
                <p className="text-muted-foreground text-sm">Your safety tools</p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={() => setShowSafetySettings(true)}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Privacy & Emergency Contacts
                </Button>
                
                <Button
                  onClick={() => setShowBlockedUsers(true)}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Blocked Users ({blockedUsers.length})
                </Button>
              </CardContent>
            </Card>

            {/* Your Reports */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Your Reports</CardTitle>
                <CardDescription>
                  Reports you've submitted
                </CardDescription>
              </CardHeader>
              <CardContent>
                {userReports.length === 0 ? (
                  <div className="text-center py-6">
                    <AlertTriangle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">No reports submitted</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userReports.slice(0, 5).map((report) => (
                      <div
                        key={report.id}
                        className="border rounded-lg p-3"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <Badge className={getReportStatusColor(report.status)}>
                            {report.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(report.created_at), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <p className="text-sm font-medium">
                          {report.report_type.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-muted-foreground">{report.reason}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Emergency Resources */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Emergency Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {emergencyResources.map((resource, index) => (
                  <div key={index} className="text-sm">
                    <p className="font-medium">{resource.name}</p>
                    <p className="text-primary font-mono">{resource.number}</p>
                    <p className="text-xs text-muted-foreground">{resource.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Safety Tips */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Safety Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Meet in public places for first dates</p>
                <p>• Share your plans with a friend</p>
                <p>• Trust your instincts</p>
                <p>• Block and report uncomfortable behavior</p>
              </CardContent>
            </Card>

            {/* Legal Links */}
            <div className="flex gap-4 justify-center text-sm">
              <a href="/terms" className="text-primary hover:underline flex items-center gap-1">
                Terms <ExternalLink className="h-3 w-3" />
              </a>
              <a href="/privacy" className="text-primary hover:underline flex items-center gap-1">
                Privacy <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <SafetySettingsModal
        isOpen={showSafetySettings}
        onClose={() => setShowSafetySettings(false)}
      />
      
      <BlockedUsersModal
        isOpen={showBlockedUsers}
        onClose={() => setShowBlockedUsers(false)}
      />
    </div>
  );
};