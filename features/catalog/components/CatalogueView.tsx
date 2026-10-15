'use client';

import React, { useState, useMemo } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import { Product, StorefrontPage } from '../../../types';
import { useOrderFlow } from '../../../context/OrderFlowContext';
import { ProductCard } from './ProductCard';
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

  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'default' | 'asc' | 'desc'>('default');
  const [pin, setPin] = useState('');
  const [pinMessage, setPinMessage] = useState('');

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ['All', ...Array.from(set)];
  }, [products]);

  const filtered = useMemo(() => {
    let list =
      filter === 'All'
        ? products
        : products.filter((p) => p.category.toLowerCase() === filter.toLowerCase());
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }
    if (sortOrder === 'asc') {
      list = [...list].sort((a, b) => a.sampleStartingPrice - b.sampleStartingPrice);
    } else if (sortOrder === 'desc') {
      list = [...list].sort((a, b) => b.sampleStartingPrice - a.sampleStartingPrice);
    }
    return list;
  }, [products, filter, search, sortOrder]);

  const handlePinCheck = () => {
    if (pin.length === 6 && /^\d+$/.test(pin)) {
      setPinMessage(`✓ Delivery available for PIN ${pin}: Estimated delivery in 2–3 business days`);
    } else {
      setPinMessage('Please enter a valid 6-digit Indian PIN code.');
    }
  };

  return (
    <>
      <div className="page-intro">
        <div className="breadcrumbs">
          <button onClick={() => onNavigate('home')}>Home</button>
          <ChevronRight size={13} />
          <span>Products</span>
        </div>
        <p className="eyebrow">API PRODUCT CATALOGUE</p>
        <h1>
          High-quality printing
          <br />
          for every need.
        </h1>
        <p>Browse standard and custom print products connected to our live pricing matrix.</p>
      </div>

      <main className="catalogue">
        <aside className="filters">
          <b>PRODUCT CATEGORIES</b>
          {categories.map((c) => (
            <button
              className={filter === c ? 'active' : ''}
              onClick={() => setFilter(c)}
              key={c}
            >
              <span style={{ textTransform: 'capitalize' }}>{c}</span>
              <span>
                {c === 'All'
                  ? products.length
                  : products.filter((p) => p.category.toLowerCase() === c.toLowerCase()).length}
              </span>
            </button>
          ))}

          <b className="filter-label">DELIVERY BY PIN CODE</b>
          <p style={{ color: 'var(--muted)', fontSize: 12, margin: '4px 0 8px' }}>
            Check courier lead times for your delivery area.
          </p>
          <div className="pin-input">
            <input
              placeholder="e.g. 400001"
              value={pin}
              maxLength={6}
              onChange={(e) => setPin(e.target.value)}
              aria-label="Enter PIN code"
            />
            <button onClick={handlePinCheck}>CHECK</button>
          </div>
          {pinMessage && (
            <small
              style={{
                color: pinMessage.startsWith('✓') ? 'var(--success)' : 'var(--rust)',
                marginTop: 8,
                display: 'block',
              }}
            >
              {pinMessage}
            </small>
          )}
        </aside>

        <div className="catalogue-content">
          <div className="catalogue-toolbar">
            <div className="search-input-wrapper">
              <Search size={14} />
              <input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span>{filtered.length} products found</span>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                style={{
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '6px 10px',
                  backgroundColor: 'var(--surface)',
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                }}
              >
                <option value="default">Sort: Recommended</option>
                <option value="asc">Price: Low to High</option>
                <option value="desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div
              style={{
                padding: '60px 20px',
                textAlign: 'center',
                backgroundColor: 'var(--surface)',
                borderRadius: 'var(--radius-lg)',
                marginTop: 30,
                border: '1px solid var(--line)',
              }}
            >
              <h3>No products matched your search.</h3>
              <p style={{ color: 'var(--muted)', marginTop: 8 }}>
                Try clearing filters or search terms.
              </p>
              <button
                className="btn btn-outline"
                style={{ marginTop: 16 }}
                onClick={() => {
                  setFilter('All');
                  setSearch('');
                }}
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="catalogue-grid" style={{ marginTop: 30 }}>
              {filtered.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  index={i}
                  onClick={() => {
                    onSelectProduct(p.id);
                    onNavigate('configurator');
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer onNavigate={onNavigate} />
    </>
  );
}
