'use client';

import React from 'react';

export function Notice() {
  return (
    <aside
      className="w-full text-center py-2 px-4 border-b border-[#0F1218] text-xs font-medium"
      style={{
        backgroundColor: 'var(--yellow)',
        color: 'var(--key)',
        letterSpacing: '0.01em',
      }}
      role="note"
      aria-label="Prototype disclaimer"
    >
      Concept prototype. Prices are illustrative samples and no orders are real.
    </aside>
  );
}

export default Notice;
