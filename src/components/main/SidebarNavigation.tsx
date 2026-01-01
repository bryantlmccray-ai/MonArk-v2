import React from 'react';
import { User, MessageCircle, BookOpen, Calendar, Share2 } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { MonArkLogo } from '../MonArkLogo';

interface SidebarNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onArkNavigation?: () => void;
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ activeTab, onTabChange, onArkNavigation }) => {
  // MVP: Weekly Options is the main view - no discovery/swiping
  const tabs = [
    { id: 'weekly', icon: Calendar, label: 'Your 3 Options' },
    { id: 'matches', icon: MessageCircle, label: 'Connections' },
    { id: 'dates', icon: BookOpen, label: 'Journal' },
    { id: 'shareables', icon: Share2, label: 'MonArk Shareables' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <Sidebar className="border-r border-gray-800">
      <SidebarHeader className="border-b border-gray-800 p-6">
        <div className="flex items-center justify-center">
          <MonArkLogo 
            clickable={true}
            onClick={onArkNavigation || (() => onTabChange('dates'))}
            variant="compact"
            size="lg"
            rotateOnLoad={true}
          />
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <SidebarMenuItem key={tab.id}>
                    <SidebarMenuButton
                      onClick={() => onTabChange(tab.id)}
                      isActive={isActive}
                      className={`w-full justify-start transition-colors ${
                        isActive 
                          ? 'text-goldenrod bg-goldenrod/10' 
                          : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{tab.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
