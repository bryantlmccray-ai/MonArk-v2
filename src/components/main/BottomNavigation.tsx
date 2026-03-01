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
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border/40 safe-area-pb z-50" style={{ boxShadow: '0 -1px 8px rgba(100, 80, 60, 0.06)' }}>
      <div className="flex justify-around items-center py-2 px-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 min-w-0 rounded-xl transition-all duration-200 ease-out active:scale-95 ${
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground/70 hover:text-muted-foreground'
              }`}
            >
              <div className="relative mb-0.5">
                {isActive && (
                  <div className="absolute -inset-2 bg-primary/8 rounded-full" />
                )}
                <Icon className={`h-[22px] w-[22px] relative transition-all duration-200 ${isActive ? 'stroke-[2.2px]' : 'stroke-[1.6px]'}`} />
              </div>
              <span className={`text-[10px] leading-none tracking-wide ${isActive ? 'font-semibold' : 'font-medium'}`}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
