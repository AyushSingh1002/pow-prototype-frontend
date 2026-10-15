'use client';

import React from 'react';

export type PrintingIntent = 'college' | 'business' | 'author';

interface SentenceBuilderProps {
  currentIntent: PrintingIntent;
  onIntentChange: (intent: PrintingIntent) => void;
}

export function SentenceBuilder({ currentIntent, onIntentChange }: SentenceBuilderProps) {
  const options: Array<{ id: PrintingIntent; label: string; desc: string }> = [
    { id: 'author', label: 'A book I wrote', desc: 'Novels, poetry, memoirs & photo books' },
    { id: 'business', label: 'My business', desc: 'Stationery, brochures, cards & brand packs' },
    { id: 'college', label: 'College & study', desc: 'Theses, lab manuals, reports & study guides' },
  ];

  return (
    <section className="py-14 sm:py-18 lg:py-20 border-y border-[#CBD0DA] bg-[#F2F4F7]" aria-label="Customer printing purpose selector">
      <div className="proof-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left 4 Columns: Typographic Intent Header */}
          <div className="lg:col-span-4">
            <span className="text-xs uppercase font-bold tracking-wider text-[#5A6070] block mb-2 font-mono">
              WORKFLOW SELECTION
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ fontFamily: 'var(--font-headline)' }}>
              I am printing for
            </h2>
            <p className="reading-text-soft text-sm max-w-sm">
              Tailors the catalogue order, binding mechanics and paper stocks to your exact project.
            </p>
          </div>

          {/* Right 8 Columns: 3 Wide Option Selector Tiles */}
          <div
            className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4"
            role="radiogroup"
            aria-label="Printing purpose options"
          >
            {options.map((opt) => {
              const isSelected = currentIntent === opt.id;
              return (
                <button
                  key={opt.id}
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => onIntentChange(opt.id)}
                  className={`p-5 text-left cursor-pointer transition-all duration-150 relative bg-white border ${
                    isSelected
                      ? 'border-[#0F1218] shadow-[3px_3px_0_0_#0F1218]'
                      : 'border-[#CBD0DA] hover:border-[#5A6070]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-base font-bold block"
                      style={{
                        fontFamily: 'var(--font-headline)',
                        color: isSelected ? 'var(--key)' : 'var(--key)',
                      }}
                    >
                      {opt.label}
                    </span>
                    {isSelected && (
                      <span className="w-2 h-2 bg-[#0A95D4] block shrink-0" />
                    )}
                  </div>
                  <span className="text-xs text-[#5A6070] block leading-relaxed">
                    {opt.desc}
                  </span>

                  {isSelected && (
                    <>
                      <span className="absolute top-0.5 left-0.5 w-2 h-2 border-t-2 border-l-2 border-[#0F1218] pointer-events-none" />
                      <span className="absolute top-0.5 right-0.5 w-2 h-2 border-t-2 border-r-2 border-[#0F1218] pointer-events-none" />
                      <span className="absolute bottom-0.5 left-0.5 w-2 h-2 border-b-2 border-l-2 border-[#0F1218] pointer-events-none" />
                      <span className="absolute bottom-0.5 right-0.5 w-2 h-2 border-b-2 border-r-2 border-[#0F1218] pointer-events-none" />
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default SentenceBuilder;
