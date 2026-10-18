'use client';

import React, { useEffect, useState } from 'react';
import { StorefrontPage } from '../../../types';
import { createQuote } from '../../../lib/api/quotes';
import { QuoteResponse } from '../../../types/api.types';
import { LiveBookPreview } from '../../configurator/components/LiveBookPreview';

interface MiniConfiguratorProps {
  onNavigate?: (page: StorefrontPage) => void;
  onSelectProduct?: (productId: string) => void;
}

export function MiniConfigurator({ onNavigate, onSelectProduct }: MiniConfiguratorProps) {
  const [binding, setBinding] = useState<'perfect_bound' | 'hardcover' | 'saddle_stitch'>('perfect_bound');
  const [coverFinish, setCoverFinish] = useState<'matte' | 'gloss' | 'spot_uv' | 'foil'>('matte');
  const [pageCount, setPageCount] = useState<number>(120);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(true);
  const totalCopies = 10;

  useEffect(() => {
    let isCurrentRequest = true;
    setIsLoadingQuote(true);
    setQuoteError(null);

    createQuote({
      productId: 'books',
      quantity: totalCopies,
      options: {
        size: 'a5-portrait',
        interior: 'bw',
        paper: 'natural-white',
        binding: binding === 'perfect_bound' ? 'paperback' : binding === 'saddle_stitch' ? 'saddle-stitch' : binding,
        pages: String(pageCount),
        finish: coverFinish,
      },
    })
      .then((nextQuote) => {
        if (isCurrentRequest) setQuote(nextQuote);
      })
      .catch((error: unknown) => {
        if (!isCurrentRequest) return;
        setQuote(null);
        setQuoteError(error instanceof Error ? error.message : 'Quote is temporarily unavailable.');
      })
      .finally(() => {
        if (isCurrentRequest) setIsLoadingQuote(false);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [binding, coverFinish, pageCount]);

  const formatPrice = (paise: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Math.round(paise / 100));
  };

  return (
    <section className="py-14 sm:py-18 lg:py-20" aria-label="Interactive mini book configurator">
      <div className="proof-container">
        <div className="pb-5 mb-7">
          <h2>Working Book Estimator</h2>
          <p className="reading-text-soft text-sm mt-1">
            See how each book choice changes a server-calculated quote.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Column: Clear Controls */}
          <div className="lg:col-span-7 flex flex-col gap-7 lg:pr-4">
            {/* Control 1: Binding */}
            <div>
              <div className="flex justify-between items-baseline mb-3">
                <label className="text-sm font-bold text-[#0F1218]" style={{ fontFamily: 'var(--font-headline)' }}>
                  Binding style
                </label>
                <span className="text-xs text-[#5A6070]">
                  {binding === 'perfect_bound' ? 'Paperback spine' : binding === 'hardcover' ? 'Hardcover board' : 'Saddle stitch'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
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
                      aria-pressed={isSelected}
                      className={`min-h-16 p-3 text-left border cursor-pointer transition-colors duration-150 bg-white ${
                        isSelected
                          ? 'border-[#0F1218] border-l-[3px]'
                          : 'border-[#CBD0DA] hover:border-[#5A6070]'
                      }`}
                    >
                      <span className="text-sm font-bold block text-[#0F1218]">{b.label}</span>
                      <span className="text-[11px] text-[#5A6070] block mt-0.5">{b.sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Control 2: Cover Finish */}
            <div>
              <div className="flex justify-between items-baseline mb-3">
                <label className="text-sm font-bold text-[#0F1218]" style={{ fontFamily: 'var(--font-headline)' }}>
                  Cover surface finish
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
                      aria-pressed={isSelected}
                      className={`min-h-11 py-2.5 px-3 text-center border cursor-pointer transition-colors duration-150 bg-white ${
                        isSelected
                          ? 'border-[#0F1218] border-b-[3px]'
                          : 'border-[#CBD0DA] hover:border-[#5A6070]'
                      }`}
                    >
                      <span className="text-xs font-semibold text-[#0F1218]">{f.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Control 3: Page Count */}
            <div>
              <div className="flex justify-between items-baseline mb-3">
                <label className="text-sm font-bold text-[#0F1218]" style={{ fontFamily: 'var(--font-headline)' }}>
                  Interior pages
                </label>
                <span className="text-sm font-bold tabular-nums text-[#0F1218]">
                  {pageCount} pages
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2.5">
                {[64, 120, 200, 320].map((count) => (
                  <button
                    key={count}
                    onClick={() => setPageCount(count)}
                    aria-pressed={pageCount === count}
                    className="min-h-10 py-2 px-2 text-xs border cursor-pointer transition-colors duration-150 font-semibold"
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
          <div className="lg:col-span-5 space-y-4">
            <LiveBookPreview
              format="a5"
              binding={binding}
              pageCount={pageCount}
              coverFinish={coverFinish}
              interiorColour="bw"
              title="Press & Proof Edition"
            />

            {/* Estimate Summary on Sheet */}
            <div className="p-5 bg-[#E8EAEE] border border-[#0F1218] flex items-center justify-between flex-wrap gap-4" aria-live="polite">
              <div>
                <span className="text-sm font-semibold text-[#0F1218]">Server quote</span>
                <span className="text-xs text-[#5A6070] block mt-1.5">Illustrative rates · 10 copies · A5</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold tabular-nums text-[#0F1218] block">
                  {isLoadingQuote ? 'Calculating…' : quote ? formatPrice(quote.total) : 'Unavailable'}
                </span>
                <span className="text-xs text-[#5A6070]">
                  {quote ? `${formatPrice(Math.round(quote.total / totalCopies))} average per copy` : quoteError || 'Waiting for server quote'}
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
