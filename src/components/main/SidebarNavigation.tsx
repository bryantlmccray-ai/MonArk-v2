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
import monarkLogoHorizontal from '@/assets/monark-logo-horizontal.png';

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
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-6">
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
                      className={`w-full justify-start transition-all duration-300 rounded-xl ${
                        isActive 
                          ? 'text-sidebar-primary bg-sidebar-accent font-semibold' 
                          : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                      }`}
                    >
                      <Icon className={`h-5 w-5 transition-all duration-300 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`} />
                      <span className="tracking-wide">{tab.label}</span>
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
