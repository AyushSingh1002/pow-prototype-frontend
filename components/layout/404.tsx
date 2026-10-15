'use client';

import React from 'react';
import { StorefrontPage } from '../../types';

export interface NotFoundViewProps {
  onNavigate?: (page: StorefrontPage) => void;
}

export function NotFoundView({ onNavigate }: NotFoundViewProps) {
  return (
    <div className="proof-container py-20 flex flex-col items-center justify-center text-center">
      <div className="proof-sheet p-8 md:p-12 border border-[#0F1218] max-w-lg w-full space-y-4">
        <span className="sample-stamp">404</span>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-headline)' }}>
          This page does not exist.
        </h1>
        <p className="reading-text-soft text-sm">
          The link you followed points to a page that has moved or does not exist. Return to the storefront home or inspect the product index.
        </p>

        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <button
            type="button"
            onClick={() => onNavigate?.('home')}
            className="btn-proof-primary text-xs py-2.5 px-6"
          >
            Return to home
          </button>
          <button
            type="button"
            onClick={() => onNavigate?.('catalogue')}
            className="btn-proof-secondary text-xs py-2.5 px-6"
          >
            Product index
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotFoundView;
