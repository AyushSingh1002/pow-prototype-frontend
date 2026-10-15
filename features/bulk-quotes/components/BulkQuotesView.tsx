'use client';

import React, { useState } from 'react';
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
    name: 'Ayush Singh',
    email: 'ayush@example.com',
    phone: '+91 98765 43210',
    product: 'books',
    quantity: '2500',
    finishing: 'hardcover',
    pin: '110001',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="w-full">
      <div className="proof-container py-8 md:py-16">
        <div className="border-b border-[#0F1218] pb-4 mb-8">
          <div className="flex justify-between items-baseline flex-wrap gap-2">
            <h1>Commercial Print Runs</h1>
            <span className="sample-stamp">Bulk quotes</span>
          </div>
          <p className="reading-text-soft text-sm mt-1">
            Procuring 500 to 50,000+ copies. Account management, physical press proofs and logistics across India.
          </p>
        </div>

        <div className="proof-sheet p-8 md:p-12 border border-[#0F1218] bg-white max-w-3xl">
          {submitted ? (
            <div className="p-8 bg-[#E8EAEE] border border-[#0F1218] text-center space-y-3">
              <span className="sample-stamp">Demo submitted</span>
              <h2 className="text-2xl font-bold">Commercial quote draft received</h2>
              <p className="reading-text-soft text-sm max-w-lg mx-auto">
                This prototype simulates bulk procurement workflows. In production, an account executive reviews custom stock, paper caliper and dispatch schedule.
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="btn-proof-secondary text-xs"
                >
                  Submit another request
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-semibold text-[#5A6070] block mb-1">
                    Company or institution
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. Ashoka University"
                    className="w-full p-2.5 border border-[#0F1218] rounded-[var(--control-radius)] bg-white text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#5A6070] block mb-1">
                    Contact name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 border border-[#0F1218] rounded-[var(--control-radius)] bg-white text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#5A6070] block mb-1">
                    Email address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 border border-[#0F1218] rounded-[var(--control-radius)] bg-white text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#5A6070] block mb-1">
                    Phone number
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 border border-[#0F1218] rounded-[var(--control-radius)] bg-white text-sm tabular-nums"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#5A6070] block mb-1">
                    Product category
                  </label>
                  <select
                    value={formData.product}
                    onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                    className="w-full p-2.5 border border-[#0F1218] rounded-[var(--control-radius)] bg-white text-sm"
                  >
                    <option value="books">Hardcover &amp; Paperback Books</option>
                    <option value="brochures">Folded Brochures &amp; Catalogues</option>
                    <option value="documents">Reports &amp; Corporate Collateral</option>
                    <option value="packaging">Custom Print Packaging</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#5A6070] block mb-1">
                    Quantity (copies)
                  </label>
                  <input
                    type="number"
                    min="500"
                    step="100"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full p-2.5 border border-[#0F1218] rounded-[var(--control-radius)] bg-white text-sm tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#5A6070] block mb-1">
                  Custom specifications and delivery deadline
                </label>
                <textarea
                  rows={4}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Detail paper GSM preferences, binding style, spot UV or foil requirements, and delivery location..."
                  className="w-full p-2.5 border border-[#0F1218] rounded-[var(--control-radius)] bg-white text-sm"
                />
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button type="submit" className="btn-proof-primary py-3 px-8 text-sm">
                  Submit commercial request
                </button>
                <a
                  href="https://wa.me/919999999999?text=Commercial%20Print%20Inquiry"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-proof-secondary py-3 px-6 text-xs"
                >
                  Message us on WhatsApp
                </a>
              </div>
            </form>
          )}
        </div>
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}

export default BulkQuotesView;
