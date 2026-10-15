'use client';

import React, { useState } from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';
import {
  QuoteResponse,
  Product,
  DemoCheckoutResponse,
  StorefrontPage,
  PaymentMethod,
} from '../../../types';
import { useOrderFlow } from '../../../context/OrderFlowContext';
import { useAuth } from '../../../context/AuthContext';
import { createDraftOrder, processDemoCheckout } from '../../../lib/api';
import { money } from '../../../lib/formatters';
import { FlowStepper } from '../../../components/layout/FlowStepper';
import { Footer } from '../../../components/layout/Footer';
import { PaymentMethodSelector } from './PaymentMethodSelector';

interface CheckoutViewProps {
  quote?: QuoteResponse | null;
  product?: Product | null;
  quantity?: number;
  interiorFile?: File | null;
  coverFile?: File | null;
  currentUser?: string | null;
  onNavigate?: (page: StorefrontPage) => void;
  onOrderSuccess?: (orderId: string, checkoutData: DemoCheckoutResponse) => void;
}

export function CheckoutView({
  quote: propQuote,
  product: propProduct,
  quantity: propQuantity,
  interiorFile: propInteriorFile,
  coverFile: propCoverFile,
  currentUser: propUser,
  onNavigate: propNavigate,
  onOrderSuccess: propOrderSuccess,
}: CheckoutViewProps) {
  const context = useOrderFlow();
  const { currentUser: contextUser } = useAuth();

  const quote = propQuote !== undefined ? propQuote : context.activeQuote;
  const product = propProduct !== undefined ? propProduct : context.currentProduct;
  const quantity = propQuantity !== undefined ? propQuantity : context.activeQuantity;
  const interiorFile = propInteriorFile !== undefined ? propInteriorFile : context.interiorFile;
  const coverFile = propCoverFile !== undefined ? propCoverFile : context.coverFile;
  const currentUser = propUser !== undefined ? propUser : contextUser;
  const onNavigate = propNavigate || context.navigate;

  const onOrderSuccess =
    propOrderSuccess ||
    ((orderId, checkout) => {
      context.setLastOrderId(orderId);
      context.setLastCheckout(checkout);
    });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('demo_upi');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePlaceOrder = async () => {
    if (!quote) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const draftOrder = await createDraftOrder({
        quoteId: quote.id,
        token: currentUser || 'demo-token',
      });

      const checkout = await processDemoCheckout({
        orderId: draftOrder.id,
        paymentMethod,
      });

      onOrderSuccess(draftOrder.id, checkout);
      onNavigate('confirmation');
    } catch (err: any) {
      setError(err.message || 'Failed to place draft order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="page-intro compact">
        <div className="breadcrumbs">
          <button onClick={() => onNavigate('home')}>Home</button>
          <ChevronRight size={13} />
          <button onClick={() => onNavigate('proof')}>Proof</button>
          <ChevronRight size={13} />
          <span>Demo Checkout</span>
        </div>
        <FlowStepper activeStep={4} onNavigate={onNavigate} />
        <h1 style={{ marginTop: 24 }}>Confirm sample order</h1>
        <p>No real charges will occur. Demonstrates idempotent order creation &amp; payment stub.</p>
      </div>

      <main className="section" style={{ maxWidth: 820 }}>
        <div className="checkout-card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
            }}
          >
            <div>
              <h2 style={{ fontSize: 26, margin: 0 }}>{product?.name || 'Print Order'}</h2>
              <small style={{ color: 'var(--muted)', font: 'var(--font-mono)', fontSize: 10 }}>
                Quote ID: {quote?.id}
              </small>
            </div>
            <span className="audit-badge">₹0 Demo Checkout</span>
          </div>

          <div
            style={{
              borderTop: '1px solid var(--line)',
              borderBottom: '1px solid var(--line)',
              padding: '16px 0',
              margin: '20px 0',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 8,
                fontSize: 13,
              }}
            >
              <span>Quantity:</span>
              <b>{quantity} copies</b>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 8,
                fontSize: 13,
              }}
            >
              <span>Interior Document:</span>
              <b
                style={{
                  maxWidth: 220,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {interiorFile?.name || 'Preflight PDF'}
              </b>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 8,
                fontSize: 13,
              }}
            >
              <span>Cover Artwork:</span>
              <b
                style={{
                  maxWidth: 220,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {coverFile ? coverFile.name : 'No cover artwork uploaded'}
              </b>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 8,
                fontSize: 13,
              }}
            >
              <span>Server-Calculated Quote Total:</span>
              <b>{quote ? money(quote.total, true) : '₹0'}</b>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 14,
                color: 'var(--navy)',
              }}
            >
              <b>Amount Charged in Demo:</b>
              <b>₹0 (Simulated Demo)</b>
            </div>
          </div>

          <PaymentMethodSelector
            selectedMethod={paymentMethod}
            onSelect={setPaymentMethod}
          />

          {error && (
            <div
              style={{
                backgroundColor: 'var(--warning-bg)',
                border: '1px solid var(--warning-border)',
                color: 'var(--rust)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                marginBottom: 20,
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}

          <button
            className="btn btn-primary"
            style={{ width: '100%', padding: '16px 20px', fontSize: 12 }}
            disabled={isSubmitting || !quote}
            onClick={handlePlaceOrder}
          >
            {isSubmitting ? (
              <>Processing Order in Backend...</>
            ) : (
              <>
                Place Demo Order (Create Draft &amp; Complete Checkout){' '}
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </div>
      </main>

      <Footer onNavigate={onNavigate} />
    </>
  );
}
