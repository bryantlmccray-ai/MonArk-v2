
import React from 'react';
import { User, Map, MessageCircle, Users, BookOpen } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'discover', icon: Map, label: 'Discover' },
    { id: 'matches', icon: MessageCircle, label: 'Matches' },
    { id: 'circle', icon: Users, label: 'Circle' },
    { id: 'dates', icon: BookOpen, label: 'Dates' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-charcoal-gray/95 backdrop-blur-xl border-t border-gray-800">
      <div className="flex justify-around items-center py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center p-3 transition-colors ${
                isActive 
                  ? 'text-goldenrod' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="h-6 w-6 mb-1" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
