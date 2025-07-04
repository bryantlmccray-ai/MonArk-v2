import React, { useState, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Shield, MapPin, Users, MessageCircle, Eye, Phone } from 'lucide-react';
import { useUserSafety } from '@/hooks/useUserSafety';

interface SafetySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SafetySettingsModal: React.FC<SafetySettingsModalProps> = ({
  isOpen,
  onClose
}) => {
  const { safetySettings, updateSafetySettings, loading } = useUserSafety();
  const [settings, setSettings] = useState({
    location_sharing_enabled: true,
    show_online_status: true,
    allow_messages_from_strangers: true,
    require_mutual_match_for_messaging: false,
    auto_decline_inappropriate_content: true,
  });
  const [emergencyContact, setEmergencyContact] = useState('');
  const [emergencyContacts, setEmergencyContacts] = useState<string[]>([]);

  useEffect(() => {
    if (safetySettings) {
      setSettings({
        location_sharing_enabled: safetySettings.location_sharing_enabled,
        show_online_status: safetySettings.show_online_status,
        allow_messages_from_strangers: safetySettings.allow_messages_from_strangers,
        require_mutual_match_for_messaging: safetySettings.require_mutual_match_for_messaging,
        auto_decline_inappropriate_content: safetySettings.auto_decline_inappropriate_content,
      });
      
      // Parse emergency contacts
      try {
        const contacts = Array.isArray(safetySettings.emergency_contacts) 
          ? safetySettings.emergency_contacts as string[]
          : [];
        setEmergencyContacts(contacts);
      } catch (error) {
        console.error('Error parsing emergency contacts:', error);
        setEmergencyContacts([]);
      }
    }
  }, [safetySettings]);

  const handleSettingChange = (key: keyof typeof settings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const addEmergencyContact = () => {
    if (emergencyContact.trim() && !emergencyContacts.includes(emergencyContact.trim())) {
      setEmergencyContacts(prev => [...prev, emergencyContact.trim()]);
      setEmergencyContact('');
    }
  };

  const removeEmergencyContact = (contact: string) => {
    setEmergencyContacts(prev => prev.filter(c => c !== contact));
  };

  const handleSave = async () => {
    const success = await updateSafetySettings({
      ...settings,
      emergency_contacts: emergencyContacts
    });
    
    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Shield className="h-5 w-5 text-goldenrod" />
            Safety & Privacy Settings
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Manage your privacy and safety preferences
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Privacy Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Privacy
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-gray-300 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location Sharing
                  </Label>
                  <p className="text-xs text-gray-400">
                    Allow others to see your general location
                  </p>
                </div>
                <Switch
                  checked={settings.location_sharing_enabled}
                  onCheckedChange={(checked) => handleSettingChange('location_sharing_enabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-gray-300 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Show Online Status
                  </Label>
                  <p className="text-xs text-gray-400">
                    Let others see when you're active
                  </p>
                </div>
                <Switch
                  checked={settings.show_online_status}
                  onCheckedChange={(checked) => handleSettingChange('show_online_status', checked)}
                />
              </div>
            </div>
          </div>

          <Separator className="bg-gray-600" />

          {/* Messaging Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Messaging
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-gray-300">Allow Messages from Anyone</Label>
                  <p className="text-xs text-gray-400">
                    Receive messages from users you haven't matched with
                  </p>
                </div>
                <Switch
                  checked={settings.allow_messages_from_strangers}
                  onCheckedChange={(checked) => handleSettingChange('allow_messages_from_strangers', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-gray-300">Require Mutual Match</Label>
                  <p className="text-xs text-gray-400">
                    Only allow messaging after both users have liked each other
                  </p>
                </div>
                <Switch
                  checked={settings.require_mutual_match_for_messaging}
                  onCheckedChange={(checked) => handleSettingChange('require_mutual_match_for_messaging', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-gray-300">Auto-decline Inappropriate Content</Label>
                  <p className="text-xs text-gray-400">
                    Automatically filter potentially inappropriate messages
                  </p>
                </div>
                <Switch
                  checked={settings.auto_decline_inappropriate_content}
                  onCheckedChange={(checked) => handleSettingChange('auto_decline_inappropriate_content', checked)}
                />
              </div>
            </div>
          </div>

          <Separator className="bg-gray-600" />

          {/* Emergency Contacts */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Emergency Contacts
            </h3>
            
            <p className="text-sm text-gray-400">
              Add trusted contacts who can be notified in case of emergency
            </p>

            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="Email or phone number"
                  className="bg-charcoal-gray border-gray-600 text-white"
                  onKeyPress={(e) => e.key === 'Enter' && addEmergencyContact()}
                />
                <Button
                  onClick={addEmergencyContact}
                  variant="outline"
                  disabled={!emergencyContact.trim()}
                >
                  Add
                </Button>
              </div>

              {emergencyContacts.length > 0 && (
                <div className="space-y-2">
                  {emergencyContacts.map((contact, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-charcoal-gray/50 p-2 rounded"
                    >
                      <span className="text-gray-300">{contact}</span>
                      <Button
                        onClick={() => removeEmergencyContact(contact)}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Separator className="bg-gray-600" />

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 bg-goldenrod-gradient text-jet-black font-medium hover:shadow-golden-glow"
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};