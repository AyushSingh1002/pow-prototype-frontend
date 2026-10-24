'use client';

import React from 'react';
import { QuoteResponse, Product, StorefrontPage } from '../../../types';
import { CoverSpreadCalculation, ArtworkLayoutType } from '../../../lib/coverSpread';
import { formatPriceFromPaise } from '../../../lib/formatters';

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
  spreadCalc,
  interiorPageCount,
  proofApproved,
  onSetProofApproved,
  onNavigate,
}: ProofSidebarProps) {
  return (
    <aside className="proof-sheet p-6 border border-[#0F1218] bg-white sticky top-24 space-y-6">
      {/* Header */}
      <div className="border-b border-[#0F1218] pb-4">
        <span className="sample-stamp">Sample price</span>
        <h3 className="text-xl font-bold mt-2" style={{ fontFamily: 'var(--font-headline)' }}>
          {product?.name || 'Custom Book'}
        </h3>
        <p className="text-xs text-[#5A6070] mt-1">
          {quantity} copies · {interiorPageCount} pages
        </p>
      </div>

      {/* Specifications list */}
      <div className="space-y-2.5 text-xs">
        <div className="flex justify-between py-1 border-b border-[#CBD0DA]">
          <span className="text-[#5A6070]">Calculated spine</span>
          <span className="font-semibold text-[#0F1218] tabular-nums">
            {spreadCalc?.spineWidthMm || 8.4} mm
          </span>
        </div>

        <div className="flex justify-between py-1 border-b border-[#CBD0DA]">
          <span className="text-[#5A6070]">Interior document</span>
          <span className="font-semibold text-[#0F1218] truncate max-w-[150px]">
            {interiorFile?.name || 'Preflight PDF'}
          </span>
        </div>

        <div className="flex justify-between py-1 border-b border-[#CBD0DA]">
          <span className="text-[#5A6070]">Cover artwork</span>
          <span className="font-semibold text-[#0F1218] truncate max-w-[150px]">
            {coverFile?.name || 'Standard template'}
          </span>
        </div>

        {Object.entries(options).map(([k, v]) => (
          <div key={k} className="flex justify-between py-1 border-b border-[#CBD0DA]">
            <span className="text-[#5A6070] capitalize">{k}</span>
            <span className="font-semibold text-[#0F1218]">{v}</span>
          </div>
        ))}

        <div className="flex justify-between items-baseline pt-3">
          <span className="text-sm font-bold text-[#0F1218]">Sample total</span>
          <span className="text-2xl font-extrabold tabular-nums text-[#0F1218]">
            {formatPriceFromPaise(quote?.total || 263100)}
          </span>
        </div>
      </div>

      {/* Approval Checkbox */}
      <div className="p-3 bg-[#E8EAEE] border border-[#0F1218] space-y-2">
        <label className="flex items-start gap-2.5 cursor-pointer text-xs">
          <input
            type="checkbox"
            checked={proofApproved}
            onChange={(e) => onSetProofApproved(e.target.checked)}
            className="mt-0.5 accent-[#0A95D4]"
          />
          <span className="text-[#0F1218] leading-tight font-medium">
            I have checked the trim, bleed margins and spine layout on this proof.
          </span>
        </label>
      </div>

      {/* Approve proof Action button */}
      <div className="space-y-3 pt-2">
        <button
          className="btn-proof-primary w-full py-3.5 text-sm"
          disabled={!proofApproved}
          onClick={() => {
            onSetProofApproved(true);
            onNavigate('checkout');
          }}
        >
          {proofApproved ? 'Proof approved — Continue to checkout' : 'Approve proof'}
        </button>

        <button
          type="button"
          onClick={() => onNavigate('upload')}
          className="btn-proof-secondary w-full py-2.5 text-xs"
        >
          Replace artwork file
        </button>
      </div>

      <p className="text-[11px] text-[#5A6070] text-center pt-2 border-t border-[#CBD0DA]">
        Sample proof simulation. No production plates are imaged.
      </p>
    </aside>
  );
}

export default ProofSidebar;
