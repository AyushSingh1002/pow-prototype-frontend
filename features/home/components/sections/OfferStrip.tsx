'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

export interface OfferStripProps {
  text?: React.ReactNode;
  className?: string;
}

export function OfferStrip({
  text,
  className = '',
}: OfferStripProps) {
  return (
    <div className={`offer-strip ${className}`.trim()}>
      <Sparkles size={14} />{' '}
      {text || (
        <>
          <b>Server-Side Integrity:</b> Client-side price tampering is strictly rejected. Every quote
          is cryptographically auditable.
        </>
      )}
    </div>
  );
}

export default OfferStrip;
