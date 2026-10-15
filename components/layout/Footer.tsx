'use client';

import React from 'react';
import { useOrderFlow } from '../../context/OrderFlowContext';
import { StorefrontPage } from '../../types';

interface FooterProps {
  onNavigate?: (page: StorefrontPage) => void;
}

export function Footer({ onNavigate: propNavigate }: FooterProps) {
  const { navigate: contextNavigate } = useOrderFlow();
  const onNavigate = propNavigate || contextNavigate;

  return (
    <footer
      className="w-full mt-28 pt-16 pb-12 border-t"
      style={{
        backgroundColor: 'var(--sheet)',
        borderColor: 'var(--key)',
        color: 'var(--key)',
      }}
    >
      <div className="proof-container">
        {/* Large Type-set Site Index */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-12 pb-16">
          <div className="md:col-span-1">
            <h3
              style={{
                fontFamily: 'var(--font-headline)',
                fontWeight: 650,
                fontSize: '24px',
                letterSpacing: '-0.02em',
                marginBottom: '12px',
              }}
            >
              Press &amp; Proof
            </h3>
            <p className="reading-text-soft text-sm">
              The light-table print storefront concept. Examine proofs, evaluate bindings, and inspect sample server quotes in integer paise.
            </p>
          </div>

          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider mb-4" style={{ color: 'var(--key-soft)' }}>
              Products
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm list-none p-0 m-0">
              <li>
                <button
                  onClick={() => onNavigate('catalogue')}
                  className="hover:underline cursor-pointer bg-transparent border-0 p-0 text-left text-inherit"
                >
                  Custom books
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalogue')}
                  className="hover:underline cursor-pointer bg-transparent border-0 p-0 text-left text-inherit"
                >
                  Document printing
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalogue')}
                  className="hover:underline cursor-pointer bg-transparent border-0 p-0 text-left text-inherit"
                >
                  Marketing collateral
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalogue')}
                  className="hover:underline cursor-pointer bg-transparent border-0 p-0 text-left text-inherit"
                >
                  Visiting cards
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider mb-4" style={{ color: 'var(--key-soft)' }}>
              Journey &amp; Specs
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm list-none p-0 m-0">
              <li>
                <button
                  onClick={() => onNavigate('configurator')}
                  className="hover:underline cursor-pointer bg-transparent border-0 p-0 text-left text-inherit"
                >
                  Book configurator
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('upload')}
                  className="hover:underline cursor-pointer bg-transparent border-0 p-0 text-left text-inherit"
                >
                  Preflight upload
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('proof')}
                  className="hover:underline cursor-pointer bg-transparent border-0 p-0 text-left text-inherit"
                >
                  Proof viewer
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('tracking')}
                  className="hover:underline cursor-pointer bg-transparent border-0 p-0 text-left text-inherit"
                >
                  Track order (Sample)
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider mb-4" style={{ color: 'var(--key-soft)' }}>
              Information
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm list-none p-0 m-0">
              <li>
                <button
                  onClick={() => onNavigate('help')}
                  className="hover:underline cursor-pointer bg-transparent border-0 p-0 text-left text-inherit"
                >
                  Sample specifications
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('bulk')}
                  className="hover:underline cursor-pointer bg-transparent border-0 p-0 text-left text-inherit"
                >
                  Bulk quotes
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Independence Line and Final Process Colour Bar Rule */}
        <div className="pt-8 border-t flex flex-col md:flex-row items-start md:items-center justify-between gap-6" style={{ borderColor: 'var(--key)' }}>
          <p className="text-xs max-w-2xl" style={{ color: 'var(--key-soft)' }}>
            Independent concept redesign. Not affiliated with, endorsed by or connected to PrintOnWeb.
          </p>

          {/* Process Colour Bar as Final Rule */}
          <div className="flex items-center gap-1.5" aria-label="Process color calibration bar">
            <span className="cmyk-swatch c" title="Cyan plate" />
            <span className="cmyk-swatch m" title="Magenta plate" />
            <span className="cmyk-swatch y" title="Yellow plate" />
            <span className="cmyk-swatch k" title="Key plate" />
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
