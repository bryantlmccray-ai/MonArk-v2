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
  const tabs = [
    { id: 'weekly', icon: Calendar, label: 'Your 3 Options' },
    { id: 'matches', icon: MessageCircle, label: 'Connections' },
    { id: 'dates', icon: BookOpen, label: 'Journal' },
    { id: 'shareables', icon: Share2, label: 'MonArk Shareables' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="border-b border-border p-6">
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
                      className={`w-full justify-start transition-all duration-200 rounded-xl ${
                        isActive 
                          ? 'text-primary bg-primary/10' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
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
