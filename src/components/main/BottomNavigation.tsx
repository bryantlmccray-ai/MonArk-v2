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
    { id: 'shareables', icon: Share2, label: 'Milestones' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/98 backdrop-blur-2xl border-t border-border/50 safe-area-pb z-50" style={{ boxShadow: '0 -2px 12px rgba(100, 80, 60, 0.05)' }}>
      <div className="flex justify-around items-center py-1.5 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-2 px-3 min-w-[56px] rounded-xl transition-all duration-200 ease-out active:scale-[0.92] ${
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground/60 hover:text-muted-foreground'
              }`}
            >
              <div className="relative mb-1">
                {isActive && (
                  <div className="absolute -inset-1.5 bg-primary/10 rounded-lg" />
                )}
                <Icon className={`h-5 w-5 relative transition-all duration-200 ${isActive ? 'stroke-[2.4px]' : 'stroke-[1.5px]'}`} />
              </div>
              <span className={`text-[10px] leading-none tracking-wide ${isActive ? 'font-semibold' : 'font-medium opacity-80'}`}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
