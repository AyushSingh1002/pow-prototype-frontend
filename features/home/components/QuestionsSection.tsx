'use client';

import React, { useState } from 'react';

interface FaqItem {
  q: string;
  a: string;
}

export function QuestionsSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const questions: FaqItem[] = [
    {
      q: 'How does server-side quote calculation work?',
      a: 'Every configuration choice—trim size, paper stock, binding style and page volume—is evaluated on a server-side pricing engine. Calculations occur in integer paise minor units with single-pass rounding, eliminating floating-point rounding discrepancies.',
    },
    {
      q: 'What preflight checks occur when uploading artwork?',
      a: 'The preflight validator inspects page dimensions, resolution DPI, bleed margins (3mm required for edge-to-edge printing), and font embedding. Issues appear as magenta proofreader annotations on your digital proof before approval.',
    },
    {
      q: 'What file format produces the most accurate print results?',
      a: 'High-resolution PDF (PDF/X-1a or PDF 1.7) with embedded fonts and CMYK colour space produces the tightest fidelity. TIFF, PNG and JPEG files are also accepted up to 50MB per upload slot.',
    },
    {
      q: 'How are bulk discounts calculated for large runs?',
      a: 'Tiered volume brackets (5% up to 40% reduction) are integrated into the server matrix. Increasing quantities automatically applies bulk discounts in real time before checkout.',
    },
  ];

  return (
    <section className="py-20 sm:py-24 lg:py-28 border-t border-[#CBD0DA]" aria-label="Frequently asked questions">
      <div className="proof-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          {/* Left 4 Columns: Typographic Headline */}
          <div className="lg:col-span-4">
            <span className="text-xs uppercase font-bold tracking-wider text-[#5A6070] block mb-2 font-mono">
              SPECIFICATIONS &amp; FAQ
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-3" style={{ fontFamily: 'var(--font-headline)' }}>
              Questions &amp; Specifications
            </h2>
            <p className="reading-text-soft text-base max-w-sm">
              Direct technical answers regarding file preflight, paper metrics, bindery tolerances and integer quotes.
            </p>
          </div>

          {/* Right 8 Columns: Clean Dividers & Newsreader Text */}
          <div className="lg:col-span-8 divide-y divide-[#CBD0DA]">
            {questions.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div key={index} className="py-6">
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full text-left flex justify-between items-center gap-6 cursor-pointer bg-transparent border-0 p-0 text-inherit group"
                    aria-expanded={isOpen}
                  >
                    <span
                      className="text-lg sm:text-xl font-semibold transition-colors group-hover:text-[#00628F]"
                      style={{
                        fontFamily: 'var(--font-headline)',
                        color: 'var(--key)',
                      }}
                    >
                      {faq.q}
                    </span>
                    <span className="text-2xl font-mono text-[#5A6070] shrink-0">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="pt-4 pr-6 sm:pr-12">
                      <p className="reading-text text-base text-[#5A6070] leading-7 max-w-2xl">
                        {faq.a}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default QuestionsSection;
