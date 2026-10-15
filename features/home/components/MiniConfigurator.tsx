'use client';

import React, { useState } from 'react';
import { StorefrontPage } from '../../../types';
import { LiveBookPreview } from '../../configurator/components/LiveBookPreview';

interface MiniConfiguratorProps {
  onNavigate?: (page: StorefrontPage) => void;
  onSelectProduct?: (productId: string) => void;
}

export function MiniConfigurator({ onNavigate, onSelectProduct }: MiniConfiguratorProps) {
  const [binding, setBinding] = useState<'perfect_bound' | 'hardcover' | 'saddle_stitch'>('perfect_bound');
  const [coverFinish, setCoverFinish] = useState<'matte' | 'gloss' | 'spot_uv' | 'foil'>('matte');
  const [pageCount, setPageCount] = useState<number>(120);

  // Compute realistic sample integer paise calculation
  // Base unit cost per copy in paise:
  const baseCost = 1400; // ₹14 base
  const pageCost = pageCount * 12; // 12 paise per page
  const bindingCost = binding === 'hardcover' ? 18000 : binding === 'saddle_stitch' ? 1500 : 4500;
  const finishCost = coverFinish === 'foil' ? 6500 : coverFinish === 'spot_uv' ? 4500 : coverFinish === 'gloss' ? 1200 : 0;
  const unitPaise = baseCost + pageCost + bindingCost + finishCost;
  const totalCopies = 10;
  const grandTotalPaise = unitPaise * totalCopies;

  const formatPrice = (paise: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Math.round(paise / 100));
  };

  return (
    <section className="py-20 sm:py-24 lg:py-32" aria-label="Interactive mini book configurator">
      <div className="proof-container">
        <div className="border-b border-[#0F1218] pb-4 mb-8">
          <h2>Working Book Estimator</h2>
          <p className="reading-text-soft text-sm mt-1">
            Test spine thickness and live server cost projections directly on the sheet.
          </p>
        </div>

        <div className="proof-sheet p-5 sm:p-9 lg:p-12 border border-[#0F1218] grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Clear Controls */}
          <div className="lg:col-span-7 flex flex-col gap-8 lg:pr-4">
            {/* Control 1: Binding */}
            <div>
              <div className="flex justify-between items-baseline mb-3">
                <label className="text-sm font-bold text-[#0F1218]" style={{ fontFamily: 'var(--font-headline)' }}>
                  1. Binding style
                </label>
                <span className="text-xs text-[#5A6070]">
                  {binding === 'perfect_bound' ? 'Paperback spine' : binding === 'hardcover' ? 'Hardcover board' : 'Saddle stitch'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'perfect_bound', label: 'Paperback', sub: 'Glued flat spine' },
                  { id: 'hardcover', label: 'Hardcover', sub: 'Case bound board' },
                  { id: 'saddle_stitch', label: 'Saddle stitch', sub: '2 Folded staples' },
                ].map((b) => {
                  const isSelected = binding === b.id;
                  return (
                    <button
                      key={b.id}
                      onClick={() => setBinding(b.id as any)}
                      className={`p-3.5 text-left border cursor-pointer transition-all duration-150 relative bg-white ${
                        isSelected
                          ? 'border-[#0F1218] shadow-[2px_2px_0_0_#0F1218]'
                          : 'border-[#CBD0DA] hover:border-[#5A6070]'
                      }`}
                    >
                      <span className="text-sm font-bold block text-[#0F1218]">{b.label}</span>
                      <span className="text-[11px] text-[#5A6070] block mt-0.5">{b.sub}</span>
                      {isSelected && (
                        <>
                          <span className="absolute top-0.5 left-0.5 w-1.5 h-1.5 border-t border-l border-[#0F1218] pointer-events-none" />
                          <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 border-t border-r border-[#0F1218] pointer-events-none" />
                          <span className="absolute bottom-0.5 left-0.5 w-1.5 h-1.5 border-b border-l border-[#0F1218] pointer-events-none" />
                          <span className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 border-b border-r border-[#0F1218] pointer-events-none" />
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Control 2: Cover Finish */}
            <div>
              <div className="flex justify-between items-baseline mb-3">
                <label className="text-sm font-bold text-[#0F1218]" style={{ fontFamily: 'var(--font-headline)' }}>
                  2. Cover surface finish
                </label>
                <span className="text-xs text-[#5A6070]">
                  {coverFinish.toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2.5">
                {[
                  { id: 'matte', label: 'Matte' },
                  { id: 'gloss', label: 'Gloss' },
                  { id: 'spot_uv', label: 'Spot UV' },
                  { id: 'foil', label: 'Gold foil' },
                ].map((f) => {
                  const isSelected = coverFinish === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => setCoverFinish(f.id as any)}
                      className={`py-3 px-3 text-center border cursor-pointer transition-all duration-150 relative bg-white ${
                        isSelected
                          ? 'border-[#0F1218] shadow-[2px_2px_0_0_#0F1218]'
                          : 'border-[#CBD0DA] hover:border-[#5A6070]'
                      }`}
                    >
                      <span className="text-xs font-semibold text-[#0F1218]">{f.label}</span>
                      {isSelected && (
                        <>
                          <span className="absolute top-0.5 left-0.5 w-1.5 h-1.5 border-t border-l border-[#0F1218] pointer-events-none" />
                          <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 border-t border-r border-[#0F1218] pointer-events-none" />
                          <span className="absolute bottom-0.5 left-0.5 w-1.5 h-1.5 border-b border-l border-[#0F1218] pointer-events-none" />
                          <span className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 border-b border-r border-[#0F1218] pointer-events-none" />
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Control 3: Page Count */}
            <div>
              <div className="flex justify-between items-baseline mb-3">
                <label className="text-sm font-bold text-[#0F1218]" style={{ fontFamily: 'var(--font-headline)' }}>
                  3. Interior pages
                </label>
                <span className="text-sm font-bold tabular-nums text-[#0F1218]">
                  {pageCount} pages
                </span>
              </div>

              <div className="flex items-center gap-3">
                {[64, 120, 200, 320].map((count) => (
                  <button
                    key={count}
                    onClick={() => setPageCount(count)}
                    className="flex-1 py-2.5 text-xs border cursor-pointer transition-all duration-150 font-semibold"
                    style={{
                      backgroundColor: pageCount === count ? 'var(--key)' : 'var(--sheet)',
                      color: pageCount === count ? 'var(--sheet)' : 'var(--key)',
                      borderColor: 'var(--key)',
                    }}
                  >
                    {count} pp
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Live Book Preview + Live Estimate Sheet */}
          <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-24">
            <LiveBookPreview
              format="a5"
              binding={binding}
              pageCount={pageCount}
              coverFinish={coverFinish}
              interiorColour="bw"
              title="Press & Proof Edition"
            />

            {/* Estimate Summary on Sheet */}
            <div className="p-5 bg-[#E8EAEE] border border-[#0F1218] flex items-center justify-between flex-wrap gap-4">
              <div>
                <span className="sample-stamp">Sample price</span>
                <span className="text-xs text-[#5A6070] block mt-1.5">10 copies · A5 Format · Integer quote</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold tabular-nums text-[#0F1218] block">
                  {formatPrice(grandTotalPaise)}
                </span>
                <span className="text-xs text-[#5A6070]">
                  {formatPrice(unitPaise)} per copy
                </span>
              </div>
            </div>

            <button
              className="btn-proof-primary w-full py-3.5 text-sm"
              onClick={() => {
                onSelectProduct?.('books');
                onNavigate?.('configurator');
              }}
            >
              Open in full configurator
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MiniConfigurator;
