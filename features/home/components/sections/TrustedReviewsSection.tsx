'use client';

import React from 'react';
import { Skiper54 } from '../../../../components/ui/Review';

export interface TrustedReviewsSectionProps {
  className?: string;
}

export function TrustedReviewsSection({
  className = '',
}: TrustedReviewsSectionProps) {
  return (
    <section className={`section ${className}`.trim()}>
      <div className="section-heading" style={{ maxWidth: 540 }}>
        <p className="eyebrow">TRUSTED REVIEWS</p>
        <h2>What our print creators say.</h2>
      </div>
      <div className="reviews-carousel-wrapper" style={{ marginTop: 'var(--space-8)' }}>
        <Skiper54 />
      </div>
    </section>
  );
}

export default TrustedReviewsSection;
