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
  // For now, we will expose a way to manually set the domain user if needed,
  // or it will be derived from the supabase user profile.
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

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        // Hydrate domain user from metadata (mocking database profile for now)
        const metadata = session.user.user_metadata;
        setUser({
          id: session.user.id as unknown as number, // Temporary cast until DB is fully typed
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
          id: session.user.id as unknown as number,
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

  return (
    <AuthContext.Provider value={{ session, supabaseUser, user, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
