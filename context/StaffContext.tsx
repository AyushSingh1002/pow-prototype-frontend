'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { getSupabaseClient } from '../lib/auth/supabase';

export type StaffRole = 'staff' | 'admin';

export interface StaffSession {
  token: string;
  id: string;
  displayName: string;
  role: StaffRole;
}

const demoStaff: StaffSession = {
  token: 'demo-staff-token',
  id: 'staff_demo_1',
  displayName: 'Demo Staff',
  role: 'staff',
};

const isDemoMode =
  process.env.NODE_ENV !== 'production' &&
  process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE !== 'false';

interface StaffContextValue {
  session: StaffSession | null;
  authReady: boolean;
  authError: string | null;
  isDemoMode: boolean;
  enterDemo: () => void;
  signInWithEmailOtp: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const StaffContext = createContext<StaffContextValue | undefined>(undefined);

export function StaffProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<StaffSession | null>(isDemoMode ? demoStaff : null);
  const [authReady, setAuthReady] = useState(isDemoMode);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (isDemoMode) return;

    let active = true;
    let unsubscribe = () => {};

    const updateFromSession = (
      token: string | undefined,
      user: { id: string; email?: string | null; app_metadata: Record<string, unknown> } | undefined,
    ) => {
      const role = user?.app_metadata.role;
      if (token && user && (role === 'staff' || role === 'admin')) {
        setSession({
          token,
          id: user.id,
          displayName: user.email || user.id,
          role,
        });
      } else {
        setSession(null);
      }
    };

    try {
      const supabase = getSupabaseClient();
      supabase.auth.getSession().then(({ data, error }) => {
        if (!active) return;
        if (error) setAuthError(`Unable to restore staff session: ${error.message}`);
        updateFromSession(data.session?.access_token, data.session?.user);
        setAuthReady(true);
      }).catch((error: unknown) => {
        if (!active) return;
        setAuthError(error instanceof Error ? error.message : 'Unable to restore staff session.');
        setAuthReady(true);
      });

      const { data } = supabase.auth.onAuthStateChange((_event, authSession) => {
        if (!active) return;
        updateFromSession(authSession?.access_token, authSession?.user);
        setAuthError(null);
        setAuthReady(true);
      });
      unsubscribe = () => data.subscription.unsubscribe();
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Staff authentication is unavailable.');
      setAuthReady(true);
    }

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const enterDemo = useCallback(() => {
    if (isDemoMode) setSession(demoStaff);
  }, []);

  const signInWithEmailOtp = useCallback(async (email: string) => {
    if (isDemoMode) {
      throw new Error('Email sign-in is not needed in demo mode.');
    }
    const { error } = await getSupabaseClient().auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/staff` },
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    if (isDemoMode) {
      setSession(null);
      return;
    }
    const { error } = await getSupabaseClient().auth.signOut();
    if (error) throw error;
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({ session, authReady, authError, isDemoMode, enterDemo, signInWithEmailOtp, signOut }),
    [session, authReady, authError, enterDemo, signInWithEmailOtp, signOut],
  );

  return <StaffContext.Provider value={value}>{children}</StaffContext.Provider>;
}

export function useStaff(): StaffContextValue {
  const context = useContext(StaffContext);
  if (!context) throw new Error('useStaff must be used within a StaffProvider');
  return context;
}
