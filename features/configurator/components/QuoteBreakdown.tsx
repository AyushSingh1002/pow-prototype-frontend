'use client';

import React, { useEffect, useState, useRef } from 'react';
import { QuoteResponse } from '../../../types';
import { formatPriceFromPaise } from '../../../lib/formatters';

interface QuoteBreakdownProps {
  quote: QuoteResponse | null;
  quantity: number;
  calculatingQuote: boolean;
  quoteError?: string | null;
  onRetry?: () => void;
  onContinue: () => void;
}

export function QuoteBreakdown({
  quote,
  quantity,
  calculatingQuote,
  quoteError,
  onRetry,
  onContinue,
}: QuoteBreakdownProps) {
  const [displayTotal, setDisplayTotal] = useState<number>(quote?.total || 0);
  const [lastValidQuote, setLastValidQuote] = useState<QuoteResponse | null>(quote);
  const [changedLineIdx, setChangedLineIdx] = useState<number | null>(null);
  const prevQuoteRef = useRef<QuoteResponse | null>(quote);

  useEffect(() => {
    if (quote) {
      setLastValidQuote(quote);

      // Check which line changed
      if (prevQuoteRef.current) {
        const changed = quote.lineItems.findIndex((li, i) => {
          const prev = prevQuoteRef.current?.lineItems[i];
          return !prev || prev.lineTotal !== li.lineTotal;
        });
        if (changed !== -1) {
          setChangedLineIdx(changed);
          const t = setTimeout(() => setChangedLineIdx(null), 1200);
          return () => clearTimeout(t);
        }
      }
      prevQuoteRef.current = quote;

      // Animate digits rolling over 400ms
      const start = displayTotal;
      const end = quote.total;
      const startTime = performance.now();
      const duration = 400;

      const animateDigits = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.round(start + (end - start) * progress);
        setDisplayTotal(current);
        if (progress < 1) {
          requestAnimationFrame(animateDigits);
        }
      };

      requestAnimationFrame(animateDigits);
    }
  }, [quote]);

  const activeQuoteToRender = quote || lastValidQuote;

  return (
    <aside className="proof-sheet p-6 border border-[#0F1218] bg-white sticky top-24">
      {/* Header with Sample price stamp */}
      <div className="flex justify-between items-center border-b border-[#0F1218] pb-4 mb-5">
        <div>
          {activeQuoteToRender && (
            <span className="sample-stamp">
              {activeQuoteToRender.isSample ? 'Sample price' : 'Production estimate'}
            </span>
          )}
          <span className="text-xs text-[#5A6070] block mt-1.5 font-medium">
            Server integer estimate
          </span>
        </div>

        {/* Loading registration target indicator */}
        {calculatingQuote && (
          <div className="flex items-center gap-2">
            <span className="registration-target animating" title="Calculating integer quote" />
            <span className="text-xs text-[#5A6070] font-mono">CALCULATING</span>
          </div>
        )}
      </div>

      {/* Error state: keeps last total, labels stale, offers retry */}
      {quoteError && (
        <div className="mb-4 p-3 bg-[#FFF3F3] border border-[#C4161C] text-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-bold text-[#C4161C]">Estimate stale</span>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="btn-proof-link text-xs cursor-pointer bg-transparent border-0"
              >
                Retry calculation
              </button>
            )}
          </div>
          <p className="text-[#5A6070]">{quoteError}</p>
        </div>
      )}

      {/* Breakdown lines */}
      <div
        className="space-y-3 transition-opacity duration-150"
        style={{ opacity: calculatingQuote ? 0.45 : 1 }}
      >
        {activeQuoteToRender ? (
          <>
            <div className="space-y-2 text-sm">
              {activeQuoteToRender.lineItems.map((li, idx) => {
                const isLineChanged = changedLineIdx === idx;

                return (
                  <div
                    key={idx}
                    className={`flex justify-between items-baseline py-1 transition-colors duration-200 ${
                      isLineChanged ? 'proof-changed bg-[#FFF0F7] px-1' : ''
                    }`}
                  >
                    <span className="text-[#5A6070]">{li.description}</span>
                    <span className="tabular-nums font-semibold text-[#0F1218]">
                      {formatPriceFromPaise(li.lineTotal)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Total Section */}
            <div className="pt-4 mt-4 border-t border-[#0F1218]">
              <div className="flex justify-between items-baseline">
                <span className="text-base font-bold text-[#0F1218]" style={{ fontFamily: 'var(--font-headline)' }}>
                  Total estimate
                </span>
                <span className="text-3xl font-extrabold tabular-nums text-[#0F1218]">
                  {formatPriceFromPaise( activeQuoteToRender.total)}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs text-[#5A6070] mt-1">
                <span>{quantity} copies</span>
                <span className="tabular-nums">
                  {formatPriceFromPaise(Math.round((displayTotal || activeQuoteToRender.total) / (quantity || 1)))} per copy
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="py-8 text-center text-sm text-[#5A6070]">
            {calculatingQuote ? 'Calculating server estimate...' : 'Select options to view live quote'}
          </div>
        )}
      </div>

      {/* Continue Action */}
      <div className="mt-6 pt-4 border-t border-[#0F1218] space-y-3">
        <button
          className="btn-proof-primary w-full py-3.5 text-sm"
          disabled={!activeQuoteToRender || calculatingQuote}
          onClick={onContinue}
        >
          Continue to upload artwork
        </button>

        <p className="text-[11px] text-[#5A6070] text-center">
          Evaluated in integer paise. No payment required in this prototype.
        </p>
      </div>
    </aside>
  );
}

export default QuoteBreakdown;
