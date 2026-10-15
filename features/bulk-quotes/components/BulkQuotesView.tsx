'use client';

import React, { useState } from 'react';
import { Check, ChevronRight, Send } from 'lucide-react';
import { StorefrontPage } from '../../../types';
import { useOrderFlow } from '../../../context/OrderFlowContext';
import { Footer } from '../../../components/layout/Footer';

interface BulkQuotesViewProps {
  onNavigate?: (page: StorefrontPage) => void;
}

export function BulkQuotesView({ onNavigate: propNavigate }: BulkQuotesViewProps) {
  const { navigate: contextNavigate } = useOrderFlow();
  const onNavigate = propNavigate || contextNavigate;

  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    company: '',
    name: '',
    email: '',
    phone: '',
    product: 'books',
    quantity: '2500',
    finishing: 'hardcover',
    pin: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <div className="page-intro">
        <div className="breadcrumbs">
          <button onClick={() => onNavigate('home')}>Home</button>
          <ChevronRight size={13} />
          <span>Bulk Quotes</span>
        </div>
        <p className="eyebrow">COMMERCIAL &amp; HIGH-VOLUME PRINTING</p>
        <h1>Bespoke quotes for large print runs.</h1>
        <p>
          Procuring 500 to 50,000+ copies? Dedicated account management, physical proofs, and custom
          logistics across India.
        </p>
      </div>

      <main className="section" style={{ maxWidth: 960 }}>
        {submitted ? (
          <div className="simple-card" style={{ maxWidth: 600 }}>
            <div className="success-icon">
              <Check size={28} />
            </div>
            <p className="eyebrow" style={{ textAlign: 'center' }}>
              REQUEST RECEIVED
            </p>
            <h2 style={{ textAlign: 'center', fontSize: 32 }}>Your bulk quote is being prepared</h2>
            <p style={{ textAlign: 'center', color: 'var(--muted)', margin: '14px 0 24px' }}>
              Reference <b>BQ-{Math.floor(100000 + Math.random() * 900000)}</b> registered. A
              dedicated print production manager will review your specifications and contact{' '}
              <b>{formData.email}</b> within 4 business hours.
            </p>
            <button className="btn btn-primary" onClick={() => setSubmitted(false)}>
              Submit another request
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 0.8fr',
              gap: 'var(--space-12)',
            }}
          >
            <form
              onSubmit={handleSubmit}
              className="checkout-card"
              style={{ maxWidth: '100%', margin: 0 }}
            >
              <p className="eyebrow" style={{ margin: '0 0 16px' }}>
                ESTIMATE REQUEST FORM
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      font: 'var(--font-mono)',
                      fontSize: 10,
                      marginBottom: 6,
                    }}
                  >
                    ORGANIZATION / COMPANY NAME
                  </label>
                  <input
                    required
                    placeholder="e.g. Oxford University Press India"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid var(--line)',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--surface)',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        font: 'var(--font-mono)',
                        fontSize: 10,
                        marginBottom: 6,
                      }}
                    >
                      CONTACT PERSON
                    </label>
                    <input
                      required
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        border: '1px solid var(--line)',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--surface)',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        font: 'var(--font-mono)',
                        fontSize: 10,
                        marginBottom: 6,
                      }}
                    >
                      PHONE NUMBER
                    </label>
                    <input
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        border: '1px solid var(--line)',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--surface)',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      font: 'var(--font-mono)',
                      fontSize: 10,
                      marginBottom: 6,
                    }}
                  >
                    WORK EMAIL
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="procurement@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid var(--line)',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--surface)',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        font: 'var(--font-mono)',
                        fontSize: 10,
                        marginBottom: 6,
                      }}
                    >
                      PRODUCT TYPE
                    </label>
                    <select
                      value={formData.product}
                      onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        border: '1px solid var(--line)',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--surface)',
                      }}
                    >
                      <option value="books">Books &amp; Monographs</option>
                      <option value="documents">Reports &amp; Manuals</option>
                      <option value="cards">Corporate Cards</option>
                      <option value="marketing">Flyers &amp; Catalogues</option>
                      <option value="packaging">Custom Packaging</option>
                    </select>
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        font: 'var(--font-mono)',
                        fontSize: 10,
                        marginBottom: 6,
                      }}
                    >
                      TARGET QUANTITY
                    </label>
                    <input
                      required
                      placeholder="e.g. 5,000"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        border: '1px solid var(--line)',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--surface)',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      font: 'var(--font-mono)',
                      fontSize: 10,
                      marginBottom: 6,
                    }}
                  >
                    CUSTOM SPECIFICATIONS &amp; DELIVERY DEADLINE
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Mention custom page counts, spot UV, foil stamping, FSC certified paper requirements, or specific delivery dates..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid var(--line)',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--surface)',
                    }}
                  />
                </div>

                <button
                  className="btn btn-primary"
                  type="submit"
                  style={{ padding: '14px 20px', marginTop: 10 }}
                >
                  <Send size={14} /> Submit Commercial Quote Request
                </button>
              </div>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div
                style={{
                  padding: 24,
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                <b
                  style={{
                    font: 'var(--font-serif)',
                    fontSize: 18,
                    display: 'block',
                    marginBottom: 12,
                  }}
                >
                  Commercial Volume Benefits
                </b>
                <ul
                  style={{
                    paddingLeft: 18,
                    color: 'var(--muted)',
                    fontSize: 13,
                    lineHeight: 1.8,
                    margin: 0,
                  }}
                >
                  <li>Custom quantity breaks beyond 10,000 units</li>
                  <li>Complimentary physical press proof</li>
                  <li>Split shipping to multiple offices across India</li>
                  <li>GST e-invoicing &amp; 30-day corporate credit terms</li>
                  <li>FSC certified &amp; archival paper sourcing</li>
                </ul>
              </div>

              <div
                style={{
                  padding: 24,
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                <b
                  style={{
                    font: 'var(--font-serif)',
                    fontSize: 18,
                    display: 'block',
                    marginBottom: 8,
                  }}
                >
                  Urgent Tender Assistance
                </b>
                <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.6 }}>
                  Direct procurement desk:
                  <br />
                  <b>enterprise@pressandproof.in</b>
                  <br />
                  Mon–Fri · 9:00 AM – 7:00 PM IST
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer onNavigate={onNavigate} />
    </>
  );
}
