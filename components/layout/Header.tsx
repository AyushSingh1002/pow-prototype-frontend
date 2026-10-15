'use client';

import React from 'react';
import { ArrowRight, Menu, User } from 'lucide-react';
import { useOrderFlow } from '../../context/OrderFlowContext';
import { useAuth } from '../../context/AuthContext';
import { StorefrontPage, BackendHealthState } from '../../types';

interface HeaderProps {
  currentPage?: StorefrontPage | string;
  onNavigate?: (page: StorefrontPage) => void;
  backendHealth?: BackendHealthState;
  currentUser?: string | null;
  onOpenSignIn?: () => void;
  onOpenMobileMenu?: () => void;
}

export function Header({
  currentPage: propPage,
  onNavigate: propNavigate,
  backendHealth: propHealth,
  currentUser: propUser,
  onOpenSignIn: propOpenSignIn,
  onOpenMobileMenu: propOpenMobileMenu,
}: HeaderProps) {
  const {
    page: contextPage,
    navigate: contextNavigate,
    backendHealth: contextHealth,
    setIsMobileMenuOpen,
  } = useOrderFlow();
  const { currentUser: contextUser, openSignIn: contextOpenSignIn } = useAuth();

  const currentPage = propPage || contextPage;
  const onNavigate = propNavigate || contextNavigate;
  const backendHealth = propHealth || contextHealth;
  const currentUser = propUser !== undefined ? propUser : contextUser;
  const onOpenSignIn = propOpenSignIn || contextOpenSignIn;
  const onOpenMobileMenu = propOpenMobileMenu || (() => setIsMobileMenuOpen(true));

  return (
    <header className="site-header">
      <div className="header-left">
        <button
          className="wordmark"
          onClick={() => onNavigate('home')}
          aria-label="Press and Proof home"
        >
          <span>PRESS</span>
          <b>&amp;</b>
          <span>PROOF</span>
        </button>

        <span
          className={`backend-status-pill ${backendHealth.connected ? 'connected' : 'error'}`}
          title={
            backendHealth.connected
              ? `Backend Connected (Config: ${backendHealth.version || 'sample-v1'})`
              : 'Connecting to Express backend on port 5000...'
          }
        >
          <span className="status-dot" />
          {backendHealth.connected ? (
            <>API Connected · {backendHealth.version || 'sample-v1'}</>
          ) : (
            <>Connecting...</>
          )}
        </span>
      </div>

      <nav className="desktop-nav" aria-label="Main navigation">
        <button
          className={currentPage === 'catalogue' ? 'active' : ''}
          onClick={() => onNavigate('catalogue')}
        >
          Products
        </button>
        <button
          className={currentPage === 'configurator' ? 'active' : ''}
          onClick={() => onNavigate('configurator')}
        >
          Configurator
        </button>
        <button
          className={currentPage === 'tracking' ? 'active' : ''}
          onClick={() => onNavigate('tracking')}
        >
          Track order
        </button>
        <button
          className={currentPage === 'bulk' ? 'active' : ''}
          onClick={() => onNavigate('bulk')}
        >
          Bulk quotes
        </button>
        <button
          className={currentPage === 'help' ? 'active' : ''}
          onClick={() => onNavigate('help')}
        >
          Help
        </button>
      </nav>

      <div className="header-actions">
        {currentUser ? (
          <button className="btn btn-ghost" onClick={onOpenSignIn} title="Account profile">
            <User size={14} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{currentUser}</span>
          </button>
        ) : (
          <button className="btn btn-ghost" onClick={onOpenSignIn}>
            Sign in
          </button>
        )}

        <button className="btn btn-primary" onClick={() => onNavigate('configurator')}>
          Start printing <ArrowRight size={14} />
        </button>

        <button
          className="btn btn-ghost mobile-menu"
          onClick={onOpenMobileMenu}
          aria-label="Open mobile menu"
        >
          <Menu size={20} />
        </button>
      </div>
    </header>
  );
}
