
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isDemoMode: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  enterDemoMode: () => void;
  exitDemoMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo user for testing
const DEMO_USER: User = {
  id: 'demo-user-' + Date.now(),
  email: 'demo@monark.test',
  app_metadata: {},
  user_metadata: { name: 'Demo User' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
} as User;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    // Check for demo mode on mount
    const demoMode = localStorage.getItem('monark-demo-mode') === 'true';
    if (demoMode) {
      setIsDemoMode(true);
      setUser(DEMO_USER);
      setLoading(false);
      return;
    }

    let mounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event, session?.user?.id);
        
        try {
          // Update session and user state immediately
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
          
          // Force a state update to ensure UI refreshes
          if (event === 'SIGNED_IN' && session) {
            // Small delay to ensure all state is updated
            setTimeout(() => {
              window.dispatchEvent(new Event('auth-change'));
            }, 100);
          }
        } catch (error) {
          console.error('Error in auth state change handler:', error);
          if (mounted) {
            setLoading(false);
          }
        }
      }
    );

    // Get initial session with retry logic
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!mounted) return;
        
        if (error) {
          console.error('Error getting session:', error);
          // Don't throw on session errors, just log them
          if (retryCount < maxRetries && mounted) {
            retryCount++;
            console.log(`Retrying session fetch (${retryCount}/${maxRetries})`);
            setTimeout(getInitialSession, 1000 * retryCount);
            return;
          }
        }
        
        console.log('Initial session:', session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      } catch (error) {
        console.error('Exception getting session:', error);
        if (mounted) {
          // On network errors, don't crash - just continue without auth
          setSession(null);
          setUser(null);
          setLoading(false);
        }
      }
    };

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const enterDemoMode = () => {
    localStorage.setItem('monark-demo-mode', 'true');
    setIsDemoMode(true);
    setUser(DEMO_USER);
    setSession(null);
    setLoading(false);
    // Dispatch event to notify components
    setTimeout(() => {
      window.dispatchEvent(new Event('auth-change'));
    }, 50);
  };

  const exitDemoMode = () => {
    localStorage.removeItem('monark-demo-mode');
    setIsDemoMode(false);
    setUser(null);
    setSession(null);
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: name
          }
        }
      });
      
      if (error) {
        console.error('Signup error:', error);
      }
      
      return { error };
    } catch (error) {
      console.error('Signup exception:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Signin error:', error);
        setLoading(false);
        return { error };
      }
      
      // Don't set loading to false here - let the auth state change handle it
      return { error: null };
    } catch (error) {
      console.error('Signin exception:', error);
      setLoading(false);
      return { error };
    }
  };

  const signOut = async () => {
    if (isDemoMode) {
      exitDemoMode();
      return;
    }
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Signout error:', error);
      }
    } catch (error) {
      console.error('Signout exception:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      isDemoMode,
      signUp,
      signIn,
      signOut,
      enterDemoMode,
      exitDemoMode
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
