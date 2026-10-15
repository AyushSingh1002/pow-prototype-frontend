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
    <footer className="footer">
      <div className="footer-top">
        <div>
          <div className="footer-mark">PRESS &amp; PROOF</div>
          <p>
            Independent concept print storefront.
            <br />
            Connected to Express.js pricing engine &amp; auditable quote service.
            <br />
            Sample estimates computed in integer paise minor units.
          </p>
        </div>
        <div className="footer-col">
          <b>Products</b>
          <button onClick={() => onNavigate('catalogue')}>Custom Books</button>
          <button onClick={() => onNavigate('catalogue')}>Document Printing</button>
          <button onClick={() => onNavigate('catalogue')}>Marketing Collateral</button>
          <button onClick={() => onNavigate('catalogue')}>Visiting Cards</button>
          <button onClick={() => onNavigate('catalogue')}>Die-Cut Stickers</button>
        </div>
        <div className="footer-col">
          <b>Pipeline &amp; Specs</b>
          <button onClick={() => onNavigate('configurator')}>Pricing Engine</button>
          <button onClick={() => onNavigate('upload')}>Preflight API</button>
          <button onClick={() => onNavigate('tracking')}>Order Tracking</button>
          <button onClick={() => onNavigate('help')}>Paper GSM Guide</button>
          <button onClick={() => onNavigate('help')}>Binding Styles</button>
        </div>
        <div className="footer-col">
          <b>Verification &amp; Help</b>
          <button onClick={() => onNavigate('help')}>Architecture Specs</button>
          <button onClick={() => onNavigate('help')}>54 Backend Tests</button>
          <button onClick={() => onNavigate('bulk')}>Bulk Estimates</button>
          <button onClick={() => onNavigate('help')}>Customer Support</button>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Press &amp; Proof. Independent concept prototype.</span>
        <span>Express Backend + Next.js Frontend · Zero client price spoofing</span>
      </div>
    </footer>
  );
}
