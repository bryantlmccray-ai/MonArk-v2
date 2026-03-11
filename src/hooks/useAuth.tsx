
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

// No fake User object — demo mode uses DemoContext mock data only

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    // Don't auto-restore demo mode from localStorage - require explicit entry
    // This ensures users always start from the landing page
    localStorage.removeItem('monark-demo-mode');

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
    // Demo mode only sets a flag — no fake User object, no localStorage persistence.
    // DemoMainApp handles the demo experience with client-side mock data.
    // AuthGuard verifies real Supabase JWTs, so demo mode cannot access real data.
    setIsDemoMode(true);
    setSession(null);
    setLoading(false);
  };

  const exitDemoMode = () => {
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
