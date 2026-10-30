'use client';

import React, { useEffect, useState } from 'react';
import { StorefrontPage } from '../../../types';
import { useOrderFlow } from '../../../context/OrderFlowContext';
import { useAuth } from '../../../context/AuthContext';
import { getOrder } from '../../../lib/api';
import { formatDate, formatPriceFromPaise } from '../../../lib/formatters';
import { OrderLookupResponse } from '../../../types/api.types';
import { Footer } from '../../../components/layout/Footer';
import { ProcessPath } from '../../home/components/ProcessPath';

type TrackingStation = 'upload' | 'proof' | 'print' | 'dispatch' | 'delivered';

interface DemoTrackingSample {
  station: TrackingStation;
  stage: string;
  status: string;
  layout: string;
  nextMilestone: string;
}

const demoTrackingSamples: Record<string, DemoTrackingSample> = {
  'DEMO-UPLD-1001': {
    station: 'upload',
    stage: 'Preflight inspection',
    status: 'ARTWORK RECEIVED',
    layout: 'Awaiting file verification',
    nextMilestone: 'Digital proof review',
  },
  'DEMO-PROOF-2002': {
    station: 'proof',
    stage: 'Digital proof',
    status: 'PROOF READY',
    layout: '16-Page Signature A5',
    nextMilestone: 'Print & bind',
  },
  'DEMO-PRNT-84F2': {
    station: 'print',
    stage: 'Print & bind',
    status: 'PLATE EXPOSURE VERIFIED',
    layout: '16-Page Signature A5',
    nextMilestone: 'Spine gluing & 3-knife trimmer',
  },
  'DEMO-DSPT-3003': {
    station: 'dispatch',
    stage: 'Dispatch',
    status: 'SHIPMENT DISPATCHED',
    layout: '16-Page Signature A5',
    nextMilestone: 'Delivery',
  },
  'DEMO-DLVD-4004': {
    station: 'delivered',
    stage: 'Delivered',
    status: 'DELIVERY COMPLETE',
    layout: '16-Page Signature A5',
    nextMilestone: 'No further milestones',
  },
};

type LookupResult =
  | { kind: 'found'; reference: string; sample: DemoTrackingSample }
  | { kind: 'error'; message: string }
  | null;

interface TrackingViewProps {
  initialOrderId?: string;
  onNavigate?: (page: StorefrontPage) => void;
}

export function TrackingView({
  initialOrderId: propInitialOrderId,
  onNavigate: propNavigate,
}: TrackingViewProps) {
  const { lastOrderId, navigate: contextNavigate } = useOrderFlow();
  const { currentUser, isDemoMode } = useAuth();
  const onNavigate = propNavigate || contextNavigate;

  const initialReference = propInitialOrderId || lastOrderId || (isDemoMode ? 'DEMO-PRNT-84F2' : '');
  const [inputRef, setInputRef] = useState(initialReference);
  const [productionOrder, setProductionOrder] = useState<OrderLookupResponse | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupResult, setLookupResult] = useState<LookupResult>(() => {
    const reference = initialReference.trim().toUpperCase();
    const sample = demoTrackingSamples[reference];
    return sample ? { kind: 'found', reference, sample } : null;
  });

  const handleLookup = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const reference = inputRef.trim().toUpperCase();
    setInputRef(reference);
    setLookupResult(null);
    setProductionOrder(null);

    if (!isDemoMode) {
      if (!/^[0-9A-F]{8}-[0-9A-F]{4}-[1-8][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i.test(reference)) {
        setLookupResult({ kind: 'error', message: 'Enter the order reference from your confirmation.' });
        return;
      }
      if (!currentUser) {
        setLookupResult({ kind: 'error', message: 'Sign in with the account used to place this order.' });
        return;
      }

      setIsLookingUp(true);
      try {
        setProductionOrder(await getOrder(reference, currentUser));
      } catch (error: unknown) {
        setLookupResult({
          kind: 'error',
          message: error instanceof Error ? error.message : 'Order status could not be loaded.',
        });
      } finally {
        setIsLookingUp(false);
      }
      return;
    }

    const validFormat =
      /^DEMO-(UPLD|PROOF|PRNT|DSPT|DLVD)-[A-F0-9]{4}$/.test(reference) ||
      /^[0-9A-F]{8}-[0-9A-F]{4}-[1-8][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/.test(reference);
    if (!validFormat) {
      setLookupResult({
        kind: 'error',
        message: 'Enter a demo reference (for example, DEMO-PRNT-84F2) or a valid order UUID.',
      });
      return;
    }

    const sample = demoTrackingSamples[reference];
    if (!sample) {
      setLookupResult({
        kind: 'error',
        message: 'No demo tracking record was found for that reference.',
      });
      return;
    }

    setLookupResult({ kind: 'found', reference, sample });
  };

  useEffect(() => {
    if (!isDemoMode && propInitialOrderId && currentUser) {
      void handleLookup();
    }
  }, [isDemoMode, propInitialOrderId, currentUser]);

  return (
    <div className="w-full">
      <div className="proof-container py-8 md:py-16">
        <div className="border-b border-[#0F1218] pb-4 mb-8">
          <div className="flex justify-between items-baseline flex-wrap gap-2">
            <h1>Track Order Lifecycle</h1>
            {isDemoMode && <span className="sample-stamp">Sample statuses</span>}
          </div>
          <p className="reading-text-soft text-sm mt-1">
            {isDemoMode
              ? 'Simulate real-time status transitions from digital proof verification to dispatch.'
              : 'View the latest order status recorded by the order service.'}
          </p>
        </div>

        <div className="proof-sheet p-6 md:p-8 border border-[#0F1218] bg-white max-w-xl mb-10">
          <form onSubmit={handleLookup} className="space-y-4">
            <label className="text-sm font-bold text-[#0F1218] block" style={{ fontFamily: 'var(--font-headline)' }}>
              Order reference or ticket number
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={inputRef}
                onChange={(e) => setInputRef(e.target.value)}
                placeholder={isDemoMode ? 'e.g. DEMO-PRNT-84F2' : 'Order reference'}
                className="flex-1 p-2.5 border border-[#0F1218] rounded-[var(--control-radius)] bg-white text-sm font-mono uppercase"
                aria-invalid={lookupResult?.kind === 'error'}
                aria-describedby="tracking-lookup-message"
              />
              <button type="submit" disabled={isLookingUp} className="btn-proof-primary text-xs py-2 px-6">
                Lookup status
              </button>
            </div>
            {isDemoMode ? (
              <p className="text-[11px] text-[#5A6070]">
                Try DEMO-UPLD-1001, DEMO-PROOF-2002, DEMO-PRNT-84F2, DEMO-DSPT-3003, or DEMO-DLVD-4004. These sample statuses do not represent real manufacturing or persist in a database.
              </p>
            ) : (
              <p className="text-[11px] text-[#5A6070]">
                Production status is available only to the account that placed the order.
              </p>
            )}
            <p
              id="tracking-lookup-message"
              className={`text-xs ${lookupResult?.kind === 'error' ? 'text-[#C4161C]' : 'text-[#5A6070]'}`}
              role={lookupResult?.kind === 'error' ? 'alert' : 'status'}
            >
              {lookupResult?.kind === 'error'
                ? lookupResult.message
                : isLookingUp
                  ? 'Loading order status…'
                  : lookupResult?.kind !== 'found'
                    ? 'Look up a reference to view its status.'
                  : ''}
            </p>
          </form>
        </div>

        {/* Reusable Process Path Component */}
        {lookupResult?.kind === 'found' && (
          <div className="mb-10">
            <ProcessPath fixedStation={lookupResult.sample.station} isTrackingPage={true} />
          </div>
        )}

        {/* Station Details Sheet */}
        {lookupResult?.kind === 'found' && (
          <div className="proof-sheet p-6 md:p-8 border border-[#0F1218] bg-white max-w-2xl">
            <div className="flex justify-between items-center border-b border-[#0F1218] pb-3 mb-4">
              <span className="font-bold text-base text-[#0F1218]">
                Active stage: {lookupResult.sample.stage}
              </span>
              <span className="text-xs font-mono text-[#00628F] font-semibold">
                {lookupResult.sample.status}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-[#CBD0DA]">
                <span className="text-[#5A6070]">Reference code</span>
                <span className="font-mono font-bold text-[#0F1218]">{lookupResult.reference}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#CBD0DA]">
                <span className="text-[#5A6070]">Imposition layout</span>
                <span className="font-medium text-[#0F1218]">{lookupResult.sample.layout}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#CBD0DA]">
                <span className="text-[#5A6070]">Next scheduled milestone</span>
                <span className="font-medium text-[#0F1218]">{lookupResult.sample.nextMilestone}</span>
              </div>
            </div>
          </div>
        )}

        {productionOrder && (
          <section className="proof-sheet p-6 md:p-8 border border-[#0F1218] bg-white max-w-2xl" aria-label="Production order status">
            <div className="border-b border-[#0F1218] pb-3 mb-4">
              <h2 className="text-xl font-bold">Order status</h2>
              <p className="font-mono text-sm mt-1">{productionOrder.order.id}</p>
            </div>
            <div className="flex justify-between gap-4 border-b border-[#CBD0DA] py-3 text-sm">
              <span className="text-[#5A6070]">Current status</span>
              <strong>{productionOrder.order.status.replace(/_/g, ' ')}</strong>
            </div>
            <div className="flex justify-between gap-4 border-b border-[#CBD0DA] py-3 text-sm">
              <span className="text-[#5A6070]">Order total</span>
              <strong>{formatPriceFromPaise(productionOrder.order.total)}</strong>
            </div>
            <h3 className="text-sm font-bold mt-6 mb-2">Status history</h3>
            {productionOrder.history.length ? (
              <ol className="divide-y divide-[#CBD0DA]">
                {productionOrder.history.map((entry) => (
                  <li key={entry.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
                    <span>
                      {entry.fromStatus ? `${entry.fromStatus.replace(/_/g, ' ')} → ` : ''}
                      <strong>{entry.toStatus.replace(/_/g, ' ')}</strong>
                      {entry.reason && <span className="block text-xs text-[#5A6070] mt-1">{entry.reason}</span>}
                    </span>
                    <time className="text-xs text-[#5A6070]" dateTime={entry.createdAt}>
                      {formatDate(entry.createdAt)}
                    </time>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-[#5A6070]">No status history is available yet.</p>
            )}
          </section>
        )}
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}

export default TrackingView;
