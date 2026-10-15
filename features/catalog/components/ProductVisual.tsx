'use client';

import React from 'react';

interface ProductVisualProps {
  type?: string;
}

export function ProductVisual({ type = 'book' }: ProductVisualProps) {
  return (
    <div className={`product-visual visual-${type}`} aria-hidden="true">
      <div className="paper-sheet">
        <span>
          PRESS
          <br />
          &amp;
          <br />
          PROOF
        </span>
      </div>
      {type === 'book' && <div className="book-spine" />}
    </div>
  );
}
