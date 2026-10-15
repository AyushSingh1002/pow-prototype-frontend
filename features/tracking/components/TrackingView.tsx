'use client';

import React, { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { OrderLookupResponse, StorefrontPage } from '../../../types';
import { useOrderFlow } from '../../../context/OrderFlowContext';
import { useAuth } from '../../../context/AuthContext';
import { getOrder } from '../../../lib/api';
import { money } from '../../../lib/formatters';
import { Footer } from '../../../components/layout/Footer';
import { OrderAuditTimeline } from './OrderAuditTimeline';

interface TrackingViewProps {
  initialOrderId?: string;
  currentUser?: string | null;
  onNavigate?: (page: StorefrontPage) => void;
}

export function TrackingView({
  initialOrderId: propInitialOrderId,
  currentUser: propUser,
  onNavigate: propNavigate,
}: TrackingViewProps) {
  const { lastOrderId, navigate: contextNavigate } = useOrderFlow();
  const { currentUser: contextUser } = useAuth();

  const initialOrderId = propInitialOrderId !== undefined ? propInitialOrderId : lastOrderId;
  const currentUser = propUser !== undefined ? propUser : contextUser;
  const onNavigate = propNavigate || contextNavigate;

  const [orderId, setOrderId] = useState(initialOrderId || '');
  const [lookupResult, setLookupResult] = useState<OrderLookupResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async (idToSearch: string) => {
    if (!idToSearch.trim()) return;
    setLoading(true);
    setError(null);
    setLookupResult(null);

    try {
      const data = await getOrder(idToSearch.trim(), currentUser || 'demo-token');
      setLookupResult(data);
    } catch (err: any) {
      setError(err.message || 'Order not found in backend repository.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderId) {
      setOrderId(initialOrderId);
      handleLookup(initialOrderId);
    }
  }, [initialOrderId]);

  return (
    <>
      <div className="page-intro compact">
        <div className="breadcrumbs">
          <button onClick={() => onNavigate('home')}>Home</button>
          <ChevronRight size={13} />
          <span>Order Tracking</span>
        </div>
        <p className="eyebrow">AUDITABLE STATUS &amp; LIFECYCLE</p>
        <h1>Track your order</h1>
        <p>Direct query via GET /api/orders/:id with authenticated customer session.</p>
      </div>

      <main className="section" style={{ maxWidth: 840 }}>
        <div className="checkout-card" style={{ maxWidth: '100%' }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <input
              placeholder="Enter Order UUID (e.g., 550e8400-e29b-41d4-a716-446655440000)"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              style={{
                flex: 1,
                padding: '12px 14px',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                backgroundColor: 'var(--surface)',
              }}
            />
            <button
              className="btn btn-primary"
              onClick={() => handleLookup(orderId)}
              disabled={loading || !orderId.trim()}
            >
              {loading ? 'Searching...' : 'Track'}
            </button>
          </div>

          {error && (
            <div
              style={{
                backgroundColor: 'var(--warning-bg)',
                border: '1px solid var(--warning-border)',
                color: 'var(--rust)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}

          {lookupResult && (
            <div style={{ marginTop: 25 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <span className="eyebrow" style={{ margin: 0 }}>
                    ORDER RECORD
                  </span>
                  <h3 style={{ margin: '6px 0 0', fontSize: 24 }}>
                    Status: <span style={{ color: 'var(--navy)' }}>{lookupResult.order.status}</span>
                  </h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 11, color: 'var(--muted)', display: 'block' }}>
                    Total Amount
                  </span>
                  <b style={{ fontSize: 22, fontFamily: 'var(--font-serif)' }}>
                    {money(lookupResult.order.total, true)}
                  </b>
                </div>
              </div>

              <div
                style={{
                  margin: '20px 0',
                  padding: 14,
                  backgroundColor: 'var(--paper)',
                  borderRadius: 'var(--radius-md)',
                  font: 'var(--font-mono)',
                  fontSize: 11,
                  border: '1px solid var(--line)',
                }}
              >
                <div>
                  <b>Customer ID:</b> {lookupResult.order.customerId}
                </div>
                <div style={{ marginTop: 4 }}>
                  <b>Created At:</b> {new Date(lookupResult.order.createdAt).toLocaleString()}
                </div>
                <div style={{ marginTop: 4 }}>
                  <b>Idempotency Key:</b> {lookupResult.order.idempotencyKey}
                </div>
                <div style={{ marginTop: 4 }}>
                  <b>Quote Binding:</b> {lookupResult.order.quoteId}
                </div>
              </div>

              <OrderAuditTimeline history={lookupResult.history} />
            </div>
          )}
        </div>
      </main>

      <Footer onNavigate={onNavigate} />
    </>
  );
}
