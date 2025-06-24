
import React from 'react';
import { Flame, Users, MessageCircle, CalendarDays, User } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'discover', icon: Flame, label: 'Discover' },
    { id: 'circle', icon: Users, label: 'Circle' },
    { id: 'matches', icon: MessageCircle, label: 'Matches' },
    { id: 'dates', icon: CalendarDays, label: 'Dates' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="mx-4 mb-6">
        <div className="bg-gradient-to-t from-jet-black/90 to-charcoal-gray/90 backdrop-blur-xl rounded-2xl px-4 py-3 glass-morphism border border-gray-800">
          <div className="flex justify-around items-center">
            {tabs.map(({ id, icon: Icon }) => (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  activeTab === id
                    ? 'text-goldenrod shadow-glow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon 
                  className="h-6 w-6" 
                  strokeWidth={activeTab === id ? 2.5 : 2}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};
