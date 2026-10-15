'use client';

import React, { useState, useMemo } from 'react';
import { Product, StorefrontPage } from '../../../types';
import { PrintingIntent } from './SentenceBuilder';

interface ProductIndexProps {
  products: Product[];
  intent: PrintingIntent;
  onNavigate?: (page: StorefrontPage) => void;
  onSelectProduct?: (productId: string) => void;
}

export function ProductIndex({
  products,
  intent,
  onNavigate,
  onSelectProduct,
}: ProductIndexProps) {
  // Re-order products according to sentence builder intent
  const orderedProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    const copy = [...products];
    if (intent === 'college') {
      return copy.sort((a, b) => {
        const order = ['saddle-stitch-booklet', 'spiral-notebook', 'books', 'flyers-leaflets'];
        const aIndex = order.indexOf(a.id);
        const bIndex = order.indexOf(b.id);
        return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
      });
    } else if (intent === 'business') {
      return copy.sort((a, b) => {
        const order = ['business-cards', 'folded-brochure', 'die-cut-stickers', 'books'];
        const aIndex = order.indexOf(a.id);
        const bIndex = order.indexOf(b.id);
        return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
      });
    } else {
      // author
      return copy.sort((a, b) => {
        const order = ['books', 'hardcover-journal', 'saddle-stitch-booklet', 'business-cards'];
        const aIndex = order.indexOf(a.id);
        const bIndex = order.indexOf(b.id);
        return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
      });
    }
  }, [products, intent]);

  const [activeProductId, setActiveProductId] = useState<string>(
    orderedProducts[0]?.id || 'books'
  );

  const activeProduct =
    orderedProducts.find((p) => p.id === activeProductId) || orderedProducts[0];

  const formatPrice = (paiseOrRupees: number) => {
    // If backend returns paise, divide by 100, else standard
    const inr = paiseOrRupees > 5000 ? Math.round(paiseOrRupees / 100) : paiseOrRupees;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(inr);
  };

  return (
    <section className="py-16 sm:py-24 lg:py-32" aria-label="Available print catalogue index">
      <div className="proof-container">
        <div className="border-b border-[#0F1218] pb-5 mb-10 flex justify-between items-end flex-wrap gap-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-[#5A6070] block mb-2 font-mono">
              SPECIFICATION INDEX
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: 'var(--font-headline)' }}>
              Product Catalogue
            </h2>
            <p className="reading-text-soft text-base mt-2 max-w-xl">
              Select a format to review binding mechanics, paper stocks and live sample integer estimates.
            </p>
          </div>
          <button
            onClick={() => onNavigate?.('catalogue')}
            className="btn-proof-link text-sm cursor-pointer bg-transparent border-0"
          >
            Full catalogue table
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Left-aligned list of product names set large in Archivo */}
          <div className="lg:col-span-7 space-y-4">
            {orderedProducts.slice(0, 6).map((product) => {
              const isSelected = activeProduct?.id === product.id;

              return (
                <div
                  key={product.id}
                  onMouseEnter={() => setActiveProductId(product.id)}
                  onFocus={() => setActiveProductId(product.id)}
                  onClick={() => {
                    setActiveProductId(product.id);
                    onSelectProduct?.(product.id);
                    onNavigate?.('configurator');
                  }}
                  tabIndex={0}
                  role="button"
                  aria-pressed={isSelected}
                  className="p-5 sm:p-6 cursor-pointer transition-all duration-150 relative group bg-white border"
                  style={{
                    boxShadow: isSelected ? 'var(--sheet-shadow-stacked)' : 'none',
                    borderColor: isSelected ? 'var(--key)' : '#CBD0DA',
                  }}
                >
                  <div className="flex items-baseline justify-between gap-4 flex-wrap">
                    <h3
                      className="text-xl sm:text-2xl font-semibold"
                      style={{
                        fontFamily: 'var(--font-headline)',
                        color: 'var(--key)',
                      }}
                    >
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#5A6070]">Starts at</span>
                      <span className="text-sm sm:text-base font-bold tabular-nums text-[#0F1218]">
                        {formatPrice(product.sampleStartingPrice || 250)}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-[#5A6070] mt-2 leading-relaxed max-w-lg">
                    {product.description}
                  </p>

                  {/* Cyan underline drawn left to right when selected */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#0A95D4] transition-all duration-200"
                    style={{
                      transform: isSelected ? 'scaleX(1)' : 'scaleX(0)',
                      transformOrigin: 'left',
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Right Column: Fixed Interactive Preview Sheet with drawn illustration, From ₹X, and Sample price stamp */}
          <div className="lg:col-span-5 sticky top-24">
            {activeProduct && (
              <div
                className="proof-sheet p-6 sm:p-8 flex flex-col justify-between"
                style={{
                  border: '1.5px solid var(--key)',
                  backgroundColor: 'var(--sheet)',
                  boxShadow: 'var(--sheet-shadow-stacked)',
                  minHeight: '460px',
                }}
              >
                <div>
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="sample-stamp">Sample price</span>
                      <h3
                        className="text-2xl font-bold mt-3"
                        style={{ fontFamily: 'var(--font-headline)' }}
                      >
                        {activeProduct.name}
                      </h3>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs text-[#5A6070] block">Starting baseline</span>
                      <span className="text-2xl font-bold tabular-nums text-[#0F1218]">
                        {formatPrice(activeProduct.sampleStartingPrice || 250)}
                      </span>
                    </div>
                  </div>

                  {/* Drawn Silhouette Illustration */}
                  <div className="my-6 py-8 flex items-center justify-center bg-[#E8EAEE] border border-[#0F1218]">
                    <ProductSilhouette type={activeProduct.id} />
                  </div>
                </div>

                <div className="pt-4 border-t border-[#0F1218] flex items-center justify-between gap-4">
                  <span className="text-xs text-[#5A6070]">
                    Integer paise calculation
                  </span>
                  <button
                    className="btn-proof-primary"
                    onClick={() => {
                      onSelectProduct?.(activeProduct.id);
                      onNavigate?.('configurator');
                    }}
                  >
                    Configure this product
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductSilhouette({ type }: { type: string }) {
  if (type.includes('book') || type === 'books' || type.includes('journal')) {
    return (
      <svg width="140" height="150" viewBox="0 0 140 150" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="25" y="15" width="90" height="120" fill="#FDFDFC" stroke="#0F1218" strokeWidth="2" />
        <rect x="25" y="15" width="12" height="120" fill="#0F1218" />
        <line x1="45" y1="35" x2="105" y2="35" stroke="#0F1218" strokeWidth="2" />
        <line x1="45" y1="45" x2="90" y2="45" stroke="#5A6070" strokeWidth="1.5" />
        <line x1="45" y1="55" x2="80" y2="55" stroke="#5A6070" strokeWidth="1" />
        <circle cx="95" cy="115" r="8" stroke="#0A95D4" strokeWidth="1.5" />
      </svg>
    );
  } else if (type.includes('card')) {
    return (
      <svg width="150" height="100" viewBox="0 0 150 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="20" width="110" height="60" fill="#FDFDFC" stroke="#0F1218" strokeWidth="2" />
        <line x1="32" y1="35" x2="70" y2="35" stroke="#0F1218" strokeWidth="2" />
        <line x1="32" y1="45" x2="95" y2="45" stroke="#5A6070" strokeWidth="1" />
        <line x1="32" y1="52" x2="80" y2="52" stroke="#5A6070" strokeWidth="1" />
        <rect x="105" y="32" width="15" height="15" fill="#E4007C" />
      </svg>
    );
  } else if (type.includes('sticker')) {
    return (
      <svg width="130" height="130" viewBox="0 0 130 130" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="65" cy="65" r="45" fill="#FDFDFC" stroke="#0F1218" strokeWidth="2" strokeDasharray="4 4" />
        <circle cx="65" cy="65" r="38" fill="#FFD60A" stroke="#0F1218" strokeWidth="1.5" />
        <text x="65" y="70" textAnchor="middle" fill="#0F1218" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
          DIE-CUT
        </text>
      </svg>
    );
  } else {
    // brochure / flyer
    return (
      <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="25" y="20" width="45" height="100" fill="#FDFDFC" stroke="#0F1218" strokeWidth="1.5" />
        <rect x="70" y="20" width="45" height="100" fill="#F0F2F6" stroke="#0F1218" strokeWidth="1.5" />
        <line x1="35" y1="35" x2="60" y2="35" stroke="#0A95D4" strokeWidth="2" />
        <line x1="35" y1="45" x2="55" y2="45" stroke="#5A6070" strokeWidth="1" />
        <line x1="80" y1="35" x2="105" y2="35" stroke="#0F1218" strokeWidth="2" />
      </svg>
    );
  }
}

export default ProductIndex;
