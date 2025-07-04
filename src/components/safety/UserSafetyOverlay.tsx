import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  Ban, 
  AlertTriangle, 
  Settings, 
  FileText, 
  Phone,
  Eye,
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
  const { blockedUsers, userReports, safetySettings } = useUserSafety();
  const [showSafetySettings, setShowSafetySettings] = useState(false);
  const [showBlockedUsers, setShowBlockedUsers] = useState(false);

  const getReportStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'resolved':
        return 'bg-green-500/20 text-green-400';
      case 'dismissed':
        return 'bg-gray-500/20 text-gray-400';
      default:
        return 'bg-blue-500/20 text-blue-400';
    }
  };

  const emergencyResources = [
    {
      name: 'National Suicide Prevention Lifeline',
      number: '988',
      description: '24/7 crisis support'
    },
    {
      name: 'Crisis Text Line',
      number: 'Text HOME to 741741',
      description: 'Free 24/7 crisis support via text'
    },
    {
      name: 'National Domestic Violence Hotline',
      number: '1-800-799-7233',
      description: '24/7 support for domestic violence'
    }
  ];

  return (
    <div className="fixed inset-0 bg-jet-black z-50 overflow-y-auto">
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-goldenrod" />
              <div>
                <h1 className="text-3xl font-light text-white">Safety Center</h1>
                <p className="text-gray-400">Manage your safety and privacy settings</p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Actions */}
              <Card className="bg-charcoal-gray/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Settings className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => setShowSafetySettings(true)}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Privacy & Safety Settings
                  </Button>
                  
                  <Button
                    onClick={() => setShowBlockedUsers(true)}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    Manage Blocked Users ({blockedUsers.length})
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Reports */}
              <Card className="bg-charcoal-gray/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <FileText className="h-5 w-5" />
                    Your Reports
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Reports you've submitted to our safety team
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {userReports.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertTriangle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">No reports submitted</p>
                      <p className="text-sm text-gray-500">
                        Your safety reports will appear here
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userReports.slice(0, 5).map((report) => (
                        <div
                          key={report.id}
                          className="border border-gray-700 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Badge className={getReportStatusColor(report.status)}>
                              {report.status}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {format(new Date(report.created_at), 'MMM d, yyyy')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300 mb-1">
                            <span className="font-medium">{report.report_type.replace('_', ' ')}</span>
                          </p>
                          <p className="text-xs text-gray-400">{report.reason}</p>
                        </div>
                      ))}
                      {userReports.length > 5 && (
                        <p className="text-xs text-gray-500 text-center">
                          And {userReports.length - 5} more reports...
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Safety Tips */}
              <Card className="bg-charcoal-gray/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Safety Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-300">
                  <div className="flex items-start gap-2">
                    <Eye className="h-4 w-4 mt-0.5 text-goldenrod flex-shrink-0" />
                    <p>Meet in public places for first dates and tell a friend your plans</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Shield className="h-4 w-4 mt-0.5 text-goldenrod flex-shrink-0" />
                    <p>Trust your instincts - if something feels wrong, it probably is</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Ban className="h-4 w-4 mt-0.5 text-goldenrod flex-shrink-0" />
                    <p>Block and report users who make you uncomfortable</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 mt-0.5 text-goldenrod flex-shrink-0" />
                    <p>Keep personal information private until you build trust</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Current Settings Overview */}
              <Card className="bg-charcoal-gray/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Privacy Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Location Sharing</span>
                    <span className={safetySettings?.location_sharing_enabled ? 'text-green-400' : 'text-red-400'}>
                      {safetySettings?.location_sharing_enabled ? 'On' : 'Off'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Online Status</span>
                    <span className={safetySettings?.show_online_status ? 'text-green-400' : 'text-red-400'}>
                      {safetySettings?.show_online_status ? 'Visible' : 'Hidden'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Stranger Messages</span>
                    <span className={safetySettings?.allow_messages_from_strangers ? 'text-green-400' : 'text-red-400'}>
                      {safetySettings?.allow_messages_from_strangers ? 'Allowed' : 'Blocked'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Resources */}
              <Card className="bg-charcoal-gray/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Emergency Resources
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {emergencyResources.map((resource, index) => (
                    <div key={index} className="text-xs">
                      <p className="text-white font-medium">{resource.name}</p>
                      <p className="text-goldenrod font-mono">{resource.number}</p>
                      <p className="text-gray-400">{resource.description}</p>
                    </div>
                  ))}
                  <Separator className="bg-gray-600" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-goldenrod hover:text-goldenrod/80 p-0 h-auto"
                  >
                    View More Resources
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </CardContent>
              </Card>
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