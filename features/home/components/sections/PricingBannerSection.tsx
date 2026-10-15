'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { StorefrontPage } from '../../../../types';

export interface PricingBannerSectionProps {
  onNavigate?: (page: StorefrontPage) => void;
  onSelectProduct?: (productId: string) => void;
  className?: string;
}

export function PricingBannerSection({
  onNavigate,
  onSelectProduct,
  className = '',
}: PricingBannerSectionProps) {
  return (
    <section className={`pricing-banner ${className}`.trim()}>
      <div>
        <p className="eyebrow">INTEGRITY GUARANTEE</p>
        <h2>Pure server-side calculations. Zero rounding drift.</h2>
        <p>
          Every line item uses integer paise calculations with single-pass Math.round. Try
          altering quantities to inspect bulk tier discounts in real time.
        </p>
        <div style={{ marginTop: 24 }}>
          <button
            className="btn btn-rust"
            onClick={() => {
              onSelectProduct?.('books');
              onNavigate?.('configurator');
            }}
          >
            Launch Configurator <ArrowRight size={15} />
          </button>
        </div>
      </div>
      <div className="estimate-mini">
        <span>SERVER ESTIMATE</span>
        <strong>₹1,249</strong>
        <small>500 brochures · A4</small>
        <i>Verified sample v1</i>
      </div>
    </section>
  );
}

export default PricingBannerSection;
