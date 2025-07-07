
import React from 'react';
import { User, Map, MessageCircle, Users, BookOpen } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'matches', icon: MessageCircle, label: 'Connections' },
    { id: 'dates', icon: BookOpen, label: 'Dates & Journal' },
    { id: 'discover', icon: Map, label: 'Discover' },
    { id: 'circle', icon: Users, label: 'Circle' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-charcoal-gray/95 backdrop-blur-xl border-t border-gray-800 safe-area-pb">
      <div className="flex justify-around items-center py-4 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center p-2 min-w-0 transition-colors ${
                isActive 
                  ? 'text-goldenrod' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="h-7 w-7 mb-2" />
              <span className="text-xs font-medium leading-tight text-center">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
