'use client';

import React from 'react';
import { StorefrontPage } from '../../../types';
import { useOrderFlow } from '../../../context/OrderFlowContext';
import { Footer } from '../../../components/layout/Footer';

interface HelpViewProps {
  onNavigate?: (page: StorefrontPage) => void;
}

export function HelpView({ onNavigate: propNavigate }: HelpViewProps) {
  const { navigate: contextNavigate } = useOrderFlow();
  const onNavigate = propNavigate || contextNavigate;

  return (
    <div className="w-full">
      <div className="proof-container py-8 md:py-16">
        <div className="border-b border-[#0F1218] pb-4 mb-8">
          <div className="flex justify-between items-baseline flex-wrap gap-2">
            <h1>Pre-Press Specifications</h1>
            <span className="sample-stamp">Sample specifications</span>
          </div>
          <p className="reading-text-soft text-sm mt-1">
            Reference metrics for bleed margins, spine thickness calculation and paper bulk densities. Every figure below is an illustrative sample.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Section 1: Artwork Geometry */}
          <div className="proof-sheet p-8 border border-[#0F1218] bg-white space-y-4">
            <span className="sample-stamp">Sample metrics</span>
            <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-headline)' }}>
              1. Bleed &amp; Safety Margins
            </h2>
            <p className="reading-text text-sm">
              All edge-to-edge artwork requires a 3.0mm external bleed allowance (sample specification). Text and critical illustrations must sit at least 5.0mm inside the trim line to prevent edge cropping during 3-knife trimming passes.
            </p>
            <div className="p-4 bg-[#E8EAEE] border border-[#0F1218] text-xs font-mono space-y-1">
              <div>A5 Trim Box: 148 × 210 mm (Sample specification)</div>
              <div>A5 Bleed Box: 154 × 216 mm (Sample specification)</div>
              <div>Resolution minimum: 300 DPI at 100% scale (Sample check)</div>
            </div>
          </div>

          {/* Section 2: Spine Thickness Matrix */}
          <div className="proof-sheet p-8 border border-[#0F1218] bg-white space-y-4">
            <span className="sample-stamp">Sample formula</span>
            <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-headline)' }}>
              2. Spine Width Calculation
            </h2>
            <p className="reading-text text-sm">
              Spine thickness in perfect bound and hardcover volumes depends on paper caliper (GSM) and page count.
            </p>
            <div className="p-4 bg-[#E8EAEE] border border-[#0F1218] text-xs font-mono space-y-1">
              <div>80 GSM Natural White: ~0.052mm per page (Sample specification)</div>
              <div>100 GSM Bond Paper: ~0.065mm per page (Sample specification)</div>
              <div>Hardcover board allowance: +3.0mm hinge add-on (Sample specification)</div>
              <div>Saddle stitch limit: Maximum 64 pages (Sample restriction)</div>
            </div>
          </div>
        </div>
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}

export default HelpView;
