'use client';

import React from 'react';
import { ArrowRight, X } from 'lucide-react';
import { useOrderFlow } from '../../context/OrderFlowContext';
import { StorefrontPage, BackendHealthState } from '../../types';

interface MobileNavDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
  onNavigate?: (page: StorefrontPage) => void;
  backendHealth?: BackendHealthState;
}

export function MobileNavDrawer({
  isOpen: propIsOpen,
  onClose: propOnClose,
  onNavigate: propNavigate,
  backendHealth: propHealth,
}: MobileNavDrawerProps) {
  const {
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    navigate: contextNavigate,
    backendHealth: contextHealth,
  } = useOrderFlow();

  const isOpen = propIsOpen !== undefined ? propIsOpen : isMobileMenuOpen;
  const onClose = propOnClose || (() => setIsMobileMenuOpen(false));
  const onNavigate = propNavigate || contextNavigate;
  const backendHealth = propHealth || contextHealth;

  if (!isOpen) return null;

  const handleNav = (p: StorefrontPage) => {
    onNavigate(p);
    onClose();
  };

  return (
    <div className="mobile-drawer" role="dialog" aria-modal="true">
      <div className="mobile-drawer-header">
        <div className="wordmark">
          <span>PRESS</span>
          <b>&amp;</b>
          <span>PROOF</span>
        </div>
        <button className="btn btn-ghost" onClick={onClose} aria-label="Close menu">
          <X size={24} />
        </button>
      </div>

      <div style={{ marginBottom: 24 }}>
        <span className={`backend-status-pill ${backendHealth.connected ? 'connected' : 'error'}`}>
          <span className="status-dot" />
          {backendHealth.connected ? 'Backend Connected' : 'Connecting to API...'}
        </span>
      </div>

      <nav className="mobile-nav-links">
        <button onClick={() => handleNav('home')}>Home</button>
        <button onClick={() => handleNav('catalogue')}>Products Catalogue</button>
        <button onClick={() => handleNav('configurator')}>Configurator &amp; Pricing</button>
        <button onClick={() => handleNav('tracking')}>Track Order</button>
        <button onClick={() => handleNav('bulk')}>Bulk Quotes</button>
        <button onClick={() => handleNav('help')}>Help &amp; Guidelines</button>
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: 30, borderTop: '1px solid var(--line)' }}>
        <button
          className="btn btn-primary full"
          style={{ width: '100%', padding: '14px 20px' }}
          onClick={() => handleNav('configurator')}
        >
          Start a Print Job <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
