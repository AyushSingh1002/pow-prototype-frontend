'use client';

import React from 'react';
import { ArrowRight, CircleHelp } from 'lucide-react';
import { QuoteResponse, Product, StorefrontPage } from '../../../types';
import { money } from '../../../lib/formatters';
import { CoverSpreadCalculation, ArtworkLayoutType } from '../../../lib/coverSpread';

interface ProofSidebarProps {
  quote: QuoteResponse | null;
  product: Product | null;
  options: Record<string, string>;
  quantity: number;
  interiorFile: File | null;
  coverFile: File | null;
  effectiveLayout: ArtworkLayoutType;
  spreadCalc: CoverSpreadCalculation;
  interiorPageCount: number;
  proofApproved: boolean;
  onSetProofApproved: (approved: boolean) => void;
  onNavigate: (page: StorefrontPage) => void;
}

export function ProofSidebar({
  quote,
  product,
  options,
  quantity,
  interiorFile,
  coverFile,
  effectiveLayout,
  spreadCalc,
  interiorPageCount,
  proofApproved,
  onSetProofApproved,
  onNavigate,
}: ProofSidebarProps) {
  return (
    <aside className="proof-side">
      <div className="proof-order">
        <p className="eyebrow" style={{ margin: 0 }}>
          ACTIVE SERVER QUOTE
        </p>
        <h3 style={{ fontSize: 24, margin: '6px 0 2px' }}>{product?.name || 'Custom Print'}</h3>
        <p style={{ color: 'var(--muted)', fontSize: 12 }}>
          {Object.entries(options)
            .map(([k, v]) => `${k}: ${v}`)
            .join(' · ')}
        </p>
        <dl>
          <dt>Total copies</dt>
          <dd>{quantity}</dd>
          <dt>Interior file</dt>
          <dd style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {interiorFile?.name || 'Preflight PDF'}
          </dd>
          <dt>Cover artwork</dt>
          <dd style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {coverFile ? coverFile.name : 'No cover artwork uploaded'}
          </dd>
          <dt>Cover layout</dt>
          <dd style={{ font: 'var(--font-mono)', fontSize: 11 }}>
            {coverFile
              ? effectiveLayout === 'full-wrap'
                ? 'Full-wrap spread'
                : effectiveLayout === 'front-only'
                ? 'Front cover only (unprinted back)'
                : 'Cover artwork'
              : 'Awaiting upload'}
          </dd>
          <dt>Estimated spine</dt>
          <dd style={{ font: 'var(--font-mono)', fontSize: 11 }}>
            ~{spreadCalc.spineWidthMm} mm ({interiorPageCount} pp)
          </dd>
          <dt>Backend Quote ID</dt>
          <dd style={{ font: 'var(--font-mono)', fontSize: 10 }}>{quote?.id.slice(0, 16)}...</dd>
          <dt>Server Total</dt>
          <dd>{quote ? money(quote.total, true) : '₹0'}</dd>
        </dl>
        <div className="proof-total">
          <span>Final Total</span>
          <b>{quote ? money(quote.total, true) : '₹0'}</b>
        </div>
      </div>

      <label className="confirm-check">
        <input
          type="checkbox"
          checked={proofApproved}
          onChange={(e) => onSetProofApproved(e.target.checked)}
        />
        <span>
          I have inspected the specifications, bleeds, margins, and server quote breakdown.
        </span>
      </label>

      <div className="proof-actions">
        <button
          className="btn btn-primary"
          style={{ padding: '14px 20px', fontSize: 11 }}
          disabled={!proofApproved || !quote}
          onClick={() => {
            onSetProofApproved(true);
            onNavigate('checkout');
          }}
        >
          Approve proof &amp; proceed to checkout <ArrowRight size={14} />
        </button>
        <button className="btn btn-outline" onClick={() => onNavigate('upload')}>
          Replace file
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 10,
          color: 'var(--muted)',
          fontSize: 11,
          borderTop: '1px solid var(--line)',
          paddingTop: 16,
        }}
      >
        <CircleHelp size={16} style={{ flexShrink: 0 }} />
        <span>
          <b>Server Quote Verification:</b>
          <br />
          This quote was verified against pricing matrix version {quote?.pricingConfigVersion}.
        </span>
      </div>
    </aside>
  );
}
