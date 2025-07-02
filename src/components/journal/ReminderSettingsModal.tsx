import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Bell, Clock, Calendar } from 'lucide-react';

interface ReminderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: ReminderSettings) => void;
  currentSettings?: ReminderSettings;
}

export interface ReminderSettings {
  enabled: boolean;
  time: string;
  days: string[];
  message: string;
}

const DAYS_OF_WEEK = [
  { id: 'monday', label: 'Mon' },
  { id: 'tuesday', label: 'Tue' },
  { id: 'wednesday', label: 'Wed' },
  { id: 'thursday', label: 'Thu' },
  { id: 'friday', label: 'Fri' },
  { id: 'saturday', label: 'Sat' },
  { id: 'sunday', label: 'Sun' },
];

const REMINDER_MESSAGES = [
  "Time to reflect on your dating journey! ✨",
  "How was your recent date? Share your thoughts! 💭",
  "Your growth story continues - journal about it! 📝",
  "What did you learn about yourself today? 🌱",
  "Capture today's dating insights! 💡",
];

export const ReminderSettingsModal: React.FC<ReminderSettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentSettings
}) => {
  const [settings, setSettings] = useState<ReminderSettings>(
    currentSettings || {
      enabled: false,
      time: '19:00',
      days: ['monday', 'wednesday', 'friday'],
      message: REMINDER_MESSAGES[0],
    }
  );

  const handleDayToggle = (dayId: string) => {
    setSettings(prev => ({
      ...prev,
      days: prev.days.includes(dayId)
        ? prev.days.filter(d => d !== dayId)
        : [...prev.days, dayId]
    }));
  };

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 7; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = new Date(`2000-01-01T${time}`).toLocaleTimeString([], { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        });
        times.push({ value: time, label: displayTime });
      }
    }
    return times;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-charcoal-gray border-gray-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center space-x-2">
            <Bell className="h-5 w-5 text-goldenrod" />
            <span>Journal Reminders</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white font-medium">Enable Reminders</Label>
              <p className="text-gray-400 text-xs mt-1">Get notified to journal about your dates</p>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(enabled) => setSettings(prev => ({ ...prev, enabled }))}
            />
          </div>

          {settings.enabled && (
            <>
              {/* Time Selection */}
              <div className="space-y-2">
                <Label className="text-white font-medium flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-goldenrod" />
                  <span>Reminder Time</span>
                </Label>
                <Select
                  value={settings.time}
                  onValueChange={(time) => setSettings(prev => ({ ...prev, time }))}
                >
                  <SelectTrigger className="bg-jet-black border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-charcoal-gray border-gray-700 text-white max-h-48">
                    {generateTimeOptions().map(({ value, label }) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Days Selection */}
              <div className="space-y-3">
                <Label className="text-white font-medium flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-goldenrod" />
                  <span>Reminder Days</span>
                </Label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <button
                      key={day.id}
                      onClick={() => handleDayToggle(day.id)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        settings.days.includes(day.id)
                          ? 'bg-goldenrod text-jet-black'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
                {settings.days.length === 0 && (
                  <p className="text-red-400 text-xs">Please select at least one day</p>
                )}
              </div>

              {/* Message Selection */}
              <div className="space-y-3">
                <Label className="text-white font-medium">Reminder Message</Label>
                <div className="space-y-2">
                  {REMINDER_MESSAGES.map((message, index) => (
                    <button
                      key={index}
                      onClick={() => setSettings(prev => ({ ...prev, message }))}
                      className={`w-full p-3 text-left rounded-lg text-sm transition-colors ${
                        settings.message === message
                          ? 'bg-goldenrod/20 border border-goldenrod/30 text-goldenrod'
                          : 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {message}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="bg-jet-black border border-gray-700 rounded-lg p-3">
                <p className="text-gray-400 text-xs mb-2">Preview:</p>
                <div className="flex items-start space-x-2">
                  <Bell className="h-4 w-4 text-goldenrod mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white text-sm">{settings.message}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      {settings.days.map(day => 
                        DAYS_OF_WEEK.find(d => d.id === day)?.label
                      ).join(', ')} at {
                        new Date(`2000-01-01T${settings.time}`).toLocaleTimeString([], { 
                          hour: 'numeric', 
                          minute: '2-digit',
                          hour12: true 
                        })
                      }
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-600 text-gray-300 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={settings.enabled && settings.days.length === 0}
              className="flex-1 bg-goldenrod hover:bg-goldenrod/90 text-jet-black font-semibold"
            >
              Save Reminders
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};