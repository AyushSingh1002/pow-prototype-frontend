'use client';

import React from 'react';
import { useOrderFlow } from '../../context/OrderFlowContext';
import { BackendHealthState } from '../../types';

interface NoticeProps {
  backendHealth?: BackendHealthState;
}

export function Notice({ backendHealth: propHealth }: NoticeProps) {
  const { backendHealth: contextHealth } = useOrderFlow();
  const backendHealth = propHealth || contextHealth;

  if (backendHealth.connected) {
    return (
      <aside className="notice-bar" role="status" aria-live="polite">
        <span>
          <b>Live Server Pricing Engine:</b> Connected to Express backend (Pricing Matrix v
          {backendHealth.version}). Integer minor unit (paise) calculation active.
        </span>
      </aside>
    );
  }

  return (
    <aside className="notice-bar notice-offline" role="status" aria-live="polite">
      <span>
        <b>Backend Offline:</b> Express pricing engine is unreachable. Serving cached catalogue
        with fallback sample prices. Run <code>npm run dev:backend</code> to enable live quotes.
      </span>
    </aside>
  );
}
