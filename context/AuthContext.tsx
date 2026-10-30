'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getSupabaseClient } from '../lib/auth/supabase';

const isDemoMode =
  process.env.NODE_ENV !== 'production' &&
  process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE !== 'false';

interface AuthContextType {
  currentUser: string | null;
  accountLabel: string | null;
  isDemoMode: boolean;
  authReady: boolean;
  setCurrentUser: (user: string | null) => void;
  isSignInOpen: boolean;
  setIsSignInOpen: (isOpen: boolean) => void;
  openSignIn: () => void;
  closeSignIn: () => void;
  signOut: () => void;
  signInWithEmailOtp: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<string | null>(
    isDemoMode ? 'demo-token' : null
  );
  const [accountLabel, setAccountLabel] = useState<string | null>(
    isDemoMode ? 'demo-token' : null
  );
  const [authReady, setAuthReady] = useState(isDemoMode);
  const [isSignInOpen, setIsSignInOpen] = useState(false);

  const openSignIn = () => setIsSignInOpen(true);
  const closeSignIn = () => setIsSignInOpen(false);
  const setCurrentUser = (user: string | null) => {
    if (!isDemoMode) {
      if (user === null) void signOut();
      return;
    }
    setCurrentUserState(user);
    setAccountLabel(user);
  };
  const signOut = () => {
    if (isDemoMode) {
      setCurrentUserState(null);
      setAccountLabel(null);
      return;
    }
    void getSupabaseClient().auth.signOut().then(({ error }) => {
      if (error) console.error('Supabase sign-out failed:', error.message);
    });
  };

  const signInWithEmailOtp = async (email: string) => {
    if (isDemoMode) throw new Error('Email sign-in is not enabled in demo mode.');
    const { error } = await getSupabaseClient().auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    if (isDemoMode) throw new Error('Google sign-in is not enabled in demo mode.');
    const { error } = await getSupabaseClient().auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
  };

  useEffect(() => {
    if (isDemoMode) return;
    const supabase = getSupabaseClient();
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error('Supabase session restore failed:', error.message);
      }
      setCurrentUserState(data.session?.access_token ?? null);
      setAccountLabel(data.session?.user.email ?? data.session?.user.id ?? null);
      setAuthReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUserState(session?.access_token ?? null);
      setAccountLabel(session?.user.email ?? session?.user.id ?? null);
      setAuthReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        accountLabel,
        isDemoMode,
        authReady,
        setCurrentUser,
        isSignInOpen,
        setIsSignInOpen,
        openSignIn,
        closeSignIn,
        signOut,
        signInWithEmailOtp,
        signInWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
