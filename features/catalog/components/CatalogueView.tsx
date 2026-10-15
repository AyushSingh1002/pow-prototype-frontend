'use client';

import React, { useState, useMemo } from 'react';
import { Product, StorefrontPage } from '../../../types';
import { useOrderFlow } from '../../../context/OrderFlowContext';
import { Footer } from '../../../components/layout/Footer';

interface CatalogueViewProps {
  products?: Product[];
  onNavigate?: (page: StorefrontPage) => void;
  onSelectProduct?: (productId: string) => void;
}

export function CatalogueView({
  products: propProducts,
  onNavigate: propNavigate,
  onSelectProduct: propSelectProduct,
}: CatalogueViewProps) {
  const {
    products: contextProducts,
    navigate: contextNavigate,
    setSelectedProductId: contextSelectProduct,
  } = useOrderFlow();

  const products = propProducts || contextProducts;
  const onNavigate = propNavigate || contextNavigate;
  const onSelectProduct = propSelectProduct || contextSelectProduct;

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState<'default' | 'asc' | 'desc'>('default');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category.toLowerCase()));
    return ['all', ...Array.from(set)];
  }, [products]);

  const filtered = useMemo(() => {
    let list =
      categoryFilter === 'all'
        ? products
        : products.filter((p) => p.category.toLowerCase() === categoryFilter.toLowerCase());

    if (sortOrder === 'asc') {
      list = [...list].sort((a, b) => (a.sampleStartingPrice || 0) - (b.sampleStartingPrice || 0));
    } else if (sortOrder === 'desc') {
      list = [...list].sort((a, b) => (b.sampleStartingPrice || 0) - (a.sampleStartingPrice || 0));
    }
    return list;
  }, [products, categoryFilter, sortOrder]);

  const formatPrice = (paiseOrRupees: number) => {
    const val = paiseOrRupees > 5000 ? Math.round(paiseOrRupees / 100) : paiseOrRupees;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="w-full">
      <div className="proof-container py-8 md:py-16">
        <div className="border-b border-[#0F1218] pb-4 mb-8">
          <div className="flex justify-between items-baseline flex-wrap gap-2">
            <h1>Product Catalogue</h1>
            <span className="sample-stamp">Sample starting prices</span>
          </div>
          <p className="reading-text-soft text-sm mt-1">
            Browse standard formats, binding specifications and starting production tiers.
          </p>
        </div>

        {/* Filters written as a natural sentence & View mode toggle */}
        <div className="proof-sheet p-6 border border-[#0F1218] bg-white mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 text-sm text-[#0F1218]">
            <span>Showing</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="p-1.5 border border-[#0F1218] rounded-[var(--control-radius)] bg-white font-semibold cursor-pointer"
            >
              <option value="all">all products</option>
              {categories.filter((c) => c !== 'all').map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <span>sorted by</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="p-1.5 border border-[#0F1218] rounded-[var(--control-radius)] bg-white font-semibold cursor-pointer"
            >
              <option value="default">standard catalogue order</option>
              <option value="asc">lowest starting price</option>
              <option value="desc">highest starting price</option>
            </select>
          </div>

          <div className="inline-flex border border-[#0F1218] rounded-[var(--control-radius)] p-0.5 bg-[#E8EAEE] self-start md:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className="px-3 py-1 text-xs font-semibold cursor-pointer transition-colors"
              style={{
                backgroundColor: viewMode === 'list' ? 'var(--key)' : 'transparent',
                color: viewMode === 'list' ? 'var(--sheet)' : 'var(--key)',
              }}
            >
              List index
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className="px-3 py-1 text-xs font-semibold cursor-pointer transition-colors"
              style={{
                backgroundColor: viewMode === 'grid' ? 'var(--key)' : 'transparent',
                color: viewMode === 'grid' ? 'var(--sheet)' : 'var(--key)',
              }}
            >
              Grid tiles
            </button>
          </div>
        </div>

        {/* Content Section */}
        {filtered.length === 0 ? (
          /* Empty state */
          <div className="proof-sheet p-12 border border-[#0F1218] text-center max-w-xl mx-auto space-y-4">
            <span className="sample-stamp">Zero matches</span>
            <h3 className="text-xl font-bold">Nothing matches your filters. Clear them or ask for a custom quote.</h3>
            <p className="reading-text-soft text-sm">
              We print bespoke specifications for books, booklets, collateral and packaging beyond the standard catalogue.
            </p>
            <div className="flex justify-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => {
                  setCategoryFilter('all');
                  setSortOrder('default');
                }}
                className="btn-proof-secondary text-xs"
              >
                Clear filters
              </button>
              <button
                type="button"
                onClick={() => onNavigate('bulk')}
                className="btn-proof-primary text-xs"
              >
                Request custom quote
              </button>
            </div>
          </div>
        ) : viewMode === 'list' ? (
          /* Default View: Product Index List */
          <div className="proof-sheet border border-[#0F1218] bg-white divide-y divide-[#CBD0DA]">
            {filtered.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  onSelectProduct?.(p.id);
                  onNavigate('configurator');
                }}
                className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer hover:bg-[#F9FAFC] transition-colors group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-[#0F1218] group-hover:text-[#00628F]" style={{ fontFamily: 'var(--font-headline)' }}>
                      {p.name}
                    </h3>
                    <span className="text-[10px] text-[#5A6070] uppercase font-semibold border border-[#CBD0DA] px-2 py-0.5">
                      {p.category}
                    </span>
                  </div>
                  <p className="reading-text-soft text-sm max-w-2xl line-clamp-1">
                    {p.description}
                  </p>
                </div>

                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-right">
                    <span className="sample-stamp text-[9px] mb-1">Sample price</span>
                    <span className="text-lg font-bold tabular-nums block text-[#0F1218]">
                      From {formatPrice(p.sampleStartingPrice || 250)}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="btn-proof-secondary text-xs py-2 px-4"
                  >
                    Configure
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Optional Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  onSelectProduct?.(p.id);
                  onNavigate('configurator');
                }}
                className="proof-sheet p-6 border border-[#0F1218] bg-white flex flex-col justify-between cursor-pointer hover:border-black transition-all"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] text-[#5A6070] uppercase font-semibold border border-[#CBD0DA] px-2 py-0.5">
                      {p.category}
                    </span>
                    <span className="sample-stamp">Sample price</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#0F1218] mb-2" style={{ fontFamily: 'var(--font-headline)' }}>
                    {p.name}
                  </h3>
                  <p className="reading-text-soft text-xs line-clamp-2">
                    {p.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-[#CBD0DA] flex items-center justify-between">
                  <span className="text-base font-bold tabular-nums text-[#0F1218]">
                    From {formatPrice(p.sampleStartingPrice || 250)}
                  </span>
                  <button type="button" className="btn-proof-secondary text-xs py-1.5 px-3">
                    Configure
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}

export default CatalogueView;
