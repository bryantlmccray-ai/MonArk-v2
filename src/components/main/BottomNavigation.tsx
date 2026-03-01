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
    <div className="fixed bottom-0 left-0 right-0 bg-card/98 backdrop-blur-2xl border-t border-border/60 safe-area-pb z-50" style={{ boxShadow: '0 -4px 24px rgba(90, 70, 50, 0.08)' }}>
      <div className="flex justify-around items-center py-2.5 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center p-2 min-w-0 transition-all duration-300 rounded-xl ${
                isActive 
                  ? 'text-primary scale-105' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="relative">
                {isActive && (
                  <div className="absolute -inset-2.5 bg-primary/12 rounded-full" style={{ boxShadow: '0 0 12px hsl(var(--primary) / 0.15)' }} />
                )}
                <Icon className={`h-5 w-5 mb-1 relative transition-all duration-300 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`} />
              </div>
              <span className={`text-[10px] leading-tight text-center tracking-wide ${isActive ? 'font-bold' : 'font-medium'}`}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
