'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Product } from '../../../types';
import { formatPriceFromPaise } from '../../../lib/formatters';
import { ProductVisual } from './ProductVisual';

interface ProductCardProps {
  product: Product;
  index: number;
  onClick: () => void;
}

export function ProductCard({ product, index, onClick }: ProductCardProps) {
  const visualType =
    product.id === 'books' ? 'book' : product.id === 'business-cards' ? 'card' : 'paper';

  return (
    <article className="product-card">
      <div className={`card-image tone-${index % 4}`}>
        <ProductVisual type={visualType} />
      </div>
      <div className="card-meta">
        <span className="card-group">{product.category}</span>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <div className="price-line">
          <b>From {formatPriceFromPaise(product.sampleStartingPrice)}</b>
          <small>Server sample</small>
        </div>
        <button onClick={onClick}>
          Configure &amp; see price <ArrowRight size={13} />
        </button>
      </div>
    </article>
  );
}
