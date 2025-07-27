import React from 'react';
import { User, Map, MessageCircle, Users, BookOpen } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { MonArkLogo } from '../MonArkLogo';

interface SidebarNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onArkNavigation?: () => void;
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ activeTab, onTabChange, onArkNavigation }) => {
  const tabs = [
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'matches', icon: MessageCircle, label: 'Connections' },
    { id: 'discover', icon: Map, label: 'Discover' },
    { id: 'dates', icon: BookOpen, label: 'Dates & Journal' },
    { id: 'circle', icon: Users, label: 'Circle' },
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