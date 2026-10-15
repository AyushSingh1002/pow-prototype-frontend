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
    setCurrentUser: contextSetUser,
  } = useAuth();

  const isOpen = propIsOpen !== undefined ? propIsOpen : isSignInOpen;
  const onClose = propOnClose || closeSignIn;
  const currentUser = propUser !== undefined ? propUser : contextUser;
  const onSelectUser = propSelectUser || contextSetUser;

  const [activeTab, setActiveTab] = useState<'demo' | 'email'>('demo');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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

        <span className="sample-stamp">Prototype auth</span>
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
              <span className="font-bold text-sm text-[#0F1218]">{currentUser}</span>
            </div>
            <button
              className="btn-proof-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
              onClick={() => onSelectUser(null)}
            >
              <LogOut size={13} /> Sign out
            </button>
          </div>
        )}

        <div className="flex border-b border-[#0F1218] mb-6">
          <button
            className="pb-2 text-xs font-semibold cursor-pointer bg-transparent border-0 transition-colors mr-6"
            style={{
              color: activeTab === 'demo' ? '#0F1218' : '#5A6070',
              borderBottom: activeTab === 'demo' ? '2px solid #0F1218' : '2px solid transparent',
            }}
            onClick={() => setActiveTab('demo')}
          >
            Demo profiles
          </button>
          <button
            className="pb-2 text-xs font-semibold cursor-pointer bg-transparent border-0 transition-colors"
            style={{
              color: activeTab === 'email' ? '#0F1218' : '#5A6070',
              borderBottom: activeTab === 'email' ? '2px solid #0F1218' : '2px solid transparent',
            }}
            onClick={() => setActiveTab('email')}
          >
            Email login
          </button>
        </div>

        {activeTab === 'demo' ? (
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
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (email) {
                onSelectUser(email);
                onClose();
              }
            }}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="font-semibold text-[#0F1218] block mb-1">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="editor@pressandproof.in"
                className="w-full p-2.5 border border-[#0F1218] rounded-[var(--control-radius)] bg-white text-sm"
              />
            </div>
            <div>
              <label className="font-semibold text-[#0F1218] block mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full p-2.5 border border-[#0F1218] rounded-[var(--control-radius)] bg-white text-sm"
              />
            </div>
            <button type="submit" className="btn-proof-primary w-full py-3 text-sm mt-2">
              Sign in
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default SignInModal;
