import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  Mail, 
  Heart, 
  MessageCircle, 
  Calendar, 
  Shield,
  Settings,
  Lightbulb
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

interface NotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  isOpen,
  onClose
}) => {
  const { preferences, updatePreferences, loading } = useNotifications();

  if (!preferences) return null;

  const handleToggle = (key: keyof typeof preferences, value: boolean) => {
    updatePreferences({ [key]: value });
  };

  const settingSections = [
    {
      title: 'Delivery Methods',
      description: 'Choose how you want to receive notifications',
      settings: [
        {
          key: 'push_enabled' as const,
          label: 'Push Notifications',
          description: 'Receive notifications in your browser',
          icon: Bell,
          value: preferences.push_enabled
        },
        {
          key: 'email_enabled' as const,
          label: 'Email Notifications',
          description: 'Receive important updates via email',
          icon: Mail,
          value: preferences.email_enabled
        }
      ]
    },
    {
      title: 'Dating Activity',
      description: 'Get notified about your dating interactions',
      settings: [
        {
          key: 'new_matches' as const,
          label: 'New Matches',
          description: 'When someone likes you back',
          icon: Heart,
          value: preferences.new_matches
        },
        {
          key: 'new_messages' as const,
          label: 'New Messages',
          description: 'When you receive a message',
          icon: MessageCircle,
          value: preferences.new_messages
        },
        {
          key: 'date_proposals' as const,
          label: 'Date Proposals',
          description: 'When someone suggests a date',
          icon: Calendar,
          value: preferences.date_proposals
        },
        {
          key: 'date_reminders' as const,
          label: 'Date Reminders',
          description: 'Reminders about upcoming dates',
          icon: Calendar,
          value: preferences.date_reminders
        }
      ]
    },
    {
      title: 'Personal Growth',
      description: 'Insights and recommendations for your dating journey',
      settings: [
        {
          key: 'rif_insights' as const,
          label: 'RIF Insights',
          description: 'Personalized insights about your dating patterns',
          icon: Lightbulb,
          value: preferences.rif_insights
        }
      ]
    },
    {
      title: 'Safety & System',
      description: 'Important alerts and updates',
      settings: [
        {
          key: 'safety_alerts' as const,
          label: 'Safety Alerts',
          description: 'Important safety and security notifications',
          icon: Shield,
          value: preferences.safety_alerts
        },
        {
          key: 'system_updates' as const,
          label: 'System Updates',
          description: 'App updates and maintenance notifications',
          icon: Settings,
          value: preferences.system_updates
        }
      ]
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Bell className="h-5 w-5 text-goldenrod" />
            Notification Settings
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Customize when and how you receive notifications
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 max-h-[600px] overflow-y-auto">
          {settingSections.map((section, sectionIndex) => (
            <div key={section.title} className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-white">{section.title}</h3>
                <p className="text-sm text-gray-400">{section.description}</p>
              </div>

              <div className="space-y-4">
                {section.settings.map((setting) => (
                  <div
                    key={setting.key}
                    className="flex items-center justify-between p-4 bg-charcoal-gray/30 rounded-lg border border-gray-700"
                  >
                    <div className="flex items-center space-x-3">
                      <setting.icon className="h-5 w-5 text-goldenrod" />
                      <div>
                        <Label htmlFor={setting.key} className="text-white font-medium">
                          {setting.label}
                        </Label>
                        <p className="text-sm text-gray-400 mt-1">
                          {setting.description}
                        </p>
                      </div>
                    </div>
                    
                    <Switch
                      id={setting.key}
                      checked={setting.value}
                      onCheckedChange={(checked) => handleToggle(setting.key, checked)}
                      disabled={loading}
                    />
                  </div>
                ))}
              </div>

              {sectionIndex < settingSections.length - 1 && (
                <Separator className="bg-gray-700" />
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-700">
          <div className="text-xs text-gray-500">
            <p>• Some notifications may still be sent for security reasons</p>
            <p>• Changes are saved automatically</p>
          </div>
          
          <Button onClick={onClose} variant="outline">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};