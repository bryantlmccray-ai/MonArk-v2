import React from 'react';
import {
  User, MessageCircle, BookOpen, Calendar, Crown, Brain, LogOut, Compass, Navigation
} from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { useRIF } from '@/hooks/useRIF';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from '@/components/ui/sidebar';

interface SidebarNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onArkNavigation?: () => void;
  onUpgrade?: () => void;
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  activeTab,
  onTabChange,
  onArkNavigation,
  onUpgrade,
}) => {
  const { profile } = useProfile();
  const { tierLabel, tier } = useSubscription();
  const { signOut } = useAuth();
  const { rifProfile } = useRIF();

  const displayName = profile?.first_name || 'Member';
  const rifCompleted = !!rifProfile;

  const tabs = [
    { id: 'weekly', icon: Calendar, label: 'Your 3', hasNotification: false },
    { id: 'discover', icon: Navigation, label: 'Discover', hasNotification: false },
    { id: 'matches', icon: MessageCircle, label: 'Connections', hasNotification: true },
    { id: 'dates', icon: BookOpen, label: 'Journal', hasNotification: false },
    {
      id: 'rif',
      icon: Brain,
      label: rifCompleted ? 'Relational Profile' : 'Take RIF Quiz',
      hasNotification: !rifCompleted,
    },
    { id: 'compass', icon: Compass, label: 'Compass', hasNotification: false },
    { id: 'profile', icon: User, label: 'Profile', hasNotification: false },
  ];

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-6">
        <div className="flex flex-col items-center gap-2">
          <div
            className="h-14 w-14 rounded-full ring-2 ring-primary cursor-pointer hover:ring-4 transition-all"
            onClick={() => onTabChange('profile')}
          >
            <span className="font-body font-medium text-base text-[#F0EBE3] tracking-wide">
              {displayName.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <span className="text-xs font-medium text-sidebar-foreground/80 tracking-wide">
            <span className="text-[10px] font-caption tracking-[-0.12em] text-primary/70 bg-primary/10 px-2 py-0.5 rounded-full">
              {tierLabel}
            </span>
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
                      <div className="relative">
                        <Icon
                          className={`h-5 w-5 transition-all duration-300 ${
                            isActive ? 'stroke-[2.5px]' : 'stroke-[1.5px]'
                          }`}
                        />
                        {tab.hasNotification && !isActive && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full" />
                        )}
                      </div>
                      <span className="tracking-wide">{tab.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {onUpgrade && tier !== 'monarch' && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={onUpgrade}
                    className="w-full justify-start font-body font-medium transition-all"
                    style={{ fontWeight: 500 }}
                  >
                    <Crown className="h-5 w-5 stroke-[2px] text-[#F0EBE3]" />
                    <span>Join the Inner Ark</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => signOut()}
              className="w-full justify-start text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-all"
            >
              <LogOut className="h-5 w-5 stroke-[1.5px]" />
              <span className="tracking-wide">Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
