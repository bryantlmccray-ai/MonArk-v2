import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Heart, Settings, LogOut } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { MonArkLogo } from '@/components/MonArkLogo';

interface AuthenticatedNavProps {
  onSignOut: () => void;
  onNavigate?: (section: string) => void;
}

export const AuthenticatedNav: React.FC<AuthenticatedNavProps> = ({ onSignOut, onNavigate }) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const displayName = profile?.bio?.split(' ')[0] || user?.email?.split('@')[0] || 'Member';
  const avatarUrl = profile?.photos?.[0] || null;
  const initials = displayName.slice(0, 2).toUpperCase();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const menuItems = [
    { label: 'My Profile', icon: User, action: () => onNavigate?.('profile') },
    { label: 'My Matches', icon: Heart, action: () => onNavigate?.('matches') },
    { label: 'Settings', icon: Settings, action: () => onNavigate?.('settings') },
  ];

  return (
    <header className="px-6 pt-6 pb-4 flex items-center justify-between">
      <MonArkLogo size="sm" />

      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 group"
          aria-label="User menu"
        >
          <Avatar className="h-9 w-9 border-2 border-[hsl(30_40%_72%/0.4)] group-hover:border-[hsl(30_40%_72%)] transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.25)]">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={displayName} className="object-cover" />
            ) : null}
            <AvatarFallback className="bg-[hsl(230_18%_22%)] text-[hsl(30_40%_72%)] font-caption text-xs tracking-wider">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-12 w-52 bg-[hsl(230_18%_18%)] border border-[hsl(230_18%_28%)] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden z-50"
            >
              {/* User info */}
              <div className="px-4 py-3 border-b border-[hsl(230_18%_26%)]">
                <p className="font-editorial text-sm text-[hsl(30_40%_85%)] truncate">{displayName}</p>
                <p className="text-[10px] font-body text-[hsl(240_6%_50%)] truncate">{user?.email}</p>
              </div>

              {/* Menu items */}
              <div className="py-1">
                {menuItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => { setOpen(false); item.action(); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-body text-[hsl(30_40%_80%)] hover:bg-[hsl(230_18%_22%)] transition-colors"
                  >
                    <item.icon className="w-4 h-4 text-[hsl(30_40%_72%)]" />
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Sign out */}
              <div className="border-t border-[hsl(230_18%_26%)] py-1">
                <button
                  onClick={() => { setOpen(false); onSignOut(); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-body text-[hsl(0_60%_65%)] hover:bg-[hsl(230_18%_22%)] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};
