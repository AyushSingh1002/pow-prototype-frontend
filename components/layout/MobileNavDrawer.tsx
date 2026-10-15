'use client';

import React from 'react';
import { X } from 'lucide-react';
import { useOrderFlow } from '../../context/OrderFlowContext';
import { StorefrontPage } from '../../types';

interface MobileNavDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
  onNavigate?: (page: StorefrontPage) => void;
}

export function MobileNavDrawer({
  isOpen: propIsOpen,
  onClose: propOnClose,
  onNavigate: propNavigate,
}: MobileNavDrawerProps) {
  const {
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    navigate: contextNavigate,
  } = useOrderFlow();

  const isOpen = propIsOpen !== undefined ? propIsOpen : isMobileMenuOpen;
  const onClose = propOnClose || (() => setIsMobileMenuOpen(false));
  const onNavigate = propNavigate || contextNavigate;

  if (!isOpen) return null;

  const handleNav = (p: StorefrontPage) => {
    onNavigate(p);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-[#E8EAEE] p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
    >
      <div className="flex items-center justify-between border-b border-[#0F1218] pb-4 mb-8">
        <span
          style={{
            fontFamily: 'var(--font-headline)',
            fontWeight: 650,
            fontSize: '22px',
            color: 'var(--key)',
          }}
        >
          Press &amp; Proof
        </span>
        <button
          onClick={onClose}
          className="p-2 cursor-pointer bg-transparent border-0 text-[#0F1218]"
          aria-label="Close menu"
        >
          <X size={24} />
        </button>
      </div>

      <nav className="flex flex-col space-y-4 text-lg font-bold" style={{ fontFamily: 'var(--font-headline)' }}>
        <button
          onClick={() => handleNav('home')}
          className="text-left py-2 border-b border-[#CBD0DA] cursor-pointer bg-transparent border-t-0 border-x-0"
        >
          Home
        </button>
        <button
          onClick={() => handleNav('catalogue')}
          className="text-left py-2 border-b border-[#CBD0DA] cursor-pointer bg-transparent border-t-0 border-x-0"
        >
          Products
        </button>
        <button
          onClick={() => handleNav('configurator')}
          className="text-left py-2 border-b border-[#CBD0DA] cursor-pointer bg-transparent border-t-0 border-x-0"
        >
          Configurator
        </button>
        <button
          onClick={() => handleNav('tracking')}
          className="text-left py-2 border-b border-[#CBD0DA] cursor-pointer bg-transparent border-t-0 border-x-0"
        >
          Track order
        </button>
        <button
          onClick={() => handleNav('bulk')}
          className="text-left py-2 border-b border-[#CBD0DA] cursor-pointer bg-transparent border-t-0 border-x-0"
        >
          Bulk quotes
        </button>
        <button
          onClick={() => handleNav('help')}
          className="text-left py-2 border-b border-[#CBD0DA] cursor-pointer bg-transparent border-t-0 border-x-0"
        >
          Sample specifications
        </button>
      </nav>

      <div className="mt-auto pt-8 border-t border-[#0F1218]">
        <button
          className="btn-proof-primary w-full py-4 text-sm"
          onClick={() => handleNav('configurator')}
        >
          Configure a book
        </button>
      </div>
    </div>
  );
}

export default MobileNavDrawer;
