
import React from 'react';
import { X, User, Bell, Shield, Heart, Pause } from 'lucide-react';

interface SettingsOverlayProps {
  onClose: () => void;
}

export const SettingsOverlay: React.FC<SettingsOverlayProps> = ({ onClose }) => {
  const settingsItems = [
    { icon: User, label: 'Edit Profile', action: () => {} },
    { icon: Bell, label: 'Notifications', action: () => {} },
    { icon: Shield, label: 'Privacy & Safety', action: () => {} },
    { icon: Heart, label: 'Matching Preferences', action: () => {} },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-jet-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-charcoal-gray rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-700 animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {settingsItems.map((item, index) => (
            <button
              key={index}
              onClick={item.action}
              className="w-full flex items-center space-x-3 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <item.icon className="h-5 w-5 text-gray-400" />
              <span className="text-white font-medium">{item.label}</span>
            </button>
          ))}

          <div className="mt-8 pt-6 border-t border-gray-700">
            <button className="w-full flex items-center justify-center space-x-2 p-4 bg-orange-900/20 text-orange-400 rounded-lg hover:bg-orange-900/30 transition-colors">
              <Pause className="h-5 w-5" />
              <span>Ready to take a break?</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
