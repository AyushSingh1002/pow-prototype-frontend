'use client';

import React from 'react';
import { ArrowLeft, Home, BookOpen } from 'lucide-react';
import { StorefrontPage } from '../../types';

export interface NotFoundViewProps {
  onNavigate?: (page: StorefrontPage) => void;
  className?: string;
}

export function NotFoundView({
  onNavigate,
  className = '',
}: NotFoundViewProps) {
  return (
    <div
      className={`mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center ${className}`.trim()}
    >
      <span className="font-mono text-sm uppercase tracking-widest text-[var(--rust)]">
        Error 404 · Page Not Found
      </span>
      <h1 className="mt-4 font-serif text-4xl font-bold tracking-tight text-[var(--ink)] sm:text-5xl">
        The requested print spread could not be located.
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-[var(--muted)]">
        The page you are looking for has been moved, reindexed, or is currently undergoing
        typesetting verification.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => onNavigate?.('home')}
          className="btn btn-primary inline-flex items-center gap-2"
        >
          <Home size={16} /> Return to Storefront
        </button>
        <button
          type="button"
          onClick={() => onNavigate?.('catalogue')}
          className="btn btn-outline inline-flex items-center gap-2"
        >
          <BookOpen size={16} /> Browse Live Catalogue
        </button>
      </div>
    </div>
  );
}

export default NotFoundView;
