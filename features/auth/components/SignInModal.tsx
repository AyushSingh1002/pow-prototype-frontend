'use client';

import React, { useState } from 'react';
import { LogOut, X } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

interface SignInModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  currentUser?: string | null;
  onSelectUser?: (user: string | null) => void;
}

export function SignInModal({
  isOpen: propIsOpen,
  onClose: propOnClose,
  currentUser: propUser,
  onSelectUser: propSelectUser,
}: SignInModalProps) {
  const {
    isSignInOpen,
    closeSignIn,
    currentUser: contextUser,
    accountLabel,
    isDemoMode,
    signInWithEmailOtp,
    signInWithGoogle,
    signOut,
    setCurrentUser: contextSetUser,
  } = useAuth();

  const isOpen = propIsOpen !== undefined ? propIsOpen : isSignInOpen;
  const onClose = propOnClose || closeSignIn;
  const currentUser = propUser !== undefined ? propUser : contextUser;
  const onSelectUser = propSelectUser || contextSetUser;
  const [email, setEmail] = useState('');
  const [isSendingLink, setIsSendingLink] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const demoAccounts = [
    { id: 'demo-token', name: 'Standard Demo Account', role: 'Standard Account' },
    {
      id: 'cust_author_42',
      name: 'Author & Self-Publisher',
      role: 'Independent Publisher',
    },
    {
      id: 'cust_business_07',
      name: 'Corporate Commercial Client',
      role: 'Commercial Print Client',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-none"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="proof-sheet p-8 border-2 border-[#0F1218] bg-white max-w-lg w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-1.5 cursor-pointer bg-transparent border-0 text-[#0F1218]"
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>

        <span className="sample-stamp">{isDemoMode ? 'Prototype auth' : 'Secure customer sign-in'}</span>
        <h2 className="text-2xl font-bold mt-2" style={{ fontFamily: 'var(--font-headline)' }}>
          Customer Sign In
        </h2>
        <p className="reading-text-soft text-xs mt-1 mb-6">
          Access draft quotes, saved addresses and order tracking profiles.
        </p>

        {currentUser && (
          <div className="p-3 bg-[#E8EAEE] border border-[#0F1218] mb-6 flex justify-between items-center">
            <div>
              <span className="text-[10px] text-[#5A6070] uppercase font-semibold block">
                Signed in as
              </span>
              <span className="font-bold text-sm text-[#0F1218]">
                {propUser !== undefined ? currentUser : accountLabel}
              </span>
            </div>
            <button
              className="btn-proof-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
              onClick={() => (isDemoMode ? onSelectUser(null) : signOut())}
            >
              <LogOut size={13} /> Sign out
            </button>
          </div>
        )}

        {isDemoMode ? (
          <>
            <div className="mb-4 border-b border-[#CBD0DA] pb-3 text-xs font-semibold text-[#5A6070]">
              Prototype profiles
            </div>
            <div className="space-y-3">
            {demoAccounts.map((acc) => (
              <button
                key={acc.id}
                onClick={() => {
                  onSelectUser(acc.id);
                  onClose();
                }}
                className="w-full p-3.5 border border-[#0F1218] text-left cursor-pointer transition-colors flex justify-between items-center bg-white hover:bg-[#F9FAFC]"
                style={{
                  backgroundColor: currentUser === acc.id ? '#F0F9FD' : 'white',
                  borderColor: currentUser === acc.id ? '#0A95D4' : '#0F1218',
                }}
              >
                <div>
                  <span className="text-sm font-bold block text-[#0F1218]">{acc.name}</span>
                  <span className="text-[11px] text-[#5A6070] block">{acc.role}</span>
                </div>
                {currentUser === acc.id && (
                  <span className="text-xs font-bold text-[#00628F]">Active</span>
                )}
              </button>
            ))}
            </div>
          </>
        ) : (
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              setError(null);
              setNotice(null);
              setIsSendingLink(true);
              try {
                await signInWithEmailOtp(email.trim());
                setNotice('Check your email for a secure sign-in link.');
              } catch (signInError) {
                setError(signInError instanceof Error ? signInError.message : 'Could not send sign-in link.');
              } finally {
                setIsSendingLink(false);
              }
            }}
            className="space-y-3"
          >
            <label htmlFor="auth-email" className="text-xs font-semibold text-[#5A6070] block">
              Email address
            </label>
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full p-3 border border-[#0F1218] rounded-[var(--control-radius)] bg-white"
            />
            <button
              type="submit"
              disabled={isSendingLink}
              className="btn-proof-primary w-full py-3"
            >
              {isSendingLink ? 'Sending link...' : 'Email me a secure sign-in link'}
            </button>
            <button
              type="button"
              disabled={isSendingLink}
              onClick={async () => {
                setError(null);
                setNotice(null);
                try {
                  await signInWithGoogle();
                } catch (signInError) {
                  setError(signInError instanceof Error ? signInError.message : 'Could not start Google sign-in.');
                }
              }}
              className="w-full py-3 border border-[#0F1218] bg-white font-semibold"
            >
              Continue with Google
            </button>
            {notice && <p role="status" className="text-sm text-[#00628F]">{notice}</p>}
            {error && <p role="alert" className="text-sm text-[#C4161C]">{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
}

export default SignInModal;
