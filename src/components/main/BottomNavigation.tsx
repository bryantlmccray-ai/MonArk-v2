import React from 'react';
import { User, MessageCircle, BookOpen, Calendar, Share2 } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'weekly', icon: Calendar, label: 'Your 3' },
    { id: 'matches', icon: MessageCircle, label: 'Chats' },
    { id: 'dates', icon: BookOpen, label: 'Journal' },
    { id: 'shareables', icon: Share2, label: 'Shareables' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border safe-area-pb z-50">
      <div className="flex justify-around items-center py-3 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center p-2 min-w-0 transition-all duration-200 rounded-xl ${
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className={`relative ${isActive ? '' : ''}`}>
                {isActive && (
                  <div className="absolute -inset-2 bg-primary/10 rounded-full" />
                )}
                <Icon className={`h-6 w-6 mb-1.5 relative ${isActive ? 'drop-shadow-[0_0_6px_hsl(var(--primary)/0.4)]' : ''}`} />
              </div>
              <span className={`text-[11px] font-medium leading-tight text-center ${isActive ? 'font-semibold' : ''}`}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
