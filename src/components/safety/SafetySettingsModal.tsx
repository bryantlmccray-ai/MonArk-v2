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
import { Shield, MapPin, Eye, Phone, Plus, Trash2 } from 'lucide-react';
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
  });
  const [emergencyContact, setEmergencyContact] = useState('');
  const [emergencyContacts, setEmergencyContacts] = useState<string[]>([]);

  useEffect(() => {
    if (safetySettings) {
      setSettings({
        location_sharing_enabled: safetySettings.location_sharing_enabled,
        show_online_status: safetySettings.show_online_status,
      });
      
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
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Shield className="h-5 w-5 text-primary" />
            Safety Settings
          </DialogTitle>
          <DialogDescription>
            Manage your privacy and emergency contacts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Privacy Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Privacy
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    Location Sharing
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Show general location to matches
                  </p>
                </div>
                <Switch
                  checked={settings.location_sharing_enabled}
                  onCheckedChange={(checked) => handleSettingChange('location_sharing_enabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm">Show Online Status</Label>
                  <p className="text-xs text-muted-foreground">
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

          <Separator />

          {/* Emergency Contacts */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Emergency Contacts
            </h3>
            
            <p className="text-xs text-muted-foreground">
              Add contacts who can receive your date plans
            </p>

            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="Phone number or email"
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && addEmergencyContact()}
                />
                <Button
                  onClick={addEmergencyContact}
                  variant="outline"
                  size="icon"
                  disabled={!emergencyContact.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {emergencyContacts.length > 0 && (
                <div className="space-y-2">
                  {emergencyContacts.map((contact, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-muted/50 p-3 rounded-lg"
                    >
                      <span className="text-sm">{contact}</span>
                      <Button
                        onClick={() => removeEmergencyContact(contact)}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {emergencyContacts.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4 bg-muted/30 rounded-lg">
                  No emergency contacts added yet
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-2">
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
              className="flex-1"
            >
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};