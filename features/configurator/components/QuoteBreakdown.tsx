'use client';

import React from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { QuoteResponse } from '../../../types';
import { money } from '../../../lib/formatters';

interface QuoteBreakdownProps {
  quote: QuoteResponse | null;
  quantity: number;
  calculatingQuote: boolean;
  onContinue: () => void;
}

export function QuoteBreakdown({
  quote,
  quantity,
  calculatingQuote,
  onContinue,
}: QuoteBreakdownProps) {
  return (
    <aside className="price-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="eyebrow" style={{ margin: 0 }}>
          LIVE SERVER ESTIMATE
        </span>
        <span className="audit-badge">
          <ShieldCheck size={11} /> Audited
        </span>
      </div>

      <div style={{ opacity: calculatingQuote ? 0.6 : 1, transition: 'opacity 150ms ease' }}>
        {quote ? (
          <>
            <b>
              {money(Math.round(quote.total / quantity), true)}
              <small> per copy</small>
            </b>

            <div className="breakdown">
              {quote.lineItems.map((li, idx) => (
                <span key={idx}>
                  {li.description}
                  <i style={{ color: li.lineTotal < 0 ? 'var(--success)' : 'inherit' }}>
                    {money(li.lineTotal, true)}
                  </i>
                </span>
              ))}
            </div>

            <div className="grand-total">
              <span>Grand Total (Paise Audited)</span>
              <strong>{money(quote.total, true)}</strong>
            </div>

            <div
              style={{
                margin: '6px 0 16px',
                fontSize: 10,
                color: 'var(--muted)',
                font: 'var(--font-mono)',
              }}
            >
              Quote ID: {quote.id.slice(0, 16)}... · Valid for 30m
            </div>
          </>
        ) : (
          <div style={{ padding: '36px 0', textAlign: 'center', color: 'var(--muted)' }}>
            {calculatingQuote ? 'Calculating server estimate...' : 'Select valid options'}
          </div>
        )}
      </div>

      <button
        className="btn btn-primary"
        style={{ width: '100%', padding: '14px 20px', fontSize: 11 }}
        disabled={!quote || calculatingQuote}
        onClick={onContinue}
      >
        Continue to upload artwork <ArrowRight size={14} />
      </button>
      <p className="sample-note">
        Calculated server-side in integer paise minor units. Client-supplied totals are rejected at
        the edge.
      </p>
    </aside>
  );
}
