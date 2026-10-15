'use client';

import React, { useEffect, useState } from 'react';
import { StorefrontPage } from '../../../types';

interface HeroPressSheetProps {
  onNavigate?: (page: StorefrontPage) => void;
  onSelectProduct?: (productId: string) => void;
}

export function HeroPressSheet({ onNavigate, onSelectProduct }: HeroPressSheetProps) {
  const [scrollY, setScrollY] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(media.matches);

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll effect 1: lifts 40px, straightens from 1.5 to 0.5deg, plates drift 0 to 4px
  const scrollRatio = Math.min(Math.max(scrollY / 500, 0), 1);
  const sheetLift = prefersReducedMotion ? 0 : scrollRatio * -40;
  const sheetRotation = prefersReducedMotion ? 1.5 : 1.5 - scrollRatio * 1.0;
  const plateDrift = prefersReducedMotion ? 0 : scrollRatio * 3.5;

  return (
    <section className="pt-10 sm:pt-16 lg:pt-20 pb-16 sm:pb-24 lg:pb-32 overflow-hidden relative">
      <div className="proof-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-10 lg:gap-x-8 items-center">
          {/* Left: 5 columns on the first row */}
          <div className="lg:col-start-1 lg:col-span-5 lg:row-start-1 z-20">
            <h1 className="mb-6 max-w-xl text-balance">
              See the price before you sign in.
            </h1>
            <p className="reading-text mb-8 max-w-lg">
              Configure a book, upload your PDF and check the proof. The estimate updates with every choice.
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <button
                className="btn-proof-primary"
                onClick={() => {
                  onSelectProduct?.('books');
                  onNavigate?.('configurator');
                }}
              >
                Configure a book
              </button>
              <button
                className="btn-proof-link text-sm cursor-pointer bg-transparent border-0 p-0"
                onClick={() => onNavigate?.('tracking')}
              >
                Track an order
              </button>
            </div>
          </div>

          {/* Right: 7 columns on the first row, with a measured overlap at the fold */}
          <div
            className="lg:col-start-6 lg:col-span-7 lg:row-start-1 z-10 flex justify-center lg:justify-end mt-4 lg:mt-0"
            style={{
              transform: `translateY(${sheetLift}px) rotate(${sheetRotation}deg)`,
              transformOrigin: 'top right',
              transition: prefersReducedMotion ? 'none' : 'transform 100ms ease-out',
            }}
          >
            <div
              className="proof-sheet p-5 sm:p-7 md:p-8 w-full max-w-[820px] min-h-[430px] sm:min-h-[560px] md:min-h-[620px] flex flex-col justify-between"
              style={{
                backgroundColor: 'var(--sheet)',
                border: '1.5px solid var(--key)',
                boxShadow: 'var(--sheet-shadow-stacked)',
              }}
            >
              {/* Header margin: Corner crop marks and slug line */}
              <div className="flex justify-between items-center text-[10px] tracking-wider text-[#5A6070] border-b border-[#0F1218] pb-2 select-none">
                <span className="font-semibold text-[#0F1218]">
                  Sample sheet · 16 pages A5 · Signature 1
                </span>
                <div className="flex items-center gap-2">
                  <span>GRIPPER EDGE (12mm)</span>
                  <span className="registration-target" title="Registration target" />
                </div>
              </div>

              {/* 16-Page Signature Imposition Matrix */}
              {/* Top row upside-down: 5, 12, 9, 8 | Bottom row: 4, 13, 16, 1 */}
              <div className="my-auto py-3 grid grid-rows-2 gap-3.5 relative">
                {/* Plate misregistration drift layer (animated on scroll or load) */}
                <svg
                  className="w-full h-full absolute inset-0 pointer-events-none"
                  viewBox="0 0 600 320"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    transform: `translate(${plateDrift}px, ${plateDrift * 0.5}px)`,
                    opacity: scrollRatio > 0.05 ? 0.35 : 0,
                    transition: 'opacity 150ms ease, transform 100ms ease-out',
                  }}
                >
                  <rect x="15" y="15" width="570" height="290" stroke="var(--cyan)" strokeWidth="1" strokeDasharray="3 3" />
                  <rect x="17" y="17" width="566" height="286" stroke="var(--magenta)" strokeWidth="1" strokeDasharray="3 3" />
                </svg>

                {/* Top Row: Pages 5, 12, 9, 8 (Upside down, rotated 180deg) */}
                <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
                  {[
                    { num: 5, title: 'Plate 5', type: 'text' },
                    { num: 12, title: 'Plate 12', type: 'image' },
                    { num: 9, title: 'Plate 9', type: 'text' },
                    { num: 8, title: 'Plate 8', type: 'image' },
                  ].map((p) => (
                    <div
                      key={p.num}
                      className="border border-[#0F1218] bg-white p-2 text-center aspect-[1/1.41] min-h-[90px] sm:min-h-[120px] flex flex-col justify-between rotate-180 select-none shadow-[1px_1px_0_0_#CBD0DA]"
                    >
                      <div className="flex justify-between text-[8px] sm:text-[9px] text-[#5A6070] font-mono">
                        <span>p.{p.num}</span>
                        <span>[+]</span>
                      </div>
                      {p.type === 'image' ? (
                        <div className="w-full h-8 sm:h-12 bg-[#E8EAEE] border border-[#0F1218] my-auto flex items-center justify-center text-[7px] sm:text-[8px] text-[#5A6070] font-mono">
                          FIG. {p.num}
                        </div>
                      ) : (
                        <div className="space-y-1.5 my-auto">
                          <div className="h-1 bg-[#0F1218] w-4/5 mx-auto" />
                          <div className="h-0.5 bg-[#5A6070] w-full" />
                          <div className="h-0.5 bg-[#5A6070] w-2/3 mx-auto" />
                        </div>
                      )}
                      <div className="text-[7px] sm:text-[8px] text-[#5A6070] font-mono">148×210</div>
                    </div>
                  ))}
                </div>

                {/* Bottom Row: Pages 4, 13, 16, 1 (Facing pairs sum to 17) */}
                <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
                  {[
                    { num: 4, title: 'Plate 4', type: 'image' },
                    { num: 13, title: 'Plate 13', type: 'text' },
                    { num: 16, title: 'Plate 16', type: 'text' },
                    { num: 1, title: 'Plate 1', type: 'title' },
                  ].map((p) => (
                    <div
                      key={p.num}
                      className="border border-[#0F1218] bg-white p-2 text-center aspect-[1/1.41] min-h-[90px] sm:min-h-[120px] flex flex-col justify-between select-none shadow-[1px_1px_0_0_#CBD0DA]"
                    >
                      <div className="flex justify-between text-[8px] sm:text-[9px] text-[#5A6070] font-mono">
                        <span>p.{p.num}</span>
                        <span>[+]</span>
                      </div>
                      {p.type === 'title' ? (
                        <div className="my-auto">
                          <div className="text-[9px] sm:text-[10px] font-bold text-[#0F1218] leading-tight">TITLE</div>
                          <div className="h-0.5 bg-[#0F1218] w-3/4 mx-auto mt-1" />
                        </div>
                      ) : p.type === 'image' ? (
                        <div className="w-full h-8 sm:h-12 bg-[#E8EAEE] border border-[#0F1218] my-auto flex items-center justify-center text-[7px] sm:text-[8px] text-[#5A6070] font-mono">
                          HALFTONE
                        </div>
                      ) : (
                        <div className="space-y-1.5 my-auto">
                          <div className="h-0.5 bg-[#5A6070] w-full" />
                          <div className="h-0.5 bg-[#5A6070] w-4/5 mx-auto" />
                          <div className="h-0.5 bg-[#5A6070] w-3/4 mx-auto" />
                        </div>
                      )}
                      <div className="text-[7px] sm:text-[8px] text-[#5A6070] font-mono">148×210</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer margin: Mid-edge registration mark, Process colour bar, Corner ticks */}
              <div className="pt-2.5 border-t border-[#0F1218] flex items-center justify-between select-none">
                <div className="flex items-center gap-2">
                  <span className="registration-target" title="Registration target" />
                  <span className="text-[9px] text-[#5A6070] font-mono">PROOF PASS 01 · PRESS 4</span>
                </div>

                <div className="flex items-center gap-1.5" aria-label="Process color calibration bar">
                  <span className="cmyk-swatch c" title="Cyan 100%" />
                  <span className="cmyk-swatch m" title="Magenta 100%" />
                  <span className="cmyk-swatch y" title="Yellow 100%" />
                  <span className="cmyk-swatch k" title="Key 100%" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroPressSheet;
