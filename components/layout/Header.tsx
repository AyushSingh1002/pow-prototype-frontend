'use client';

import React, { useEffect, useState } from 'react';
import { Menu, User } from 'lucide-react';
import { useOrderFlow } from '../../context/OrderFlowContext';
import { useAuth } from '../../context/AuthContext';
import { StorefrontPage } from '../../types';

interface HeaderProps {
  currentPage?: StorefrontPage | string;
  onNavigate?: (page: StorefrontPage) => void;
  currentUser?: string | null;
  onOpenSignIn?: () => void;
  onOpenMobileMenu?: () => void;
}

export function Header({
  currentPage: propPage,
  onNavigate: propNavigate,
  currentUser: propUser,
  onOpenSignIn: propOpenSignIn,
  onOpenMobileMenu: propOpenMobileMenu,
}: HeaderProps) {
  const {
    page: contextPage,
    navigate: contextNavigate,
    setIsMobileMenuOpen,
  } = useOrderFlow();
  const {
    currentUser: contextUser,
    accountLabel,
    openSignIn: contextOpenSignIn,
  } = useAuth();

  const currentPage = propPage || contextPage;
  const onNavigate = propNavigate || contextNavigate;
  const currentUser = propUser !== undefined ? propUser : contextUser;
  const onOpenSignIn = propOpenSignIn || contextOpenSignIn;
  const onOpenMobileMenu = propOpenMobileMenu || (() => setIsMobileMenuOpen(true));

  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 12);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className="sticky top-0 z-40 transition-colors duration-150"
      style={{
        backgroundColor: 'var(--table)',
        borderBottom: hasScrolled ? '1px solid var(--key)' : '1px solid transparent',
      }}
    >
      <div className="proof-container flex items-center justify-between h-[64px]">
        {/* Wordmark */}
        <button
          onClick={() => onNavigate('home')}
          className="text-left cursor-pointer bg-transparent border-0 p-0 text-inherit"
          aria-label="Press and Proof home"
        >
          <span
            style={{
              fontFamily: 'var(--font-headline)',
              fontWeight: 650,
              fontSize: '20px',
              letterSpacing: '-0.02em',
              color: 'var(--key)',
            }}
          >
            Press &amp; Proof
          </span>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
          {[
            { page: 'catalogue' as StorefrontPage, label: 'Products' },
            { page: 'tracking' as StorefrontPage, label: 'Track order' },
            { page: 'bulk' as StorefrontPage, label: 'Bulk quotes' },
            { page: 'help' as StorefrontPage, label: 'Help' },
          ].map((item) => {
            const isActive = currentPage === item.page;
            return (
              <button
                key={item.page}
                onClick={() => onNavigate(item.page)}
                className="cursor-pointer bg-transparent border-0 p-0 text-sm font-medium transition-colors"
                style={{
                  color: isActive ? 'var(--key)' : 'var(--key-soft)',
                  borderBottom: isActive ? '1.5px solid var(--key)' : '1.5px solid transparent',
                  paddingBottom: '2px',
                }}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Sign in and Mobile Drawer Trigger */}
        <div className="flex items-center gap-4">
          {currentUser ? (
            <button
              onClick={onOpenSignIn}
              className="flex items-center gap-2 text-sm font-medium cursor-pointer bg-transparent border-0 p-0"
              style={{ color: 'var(--key)' }}
              title="Account profile"
            >
              <User size={16} />
              <span>{propUser !== undefined ? currentUser : accountLabel}</span>
            </button>
          ) : (
            <button
              onClick={onOpenSignIn}
              className="text-sm font-medium cursor-pointer bg-transparent border-0 p-0 hover:underline"
              style={{ color: 'var(--key)' }}
            >
              Sign in
            </button>
          )}

          <button
            onClick={onOpenMobileMenu}
            className="md:hidden flex items-center justify-center p-1.5 cursor-pointer bg-transparent border-0"
            style={{ color: 'var(--key)' }}
            aria-label="Open navigation menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
