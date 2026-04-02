import React from 'react';
import { User, MessageCircle, BookOpen, Calendar, Share2, Crown } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
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

interface SidebarNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onArkNavigation?: () => void;
  onUpgrade?: () => void;
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ activeTab, onTabChange, onArkNavigation, onUpgrade }) => {
  const { profile } = useProfile();
  const displayName = profile?.first_name || 'Member';

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
        <div className="flex flex-col items-center gap-2">
          <div 
            className="h-14 w-14 rounded-full ring-2 ring-primary cursor-pointer hover:opacity-80 transition-opacity duration-300 flex items-center justify-center"
            onClick={() => onTabChange('profile')}
          >
            <img 
              src="/lovable-uploads/e11ccc80-2237-4aac-b579-dccb89f8d727.png" 
              alt="MonArk — Date well."
              className="h-12 w-12 object-contain rounded-full"
            />
          </div>
          <span className="text-xs font-medium text-sidebar-foreground/80 tracking-wide">{displayName}</span>
          <span className="text-[10px] font-caption tracking-[0.12em] text-primary/70 bg-primary/10 px-2.5 py-0.5 rounded-full">
            Free
          </span>
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

        {/* Upgrade Button */}
        {onUpgrade && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={onUpgrade}
                    className="w-full justify-start text-primary hover:bg-primary/10 font-semibold transition-all duration-300 rounded-xl"
                  >
                    <Crown className="h-5 w-5 stroke-[2px]" />
                    <span className="tracking-wide">Upgrade</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
};
