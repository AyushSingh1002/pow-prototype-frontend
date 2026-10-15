'use client';

import React, { useState } from 'react';

export function HomeBulkSection() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    product: 'books',
    quantity: '2500',
    pages: '160',
    deadline: '14 days',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section className="py-16 sm:py-24 lg:py-28 border-t border-[#CBD0DA]" aria-label="Commercial and high-volume quote requests">
      <div className="proof-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left 5 Columns: Commercial Information & WhatsApp Direct */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-[#5A6070] block mb-2 font-mono">
                HIGH-VOLUME RUNS
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold mb-3" style={{ fontFamily: 'var(--font-headline)' }}>
                Bespoke Commercial Orders
              </h2>
              <p className="reading-text-soft text-base">
                For commercial volumes over 500 units, custom steel dies, Pantone spot PMS inks or custom carton delivery.
              </p>
            </div>

            <div className="p-5 bg-white border border-[#CBD0DA] space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0F1218] block font-mono">
                COMMERCIAL SERVICES
              </span>
              <ul className="text-xs text-[#5A6070] space-y-2 list-none p-0 m-0 leading-relaxed">
                <li>• Pre-press imposition review with physical blueline proofs</li>
                <li>• Custom FSC-certified paper weights from 80 GSM to 350 GSM</li>
                <li>• Palletized road freight to all Indian commercial hubs</li>
              </ul>
            </div>

            <div>
              <a
                href="https://wa.me/919999999999?text=Hello%20Press%20and%20Proof%20Team%2C%20I%20would%20like%20to%20request%20a%20commercial%20quote"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-proof-secondary text-sm inline-flex items-center gap-2"
              >
                Message our print specialists on WhatsApp
              </a>
            </div>
          </div>

          {/* Right 7 Columns: Form Sheet */}
          <div className="lg:col-span-7">
            <div className="proof-sheet p-6 sm:p-10 border border-[#0F1218]">
              {submitted ? (
                <div className="p-8 bg-[#E8EAEE] border border-[#0F1218] text-center space-y-3">
                  <span className="sample-stamp">Demo request received</span>
                  <h3 className="text-xl font-bold">Commercial quote draft submitted</h3>
                  <p className="reading-text-soft text-sm">
                    This is an illustrative demonstration. In production, pre-press specialists evaluate custom paper weights, physical proofing cycles and bulk freight quotes.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="border-b border-[#0F1218] pb-3 mb-6 flex justify-between items-baseline">
                    <h3 className="text-lg font-bold" style={{ fontFamily: 'var(--font-headline)' }}>
                      Commercial Request Specification
                    </h3>
                    <span className="sample-stamp">Sample form</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="text-xs font-semibold text-[#0F1218] block mb-2">
                        Product type
                      </label>
                      <select
                        value={formData.product}
                        onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                        className="w-full p-2.5 bg-white border border-[#0F1218] text-sm rounded-[var(--control-radius)]"
                      >
                        <option value="books">Hardcover &amp; Paperback Books</option>
                        <option value="brochures">Folded Brochures &amp; Catalogs</option>
                        <option value="documents">Reports &amp; Academic Documents</option>
                        <option value="packaging">Custom Print Packaging</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#0F1218] block mb-2">
                        Quantity (copies)
                      </label>
                      <input
                        type="number"
                        min="500"
                        step="100"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        className="w-full p-2.5 bg-white border border-[#0F1218] text-sm rounded-[var(--control-radius)] tabular-nums"
                      >
                      </input>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#0F1218] block mb-2">
                        Estimated page count
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.pages}
                        onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                        className="w-full p-2.5 bg-white border border-[#0F1218] text-sm rounded-[var(--control-radius)] tabular-nums"
                      >
                      </input>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#0F1218] block mb-2">
                        Required turnaround
                      </label>
                      <select
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                        className="w-full p-2.5 bg-white border border-[#0F1218] text-sm rounded-[var(--control-radius)]"
                      >
                        <option value="7 days">Express (7 working days)</option>
                        <option value="14 days">Standard (14 working days)</option>
                        <option value="21 days">Flexible (21 working days)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#0F1218] block mb-2">
                      Paper stock or finishing notes
                    </label>
                    <textarea
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Specify paper GSM, foil stamping, spot UV or custom carton delivery requirements..."
                      className="w-full p-2.5 bg-white border border-[#0F1218] text-sm rounded-[var(--control-radius)]"
                    />
                  </div>

                  <button type="submit" className="btn-proof-primary py-3 px-8 text-sm">
                    Request commercial quote
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeBulkSection;
