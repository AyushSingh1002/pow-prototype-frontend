'use client';

import React, { useState } from 'react';
import { ChevronRight, FileText, Layers, ShieldCheck, Truck } from 'lucide-react';
import { StorefrontPage } from '../../../types';
import { useOrderFlow } from '../../../context/OrderFlowContext';
import { Footer } from '../../../components/layout/Footer';

interface HelpViewProps {
  onNavigate?: (page: StorefrontPage) => void;
}

export function HelpView({ onNavigate: propNavigate }: HelpViewProps) {
  const { navigate: contextNavigate } = useOrderFlow();
  const onNavigate = propNavigate || contextNavigate;

  const [activeTab, setActiveTab] = useState<'prep' | 'paper' | 'shipping' | 'api'>('prep');

  return (
    <>
      <div className="page-intro">
        <div className="breadcrumbs">
          <button onClick={() => onNavigate('home')}>Home</button>
          <ChevronRight size={13} />
          <span>Help &amp; Specifications</span>
        </div>
        <p className="eyebrow">PRE-PRESS DOCUMENTATION</p>
        <h1>Help Centre &amp; Print Guidelines</h1>
        <p>Artwork preparation specs, paper GSM metrics, binding styles, and technical architecture.</p>
      </div>

      <main className="section" style={{ maxWidth: 960 }}>
        <div
          style={{
            display: 'flex',
            gap: 8,
            borderBottom: '1px solid var(--line)',
            paddingBottom: 12,
            marginBottom: 30,
            flexWrap: 'wrap',
          }}
        >
          {[
            { id: 'prep', label: 'File Preparation Guide', icon: FileText },
            { id: 'paper', label: 'Paper & Binding Specs', icon: Layers },
            { id: 'shipping', label: 'Shipping & Delivery', icon: Truck },
            { id: 'api', label: 'API Architecture & Tests', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setActiveTab(tab.id as any)}
                style={{ padding: '8px 14px', fontSize: 11 }}
              >
                <Icon size={14} /> {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === 'prep' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div
              style={{
                padding: 28,
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <h2 style={{ fontSize: 24, marginBottom: 12 }}>Pre-Press File Preparation Checklist</h2>
              <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 20 }}>
                Follow these parameters to guarantee crisp printing, accurate colors, and zero
                clipping during trimming.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                <div
                  style={{
                    padding: 16,
                    backgroundColor: 'var(--paper)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--line)',
                  }}
                >
                  <b>1. Bleed Margins (3mm)</b>
                  <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 4 }}>
                    Extend all background graphics and imagery 3mm beyond the final trim line to
                    prevent white gaps during trimming.
                  </p>
                </div>
                <div
                  style={{
                    padding: 16,
                    backgroundColor: 'var(--paper)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--line)',
                  }}
                >
                  <b>2. CMYK Color Profile</b>
                  <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 4 }}>
                    Convert all RGB assets to CMYK (FOGRA39 or Coated GRACoL) before exporting to
                    avoid unexpected shifts in saturation.
                  </p>
                </div>
                <div
                  style={{
                    padding: 16,
                    backgroundColor: 'var(--paper)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--line)',
                  }}
                >
                  <b>3. Image Resolution (300 DPI)</b>
                  <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 4 }}>
                    All continuous-tone photographic images should have an effective resolution of at
                    least 300 DPI at 100% scale.
                  </p>
                </div>
                <div
                  style={{
                    padding: 16,
                    backgroundColor: 'var(--paper)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--line)',
                  }}
                >
                  <b>4. Font Embedding &amp; Outlining</b>
                  <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 4 }}>
                    Embed all font subsets in the exported PDF or convert rare typography to vector
                    curves/outlines.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'paper' && (
          <div
            style={{
              padding: 28,
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <h2 style={{ fontSize: 24, marginBottom: 16 }}>Paper Weights &amp; Binding Guide</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <b>80 GSM Natural White (Book Text)</b>
                <p style={{ color: 'var(--muted)', fontSize: 13 }}>
                  Uncoated warm book paper ideal for long-form reading, novels, and non-fiction.
                </p>
              </div>
              <div>
                <b>130 GSM Art Matte (Catalogues &amp; Photo Albums)</b>
                <p style={{ color: 'var(--muted)', fontSize: 13 }}>
                  Smooth coated paper with zero glare, delivering vivid color reproduction.
                </p>
              </div>
              <div>
                <b>350 GSM Velvet Premium Card (Visiting Cards)</b>
                <p style={{ color: 'var(--muted)', fontSize: 13 }}>
                  Rigid cardstock ideal for thermal matte lamination, spot UV, and tactile finishes.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'shipping' && (
          <div
            style={{
              padding: 28,
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <h2 style={{ fontSize: 24, marginBottom: 16 }}>Turnaround &amp; Pan-India Delivery</h2>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 20 }}>
              Orders are dispatched from our automated hubs in Mumbai, Bengaluru, and New Delhi.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <div
                style={{
                  padding: 16,
                  backgroundColor: 'var(--paper)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <b>Metro Cities</b>
                <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 4 }}>
                  1–2 business days via express air courier.
                </p>
              </div>
              <div
                style={{
                  padding: 16,
                  backgroundColor: 'var(--paper)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <b>Tier 2 &amp; 3 Hubs</b>
                <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 4 }}>
                  2–4 business days with end-to-end tracking.
                </p>
              </div>
              <div
                style={{
                  padding: 16,
                  backgroundColor: 'var(--paper)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <b>Bulk Freight</b>
                <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 4 }}>
                  Scheduled pallet delivery with lift-gate assistance.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'api' && (
          <div
            style={{
              padding: 28,
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <h2 style={{ fontSize: 24, marginBottom: 12 }}>Architecture &amp; Quality Gates</h2>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 16 }}>
              The backend prototype strictly separates computation from display to ensure
              enterprise auditability.
            </p>
            <ul
              style={{
                color: 'var(--muted)',
                fontSize: 13,
                lineHeight: 1.8,
                paddingLeft: 18,
              }}
            >
              <li>
                <b>Zero Client-Side Math:</b> All money amounts are calculated strictly in integer
                minor units (paise).
              </li>
              <li>
                <b>Single-Pass Rounding:</b> Exactly one <code>Math.round</code> applied once per
                line item calculation.
              </li>
              <li>
                <b>54 Passing Tests:</b> 100% test coverage across pricing engine, state machine,
                idempotency, and upload stubs.
              </li>
              <li>
                <b>Cryptographic Expiry:</b> Quotes expire deterministically after 30 minutes,
                preventing stale price locks.
              </li>
            </ul>
          </div>
        )}
      </main>

      <Footer onNavigate={onNavigate} />
    </>
  );
}
