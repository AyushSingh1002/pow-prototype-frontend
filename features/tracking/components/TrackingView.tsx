'use client';

import React, { useState } from 'react';
import { StorefrontPage } from '../../../types';
import { useOrderFlow } from '../../../context/OrderFlowContext';
import { Footer } from '../../../components/layout/Footer';
import { ProcessPath } from '../../home/components/ProcessPath';

interface TrackingViewProps {
  initialOrderId?: string;
  onNavigate?: (page: StorefrontPage) => void;
}

export function TrackingView({
  initialOrderId: propInitialOrderId,
  onNavigate: propNavigate,
}: TrackingViewProps) {
  const { lastOrderId, navigate: contextNavigate } = useOrderFlow();
  const onNavigate = propNavigate || contextNavigate;

  const [inputRef, setInputRef] = useState<string>(propInitialOrderId || lastOrderId || 'DEMO-PRNT-84F2');
  const [activeStation, setActiveStation] = useState<'upload' | 'proof' | 'print' | 'dispatch' | 'delivered'>('print');

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputRef.trim()) return;
    // Map arbitrary reference code to sample status
    setActiveStation('print');
  };

  return (
    <div className="w-full">
      <div className="proof-container py-8 md:py-16">
        <div className="border-b border-[#0F1218] pb-4 mb-8">
          <div className="flex justify-between items-baseline flex-wrap gap-2">
            <h1>Track Order Lifecycle</h1>
            <span className="sample-stamp">Sample statuses</span>
          </div>
          <p className="reading-text-soft text-sm mt-1">
            Simulate real-time status transitions from digital proof verification to dispatch.
          </p>
        </div>

        {/* Demo Reference Lookup Form */}
        <div className="proof-sheet p-6 md:p-8 border border-[#0F1218] bg-white max-w-xl mb-10">
          <form onSubmit={handleLookup} className="space-y-4">
            <label className="text-sm font-bold text-[#0F1218] block" style={{ fontFamily: 'var(--font-headline)' }}>
              Order reference or ticket number
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={inputRef}
                onChange={(e) => setInputRef(e.target.value)}
                placeholder="e.g. DEMO-PRNT-84F2"
                className="flex-1 p-2.5 border border-[#0F1218] rounded-[var(--control-radius)] bg-white text-sm font-mono uppercase"
              />
              <button type="submit" className="btn-proof-primary text-xs py-2 px-6">
                Lookup status
              </button>
            </div>
            <p className="text-[11px] text-[#5A6070]">
              Sample statuses: Demonstrates production tracking sequence. No real manufacturing takes place. Demo references are not stored in any persistent database.
            </p>
          </form>
        </div>

        {/* Reusable Process Path Component */}
        <div className="mb-10">
          <ProcessPath fixedStation={activeStation} isTrackingPage={true} />
        </div>

        {/* Station Details Sheet */}
        <div className="proof-sheet p-6 md:p-8 border border-[#0F1218] bg-white max-w-2xl">
          <div className="flex justify-between items-center border-b border-[#0F1218] pb-3 mb-4">
            <span className="font-bold text-base text-[#0F1218]">
              Active stage: Print &amp; bind
            </span>
            <span className="text-xs font-mono text-[#00628F] font-semibold">
              PLATE EXPOSURE VERIFIED
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-[#CBD0DA]">
              <span className="text-[#5A6070]">Reference code</span>
              <span className="font-mono font-bold text-[#0F1218]">{inputRef}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#CBD0DA]">
              <span className="text-[#5A6070]">Imposition layout</span>
              <span className="font-medium text-[#0F1218]">16-Page Signature A5</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#CBD0DA]">
              <span className="text-[#5A6070]">Next scheduled milestone</span>
              <span className="font-medium text-[#0F1218]">Spine gluing &amp; 3-knife trimmer</span>
            </div>
          </div>
        </div>
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}

export default TrackingView;
