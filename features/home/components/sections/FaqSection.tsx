'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface FaqItem {
  q: string;
  a: string;
}

const DEFAULT_FAQS: FaqItem[] = [
  {
    q: 'How does live server-side pricing work?',
    a: 'Unlike traditional storefronts that calculate estimated totals in client JavaScript, Press & Proof evaluates your size, paper stock, binding style, and quantity directly in a server-side pricing engine. Line items are calculated strictly in integer minor units (paise) with single-pass rounding, eliminating price discrepancies.',
  },
  {
    q: 'Can I inspect a digital proof before printing?',
    a: 'Yes. Every order goes through our automated preflight pipeline to inspect file dimensions, DPI resolution, color gamut, and bleed margins. You will review and approve a digital simulation before your draft order is submitted.',
  },
  {
    q: 'What file formats are accepted for print artwork?',
    a: 'We accept high-resolution PDFs (PDF/X-1a or PDF 1.7 recommended), TIFF, PNG, and JPEG files up to 50MB. All fonts must be embedded or outlined, with 3mm bleed margins for edge-to-edge printing.',
  },
  {
    q: 'Do you offer bulk enterprise and volume discounts?',
    a: 'Yes. Bulk tier discount brackets (5% up to 40%) are automatically factored into the live price calculation when you increase your order volume. For orders exceeding 10,000 copies, custom commercial quotes can be requested via our Bulk Quotes desk.',
  },
];

export interface FaqSectionProps {
  faqs?: FaqItem[];
  className?: string;
}

export function FaqSection({
  faqs = DEFAULT_FAQS,
  className = '',
}: FaqSectionProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <section className={`section ${className}`.trim()} style={{ paddingTop: 0 }}>
      <div className="section-heading" style={{ maxWidth: 540 }}>
        <p className="eyebrow">FREQUENTLY ASKED QUESTIONS</p>
        <h2>Clear answers to common questions.</h2>
      </div>
      <div className="faq-accordion">
        {faqs.map((faq, index) => {
          const isOpen = openFaq === index;
          return (
            <div className="faq-item" key={index}>
              <button
                type="button"
                className="faq-trigger"
                onClick={() => setOpenFaq(isOpen ? null : index)}
                aria-expanded={isOpen}
              >
                <span>{faq.q}</span>
                <ChevronDown
                  size={18}
                  style={{
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform var(--duration-fast) var(--ease)',
                    color: 'var(--muted)',
                  }}
                />
              </button>
              {isOpen && <div className="faq-content">{faq.a}</div>}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default FaqSection;
