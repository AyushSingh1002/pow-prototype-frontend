'use client';

import React from 'react';

export function SamplePoliciesSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24" aria-label="Resolution policies for print discrepancies">
      <div className="proof-container">
        <div className="pb-5 mb-9 flex justify-between items-start flex-wrap gap-6">
          <div>
            <span className="text-xs font-semibold text-[#5A6070] block mb-2">
              PRODUCTION STANDARDS
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: 'var(--font-headline)' }}>
              What happens if something is wrong
            </h2>
            <p className="reading-text-soft text-base mt-2 max-w-xl">
              Plain-language resolution standards for transit damage, trim defects or bindery variance.
            </p>
          </div>
          <span className="sample-stamp">Sample policy text</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          <div className="space-y-2.5 max-w-[38ch]">
            <h3 className="text-xl font-bold text-[#0F1218]" style={{ fontFamily: 'var(--font-headline)' }}>
              Delivery damage
            </h3>
            <p className="reading-text-soft text-sm leading-relaxed">
              If corners are crushed or parcels torn in transit, photograph the shipment within 48 hours. We reprint and dispatch the affected copies without demanding return of the damaged units.
            </p>
          </div>

          <div className="space-y-2.5 max-w-[38ch]">
            <h3 className="text-xl font-bold text-[#0F1218]" style={{ fontFamily: 'var(--font-headline)' }}>
              Trim or binding variance
            </h3>
            <p className="reading-text-soft text-sm leading-relaxed">
              If physical trim encroaches past approved safety margins or spine adhesive splits, we re-impose and reprint the run on the immediate next production shift at zero additional cost.
            </p>
          </div>

          <div className="space-y-2.5 max-w-[38ch]">
            <h3 className="text-xl font-bold text-[#0F1218]" style={{ fontFamily: 'var(--font-headline)' }}>
              Reprint or refund
            </h3>
            <p className="reading-text-soft text-sm leading-relaxed">
              When a press defect cannot be resolved by an expedited reprint within your deadline, a full refund is reversed directly to your source payment method within 3 to 5 business days.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SamplePoliciesSection;
