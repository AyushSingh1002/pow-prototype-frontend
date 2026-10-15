'use client';

import React from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { DemoCheckoutResponse, StorefrontPage } from '../../../types';
import { useOrderFlow } from '../../../context/OrderFlowContext';

interface OrderConfirmationViewProps {
  orderId?: string;
  checkoutData?: DemoCheckoutResponse | null;
  interiorFile?: File | null;
  coverFile?: File | null;
  onNavigate?: (page: StorefrontPage) => void;
  onTrack?: (id: string) => void;
}

export function OrderConfirmationView({
  orderId: propOrderId,
  checkoutData: propCheckout,
  interiorFile: propInterior,
  coverFile: propCover,
  onNavigate: propNavigate,
  onTrack: propTrack,
}: OrderConfirmationViewProps) {
  const context = useOrderFlow();

  const orderId = propOrderId !== undefined ? propOrderId : context.lastOrderId;
  const checkoutData = propCheckout !== undefined ? propCheckout : context.lastCheckout;
  const interiorFile = propInterior !== undefined ? propInterior : context.interiorFile;
  const coverFile = propCover !== undefined ? propCover : context.coverFile;
  const onNavigate = propNavigate || context.navigate;
  const onTrack =
    propTrack ||
    ((id: string) => {
      context.setLastOrderId(id);
      context.navigate('tracking');
    });

  return (
    <main
      className="section"
      style={{
        minHeight: 'calc(100vh - 120px)',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div className="simple-card">
        <div className="success-icon">
          <Check size={28} />
        </div>
        <p className="eyebrow" style={{ textAlign: 'center' }}>
          ORDER CREATED IN BACKEND
        </p>
        <h1 style={{ textAlign: 'center', fontSize: 36 }}>Sample order placed!</h1>
        <p style={{ margin: '14px 0 20px', textAlign: 'center', color: 'var(--muted)' }}>
          Your draft order was created with status <code>DRAFT</code> and demo checkout transaction
          verified.
        </p>

        <div
          style={{
            backgroundColor: 'var(--paper)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-md)',
            padding: 16,
            textAlign: 'left',
            fontSize: 12,
            fontFamily: 'var(--font-mono)',
            marginBottom: 25,
          }}
        >
          <div>
            <b>Order ID:</b> {orderId}
          </div>
          {interiorFile && (
            <div style={{ marginTop: 6 }}>
              <b>Interior Document:</b> {interiorFile.name}
            </div>
          )}
          <div style={{ marginTop: 6 }}>
            <b>Cover Artwork:</b> {coverFile ? coverFile.name : 'No cover artwork uploaded'}
          </div>
          {checkoutData && (
            <>
              <div style={{ marginTop: 6 }}>
                <b>Transaction:</b> {checkoutData.transactionId}
              </div>
              <div style={{ marginTop: 6 }}>
                <b>Status:</b> {checkoutData.status} (Amount: ₹{checkoutData.amountCharged})
              </div>
              <div style={{ marginTop: 6, color: 'var(--muted)', fontSize: 10 }}>
                {checkoutData.message}
              </div>
            </>
          )}
        </div>

        <div className="tracking-line">
          <span className="done">
            <Check size={14} /> Quote verified
          </span>
          <span className="done">
            <Check size={14} /> Artwork preflight
          </span>
          <span className="done">
            <Check size={14} /> Draft order
          </span>
          <span>In production</span>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            className="btn btn-primary"
            onClick={() => {
              onTrack(orderId);
              onNavigate('tracking');
            }}
          >
            Track this order <ArrowRight size={14} />
          </button>
          <button className="btn btn-outline" onClick={() => onNavigate('home')}>
            Back to home
          </button>
        </div>
      </div>
    </main>
  );
}
