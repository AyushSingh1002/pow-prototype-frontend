'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Product } from '../../../types';
import { formatPriceFromPaise, getProductStartingPrice } from '../../../lib/formatters';
import { ProductVisual } from './ProductVisual';

interface ProductCardProps {
  product: Product;
  index: number;
  onClick: () => void;
}

export function ProductCard({ product, index, onClick }: ProductCardProps) {
  const visualType =
    product.id === 'books' ? 'book' : product.id === 'business-cards' ? 'card' : 'paper';
  const startingPrice = getProductStartingPrice(product);

  return (
    <article className="product-card">
      <div className={`card-image tone-${index % 4}`}>
        {product.isSample
          ? <ProductVisual type={visualType} />
          : <span className="text-sm text-[#5A6070]">Product photography coming soon</span>}
      </div>
      <div className="card-meta">
        <span className="card-group">{product.category}</span>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <div className="price-line">
          <b>
            {startingPrice === null
              ? <span className="text-[#C4161C]" role="alert">Price unavailable</span>
              : `${product.isSample ? 'From ' : 'Starting at '}${formatPriceFromPaise(startingPrice)}`}
          </b>
          {product.isSample && <small>Server sample</small>}
        </div>
        <button onClick={onClick}>
          Configure &amp; see price <ArrowRight size={13} />
        </button>
      </div>
    </article>
  );
}
