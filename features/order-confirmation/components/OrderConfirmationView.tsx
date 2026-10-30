'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { StorefrontPage } from '../../../types';
import { useOrderFlow } from '../../../context/OrderFlowContext';
import { Footer } from '../../../components/layout/Footer';
import { useAuth } from '../../../context/AuthContext';
import { getOrder } from '../../../lib/api';
import { formatPriceFromPaise } from '../../../lib/formatters';

interface OrderConfirmationViewProps {
  orderId?: string;
  onNavigate?: (page: StorefrontPage) => void;
  onTrack?: (id: string) => void;
}

export function OrderConfirmationView({
  orderId: propOrderId,
  onNavigate: propNavigate,
  onTrack: propTrack,
}: OrderConfirmationViewProps) {
  const context = useOrderFlow();
  const { currentUser, isDemoMode } = useAuth();
  const [productionOrder, setProductionOrder] = useState<Awaited<ReturnType<typeof getOrder>> | null>(null);
  const [productionError, setProductionError] = useState<string | null>(null);
  const [verificationTimedOut, setVerificationTimedOut] = useState(false);
  const [verificationAttempt, setVerificationAttempt] = useState(0);

  const orderId = propOrderId !== undefined ? propOrderId : context.lastOrderId;
  const onNavigate = propNavigate || context.navigate;
  const onTrack =
    propTrack ||
    ((id: string) => {
      context.setLastOrderId(id);
      context.navigate('tracking');
    });

  // Generate an illustrative demo reference that is not stored anywhere
  const demoReference = useMemo(() => {
    return orderId || 'DEMO-PRNT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }, [orderId]);

  useEffect(() => {
    if (isDemoMode) return;
    if (!orderId || !currentUser) {
      setProductionError('Sign in to view this order, or return to checkout to try again.');
      return;
    }
    let cancelled = false;
    setProductionError(null);
    setProductionOrder(null);
    setVerificationTimedOut(false);

    const verifyPayment = async () => {
      for (let attempt = 0; attempt < 40; attempt += 1) {
        try {
          const result = await getOrder(orderId, currentUser);
          if (cancelled) return;
          setProductionOrder(result);
          if (['CONFIRMED', 'IN_PRODUCTION', 'COMPLETED', 'CANCELLED'].includes(result.order.status)) {
            return;
          }
        } catch (error: unknown) {
          if (!cancelled) {
            setProductionError(error instanceof Error ? error.message : 'Order status could not be loaded.');
          }
          return;
        }

        if (attempt < 39) {
          await new Promise((resolve) => window.setTimeout(resolve, 3000));
        }
      }
      if (!cancelled) setVerificationTimedOut(true);
    };

    void verifyPayment();
    return () => {
      cancelled = true;
    };
  }, [isDemoMode, orderId, currentUser, verificationAttempt]);

  if (!isDemoMode) {
    return (
      <div className="w-full">
        <div className="proof-container py-12 md:py-20 flex flex-col items-center">
          <div className="job-ticket-sheet proof-sheet max-w-2xl w-full p-8 md:p-12">
            <div className="border-b-2 border-dashed border-[#0F1218] pb-6 mb-8">
              <span className="sample-stamp">Production order</span>
              <h1 className="text-3xl md:text-4xl font-extrabold mt-3">
                {productionOrder && ['CONFIRMED', 'IN_PRODUCTION', 'COMPLETED'].includes(productionOrder.order.status)
                  ? 'Payment confirmed'
                  : 'Order received'}
              </h1>
              <p className="reading-text-soft text-sm mt-2">
                Payment and fulfillment status are provided by the order service.
              </p>
            </div>
            {productionError ? (
              <div className="text-sm text-[#C4161C]" role="alert">
                <p>{productionError}</p>
                <button
                  type="button"
                  className="btn-proof-secondary mt-3 px-4 py-2"
                  onClick={() => setVerificationAttempt((attempt) => attempt + 1)}
                >
                  Check status again
                </button>
              </div>
            ) : productionOrder ? (
              <div className="space-y-4 text-sm">
                <div className="flex justify-between border-b border-[#CBD0DA] py-2">
                  <span>Order reference</span><strong className="font-mono">{productionOrder.order.id}</strong>
                </div>
                <div className="flex justify-between border-b border-[#CBD0DA] py-2">
                  <span>Order status</span><strong>{productionOrder.order.status}</strong>
                </div>
                <div className="flex justify-between border-b border-[#CBD0DA] py-2">
                  <span>Payment status</span>
                  <strong>
                    {['CONFIRMED', 'IN_PRODUCTION', 'COMPLETED'].includes(productionOrder.order.status)
                      ? 'Confirmed by server'
                      : productionOrder.order.status === 'CANCELLED'
                        ? 'Not confirmed'
                        : 'Verification pending'}
                  </strong>
                </div>
                <div className="flex justify-between border-b border-[#CBD0DA] py-2">
                  <span>Total</span>
                  <strong>{formatPriceFromPaise(productionOrder.order.total)}</strong>
                </div>
                {productionOrder.order.status === 'CANCELLED' ? (
                  <p role="alert" className="text-[#C4161C]">
                    Payment was not confirmed. Contact support before trying checkout again.
                  </p>
                ) : verificationTimedOut ? (
                  <div className="space-y-3">
                    <p role="status" className="text-[#5A6070]">
                      Payment confirmation is still pending. Your order is not marked paid. Check again or contact support with the order reference above.
                    </p>
                    <button
                      type="button"
                      className="btn-proof-secondary px-4 py-2"
                      onClick={() => setVerificationAttempt((attempt) => attempt + 1)}
                    >
                      Check status again
                    </button>
                  </div>
                ) : !['CONFIRMED', 'IN_PRODUCTION', 'COMPLETED'].includes(productionOrder.order.status) && (
                  <p role="status" className="text-[#5A6070]">
                    Verifying your payment with the order service…
                  </p>
                )}
              </div>
            ) : (
              <p role="status">Loading order status…</p>
            )}
            <button className="btn-proof-secondary mt-8 py-3 px-6 text-sm" onClick={() => onNavigate('home')}>
              Back to storefront
            </button>
          </div>
        </div>
        <Footer onNavigate={onNavigate} />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="proof-container py-12 md:py-20 flex flex-col items-center">
        {/* Main Job Ticket with Pressed Demo Stamp */}
        <div className="job-ticket-sheet proof-sheet max-w-2xl w-full p-8 md:p-12 relative overflow-hidden">
          {/* Physical Impression DEMO Stamp (220ms scale 1.15 -> 1.0, blur -> sharp) */}
          <div className="absolute top-10 right-8 z-30 pointer-events-none">
            <div className="demo-impression-stamp">
              <span>DEMO</span>
              <span className="text-[10px] tracking-normal font-sans font-semibold">NOT STORED</span>
            </div>
          </div>

          <div className="border-b-2 border-dashed border-[#0F1218] pb-6 mb-8">
            <span className="sample-stamp">Simulation record</span>
            <h1 className="text-3xl md:text-4xl font-extrabold mt-3" style={{ fontFamily: 'var(--font-headline)' }}>
              Demo order placed. Nothing was ordered, charged or shipped.
            </h1>
            <p className="reading-text-soft text-sm mt-2">
              This confirmation demonstrates print shop state transitions and ticket generation.
            </p>
          </div>

          {/* Ticket Body Attributes */}
          <div className="space-y-4 text-sm">
            <div className="flex justify-between py-2 border-b border-[#CBD0DA]">
              <span className="text-[#5A6070]">Demo order reference</span>
              <span className="font-bold tabular-nums text-[#0F1218] font-mono text-base">
                {demoReference}
              </span>
            </div>

            <div className="flex justify-between py-2 border-b border-[#CBD0DA]">
              <span className="text-[#5A6070]">Storage policy</span>
              <span className="text-[#0F1218] font-medium">
                Ephemeral demo session (not stored in real database)
              </span>
            </div>

            <div className="flex justify-between py-2 border-b border-[#CBD0DA]">
              <span className="text-[#5A6070]">Simulated status</span>
              <span className="font-semibold text-[#00628F]">
                Preflight verified · Ready for sample press run
              </span>
            </div>

            <div className="flex justify-between py-2 border-b border-[#CBD0DA]">
              <span className="text-[#5A6070]">Total charged</span>
              <span className="font-bold tabular-nums text-[#0F1218]">
                ₹0.00 (Zero payment collected)
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-10 pt-6 border-t-2 border-[#0F1218] flex flex-wrap items-center gap-4">
            <button
              className="btn-proof-primary py-3 px-6 text-sm"
              onClick={() => {
                onTrack(demoReference);
                onNavigate('tracking');
              }}
            >
              Track sample status
            </button>

            <button
              className="btn-proof-secondary py-3 px-6 text-sm"
              onClick={() => onNavigate('home')}
            >
              Back to storefront
            </button>
          </div>

          <div className="mt-8 pt-4 border-t border-dashed border-[#CBD0DA] text-center text-xs text-[#5A6070]">
            Independent concept redesign. Not affiliated with, endorsed by or connected to PrintOnWeb.
          </div>
        </div>
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}

export default OrderConfirmationView;
