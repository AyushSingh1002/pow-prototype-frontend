'use client';

import React from 'react';
import { Building, CreditCard, QrCode } from 'lucide-react';
import { PaymentMethod } from '../../../types';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
}

export function PaymentMethodSelector({
  selectedMethod,
  onSelect,
}: PaymentMethodSelectorProps) {
  return (
    <>
      <p
        style={{
          font: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--muted)',
          margin: '20px 0 10px',
        }}
      >
        SELECT DEMO PAYMENT METHOD
      </p>
      <div className="payment-methods-grid">
        <div
          className={`payment-option-card ${selectedMethod === 'demo_upi' ? 'selected' : ''}`}
          onClick={() => onSelect('demo_upi')}
          role="button"
          tabIndex={0}
        >
          <QrCode size={20} color="var(--navy)" />
          <b>Instant UPI</b>
          <small>Simulated QR / VPA</small>
        </div>
        <div
          className={`payment-option-card ${selectedMethod === 'demo_card' ? 'selected' : ''}`}
          onClick={() => onSelect('demo_card')}
          role="button"
          tabIndex={0}
        >
          <CreditCard size={20} color="var(--navy)" />
          <b>Credit / Debit</b>
          <small>Mock payment gate</small>
        </div>
        <div
          className={`payment-option-card ${
            selectedMethod === 'demo_netbanking' ? 'selected' : ''
          }`}
          onClick={() => onSelect('demo_netbanking')}
          role="button"
          tabIndex={0}
        >
          <Building size={20} color="var(--navy)" />
          <b>Net Banking</b>
          <small>Simulated Indian banks</small>
        </div>
      </div>
    </>
  );
}
