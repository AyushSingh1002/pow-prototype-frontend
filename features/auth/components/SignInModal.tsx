'use client';

import React, { useState } from 'react';
import { ArrowRight, Check, LogOut, X } from 'lucide-react';
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
    { id: 'demo-token', name: 'Demo Customer (Standard)', role: 'Standard Account' },
    {
      id: 'cust_author_42',
      name: 'Author Account (cust_author_42)',
      role: 'Independent Publisher',
    },
    {
      id: 'cust_business_07',
      name: 'Enterprise Corporate (cust_business_07)',
      role: 'Commercial Print Client',
    },
  ];

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close dialog">
          <X size={20} />
        </button>

        <p className="eyebrow">CUSTOMER AUTHENTICATION</p>
        <h2 style={{ fontSize: 28, marginBottom: 8 }}>Sign in to Press &amp; Proof</h2>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 24 }}>
          Access authenticated draft order conversion and encrypted status audit records.
        </p>

        {currentUser && (
          <div
            style={{
              padding: 14,
              backgroundColor: 'var(--success-bg)',
              border: '1px solid var(--success-border)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 20,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <small
                style={{
                  font: 'var(--font-mono)',
                  fontSize: 10,
                  color: 'var(--success)',
                  display: 'block',
                }}
              >
                CURRENTLY SIGNED IN AS
              </small>
              <b style={{ color: 'var(--ink)' }}>{currentUser}</b>
            </div>
            <button
              className="btn btn-outline"
              style={{ padding: '6px 12px' }}
              onClick={() => onSelectUser(null)}
            >
              <LogOut size={13} /> Sign out
            </button>
          </div>
        )}

        <div
          style={{
            display: 'flex',
            gap: 8,
            borderBottom: '1px solid var(--line)',
            marginBottom: 20,
          }}
        >
          <button
            className={`btn ${activeTab === 'demo' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '8px 14px', fontSize: 11 }}
            onClick={() => setActiveTab('demo')}
          >
            Quick Demo Profiles
          </button>
          <button
            className={`btn ${activeTab === 'email' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '8px 14px', fontSize: 11 }}
            onClick={() => setActiveTab('email')}
          >
            Email &amp; Password
          </button>
        </div>

        {activeTab === 'demo' ? (
          <div>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14 }}>
              Select a simulated bearer profile supported by the Express backend auth middleware:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {demoAccounts.map((acc) => (
                <button
                  key={acc.id}
                  style={{
                    padding: '12px 16px',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor:
                      currentUser === acc.id ? 'var(--info-bg)' : 'var(--surface)',
                    borderColor: currentUser === acc.id ? 'var(--navy)' : 'var(--line)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    textAlign: 'left',
                  }}
                  onClick={() => {
                    onSelectUser(acc.id);
                    onClose();
                  }}
                >
                  <div>
                    <b style={{ display: 'block', fontSize: 13, color: 'var(--ink)' }}>
                      {acc.name}
                    </b>
                    <small
                      style={{ color: 'var(--muted)', font: 'var(--font-mono)', fontSize: 10 }}
                    >
                      Token: {acc.id} · {acc.role}
                    </small>
                  </div>
                  {currentUser === acc.id && <Check size={16} color="var(--navy)" />}
                </button>
              ))}
            </div>
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
            style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  font: 'var(--font-mono)',
                  fontSize: 10,
                  marginBottom: 6,
                }}
              >
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                required
                placeholder="editor@pressandproof.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--surface)',
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  font: 'var(--font-mono)',
                  fontSize: 10,
                  marginBottom: 6,
                }}
              >
                PASSWORD
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--surface)',
                }}
              />
            </div>
            <button className="btn btn-primary" type="submit" style={{ marginTop: 8 }}>
              Sign In to Account <ArrowRight size={14} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
