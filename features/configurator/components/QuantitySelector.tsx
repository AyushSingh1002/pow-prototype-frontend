'use client';

import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { Product } from '../../../types';

interface QuantitySelectorProps {
  quantity: number;
  stepNumber?: number;
  product?: Product;
  onChange: (qty: number) => void;
}

export function QuantitySelector({
  quantity,
  product,
  onChange,
}: QuantitySelectorProps) {
  const minQty = product?.minQuantity || 1;
  const maxQty = product?.maxQuantity || 5000;

  const presets = [10, 25, 50, 100, 250, 500].filter(
    (q) => q >= minQty && q <= maxQty
  );

  return (
    <div>
      <div className="flex justify-between items-baseline mb-4">
        <label className="text-base font-bold text-[#0F1218]" style={{ fontFamily: 'var(--font-headline)' }}>
          Order quantity
        </label>
        <span className="text-xs text-[#5A6070]">
          Bulk discounts factored in real time
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {/* Number Stepper */}
        <div className="inline-flex items-center border border-[#0F1218] bg-white rounded-[var(--control-radius)] p-1">
          <button
            type="button"
            onClick={() => onChange(Math.max(minQty, quantity - 5))}
            disabled={quantity <= minQty}
            className="w-8 h-8 flex items-center justify-center cursor-pointer bg-transparent border-0 hover:bg-[#E8EAEE] disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Decrease copies"
          >
            <Minus size={14} />
          </button>
          <span className="w-16 text-center font-bold text-base tabular-nums text-[#0F1218]">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => onChange(Math.min(maxQty, quantity + 5))}
            disabled={quantity >= maxQty}
            className="w-8 h-8 flex items-center justify-center cursor-pointer bg-transparent border-0 hover:bg-[#E8EAEE] disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Increase copies"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Preset options */}
        <div className="flex flex-wrap items-center gap-2">
          {presets.map((val) => {
            const isSelected = quantity === val;
            return (
              <button
                key={val}
                type="button"
                onClick={() => onChange(val)}
                className="px-3 py-1.5 text-xs font-semibold tabular-nums border cursor-pointer transition-all duration-150 rounded-[var(--control-radius)]"
                style={{
                  backgroundColor: isSelected ? 'var(--key)' : 'var(--sheet)',
                  color: isSelected ? 'var(--sheet)' : 'var(--key)',
                  borderColor: 'var(--key)',
                }}
              >
                {val} copies
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default QuantitySelector;
