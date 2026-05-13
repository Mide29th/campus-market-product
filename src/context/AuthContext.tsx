import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User as SupabaseUser, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { User } from '../types';

interface AuthContextType {
  session: Session | null;
  supabaseUser: SupabaseUser | null;
  user: User | null; // Our domain user
  isLoading: boolean;
  signOut: () => Promise<void>;
  viewMode: 'buying' | 'selling';
  setViewMode: (mode: 'buying' | 'selling') => void;
  toggleViewMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewModeState] = useState<'buying' | 'selling'>(
    (localStorage.getItem('viewMode') as 'buying' | 'selling') || 'buying'
  );

  const setViewMode = (mode: 'buying' | 'selling') => {
    setViewModeState(mode);
    localStorage.setItem('viewMode', mode);
  };

  const toggleViewMode = () => {
    const newMode = viewMode === 'buying' ? 'selling' : 'buying';
    setViewMode(newMode);
  };

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        // Hydrate domain user from metadata (mocking database profile for now)
        const metadata = session.user.user_metadata;
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: metadata.full_name || 'Campus Market User',
          role: metadata.role || 'student',
          walletBalance: metadata.walletBalance || 0,
          avatarUrl: metadata.avatar_url,
        });
      }
      setIsLoading(false);
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setSession(session);
      setSupabaseUser(session?.user ?? null);
      
      if (session?.user) {
        const metadata = session.user.user_metadata;
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: metadata.full_name || 'Campus Market User',
          role: metadata.role || 'student',
          walletBalance: metadata.walletBalance || 0,
          avatarUrl: metadata.avatar_url,
        });
      } else {
        setUser(null);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  useEffect(() => {
    if (!session) return;

    const THREE_HOURS_MS = 3 * 60 * 60 * 1000;
    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        console.log('Session expired due to inactivity');
        signOut();
      }, THREE_HOURS_MS);
    };

    // Events that signify user activity
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    activityEvents.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    // Initial start
    resetTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [session]);

  return (
    <AuthContext.Provider value={{ 
      session, 
      supabaseUser, 
      user, 
      isLoading, 
      signOut, 
      viewMode, 
      setViewMode, 
      toggleViewMode 
    }}>
      {children}
    </AuthContext.Provider>
  );
}
