'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { StorefrontPage } from '../../../../types';
import { ProductVisual } from '../../../catalog/components/ProductVisual';

export interface HeroSectionProps {
  onNavigate?: (page: StorefrontPage) => void;
  onSelectProduct?: (productId: string) => void;
  className?: string;
}

export function HeroSection({
  onNavigate,
  onSelectProduct,
  className = '',
}: HeroSectionProps) {
  return (
    <section className={`hero ${className}`.trim()}>
      <div className="hero-copy">
        <p className="eyebrow">ONLINE PRINTING ENGINE</p>
        <h1>
          Print anything,
          <br />
          <em>see the exact price first.</em>
        </h1>
        <p className="hero-sub">
          Connected to a server-side integer pricing engine. Set your paper, binding, and quantity
          to watch live server quotes compute in real time.
        </p>
        <div className="hero-actions">
          <button
            className="btn btn-primary"
            onClick={() => {
              onSelectProduct?.('books');
              onNavigate?.('configurator');
            }}
          >
            Start a print job <ArrowRight size={15} />
          </button>
          <button className="btn btn-outline" onClick={() => onNavigate?.('tracking')}>
            Track an order
          </button>
        </div>
      </div>
      <div className="hero-art">
        <div className="sun" />
        <ProductVisual type="book" />
        <span className="art-note note-one">A5 / 120 pages</span>
        <span className="art-note note-two">Server calculated</span>
        <div className="hero-estimate">
          <span>LIVE SERVER ESTIMATE</span>
          <strong>₹2,631</strong>
          <small>10 books · A5 · paperback</small>
          <i>Minor unit integer quote</i>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
