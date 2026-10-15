'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  currentUser: string | null;
  setCurrentUser: (user: string | null) => void;
  isSignInOpen: boolean;
  setIsSignInOpen: (isOpen: boolean) => void;
  openSignIn: () => void;
  closeSignIn: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<string | null>('demo-token');
  const [isSignInOpen, setIsSignInOpen] = useState(false);

  const openSignIn = () => setIsSignInOpen(true);
  const closeSignIn = () => setIsSignInOpen(false);
  const signOut = () => setCurrentUser(null);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isSignInOpen,
        setIsSignInOpen,
        openSignIn,
        closeSignIn,
        signOut,
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
