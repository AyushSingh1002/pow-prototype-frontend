'use client';

import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { Product } from '../../../types';

interface QuantitySelectorProps {
  quantity: number;
  stepNumber: number;
  product: Product;
  onChange: (qty: number) => void;
}

export function QuantitySelector({
  quantity,
  stepNumber,
  product,
  onChange,
}: QuantitySelectorProps) {
  const minQty = product.minQuantity || 1;
  const maxQty = product.maxQuantity || 5000;

  const presets = [10, 25, 50, 100, 250, 500, 1000].filter(
    (q) => q >= minQty && q <= maxQty
  );

  return (
    <div className="config-step">
      <span>
        {stepNumber}. QUANTITY (MIN {minQty} · MAX {maxQty})
      </span>
      <div className="quantity-wrapper">
        <div className="quantity">
          <button
            onClick={() => onChange(Math.max(minQty, quantity - 5))}
            disabled={quantity <= minQty}
            aria-label="Decrease quantity"
          >
            <Minus size={15} />
          </button>
          <b>{quantity}</b>
          <button
            onClick={() => onChange(Math.min(maxQty, quantity + 5))}
            disabled={quantity >= maxQty}
            aria-label="Increase quantity"
          >
            <Plus size={15} />
          </button>
          <span>Copies</span>
        </div>

        <div className="preset-chips">
          {presets.map((val) => (
            <button
              key={val}
              className={`preset-chip ${quantity === val ? 'active' : ''}`}
              onClick={() => onChange(val)}
            >
              {val} copies
            </button>
          ))}
        </div>
        <small style={{ color: 'var(--muted)', fontSize: 11 }}>
          Bulk discount tiers are automatically calculated server-side based on quantity breaks.
        </small>
      </div>
    </div>
  );
}
