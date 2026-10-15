'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Product, StorefrontPage } from '../../../../types';
import { ProductCard } from '../../../catalog/components/ProductCard';

export interface LiveCatalogueSectionProps {
  products?: Product[];
  onNavigate?: (page: StorefrontPage) => void;
  onSelectProduct?: (productId: string) => void;
  className?: string;
}

export function LiveCatalogueSection({
  products = [],
  onNavigate,
  onSelectProduct,
  className = '',
}: LiveCatalogueSectionProps) {
  return (
    <section className={`products section ${className}`.trim()}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <p className="eyebrow">LIVE CATALOGUE</p>
          <h2>Products from Backend API</h2>
        </div>
        <button
          className="btn btn-quiet"
          onClick={() => onNavigate?.('catalogue')}
        >
          View full catalogue <ArrowRight size={14} />
        </button>
      </div>
      <div className="product-grid">
        {products.map((p, i) => (
          <ProductCard
            key={p.id}
            product={p}
            index={i}
            onClick={() => {
              onSelectProduct?.(p.id);
              onNavigate?.('configurator');
            }}
          />
        ))}
      </div>
    </section>
  );
}

export default LiveCatalogueSection;
