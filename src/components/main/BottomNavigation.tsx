import React from 'react';
import { User, MessageCircle, BookOpen, Calendar, Compass, Brain } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface BottomNavigationProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

// Lightweight hook — just counts unread in-app notifications + new pending matches
function useNavBadges() {
    const { user } = useAuth();

  const { data: unreadCount = 0 } = useQuery({
        queryKey: ['nav-unread', user?.id],
        queryFn: async () => {
                if (!user?.id) return 0;
                const { count } = await supabase
                  .from('notifications')
                  .select('*', { count: 'exact', head: true })
                  .eq('user_id', user.id)
                  .eq('is_read', false);
                return count ?? 0;
        },
        enabled: !!user?.id,
        refetchInterval: 60_000,
        staleTime: 30_000,
  });

  const { data: newMatchCount = 0 } = useQuery({
        queryKey: ['nav-new-matches', user?.id],
        queryFn: async () => {
                if (!user?.id) return 0;
                const now = new Date();
                const dayOfWeek = now.getDay();
                const diff = now.getDate() - dayOfWeek;
                const weekStart = new Date(now.setDate(diff));
                weekStart.setHours(0, 0, 0, 0);
                const { count } = await supabase
                  .from('curated_matches' as any)
                  .select('*', { count: 'exact', head: true })
                  .eq('user_id', user.id)
                  .eq('status', 'pending')
                  .gte('created_at', weekStart.toISOString());
                return count ?? 0;
        },
        enabled: !!user?.id,
        refetchInterval: 60_000,
        staleTime: 30_000,
  });

  return { unreadCount, newMatchCount };
}

function NavBadge({ count, color = 'bg-primary' }: { count: number; color?: string }) {
    if (count <= 0) return null;
    return (
          <span
                  className={`absolute -top-1 -right-1 min-w-[16px] h-4 px-0.5 ${color} text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center leading-none ring-2 ring-card`}
                >
            {count > 9 ? '9+' : count}
          </span>span>
        );
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange }) => {
    const { unreadCount, newMatchCount } = useNavBadges();
  
    // 6 tabs — aligned with desktop sidebar
    const tabs = [
      { id: 'weekly',   icon: Calendar,      label: 'Your 3',     badge: newMatchCount },
      { id: 'discover', icon: Compass,       label: 'Discover',   badge: 0 },
      { id: 'matches',  icon: MessageCircle, label: 'Chats',      badge: unreadCount },
      { id: 'dates',    icon: BookOpen,      label: 'Journal',    badge: 0 },
      { id: 'rif',      icon: Brain,         label: 'Relational', badge: 0 },
      { id: 'profile',  icon: User,          label: 'Profile',    badge: 0 },
        ];
         
    return (
          <div
                  className="fixed bottom-0 left-0 right-0 bg-card/98 backdrop-blur-2xl border-t border-border/50 safe-area-pb z-50"
                  style={{ boxShadow: '0 -2px 12px rgba(100, 80, 60, 0.05)' }}
                >
                <div className="flex justify-around items-center py-1.5 px-1">
                  {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                          <button
                                                          key={tab.id}
                                                          onClick={() => onTabChange(tab.id)}
                                                          className={`flex flex-col items-center justify-center py-2 px-2 min-w-[48px] rounded-xl transition-all duration-200 ease-out active:scale-[0.92] ${
                                                                            isActive
                                                                              ? 'text-primary'
                                                                              : 'text-muted-foreground/60 hover:text-muted-foreground'
                                                          }`}
                                                        >
                                                        <div className="relative mb-1">
                                                          {isActive && (
                                                                            <div className="absolute -inset-1.5 bg-primary/10 rounded-lg" />
                                                                          )}
                                                                        <Icon
                                                                                            className={`h-5 w-5 relative transition-all duration-200 ${isActive ? 'stroke-[2.4px]' : 'stroke-[1.5px]'}`}
                                                                                          />
                                                                        <NavBadge count={tab.badge} />
                                                        </div>div>
                                                        <span
                                                                          className={`text-[9px] leading-none tracking-wide ${isActive ? 'font-semibold' : 'font-medium opacity-80'}`}
                                                                        >
                                                          {tab.label}
                                                        </span>span>
                                          </button>button>
                                        );
                })}
                </div>div>
          </div>div>
        );
};</span>
