'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  claimStaffOrder,
  getStaffOrders,
  retryStaffNotification,
  FailedStaffNotification,
  StaffOrderStatus,
  StaffQueueOrder,
} from '../../../lib/api/staff';
import { formatDate } from '../../../lib/formatters';
import { useStaff } from '../../../context/StaffContext';
import { useRouter } from 'next/navigation';

const REFRESH_INTERVAL_MS = 5000;

const tabs: Array<{ status: StaffOrderStatus; label: string }> = [
  { status: 'CONFIRMED', label: 'Unclaimed' },
  { status: 'IN_PRODUCTION', label: 'In production' },
  { status: 'COMPLETED', label: 'Completed today' },
];

export function JobQueueList() {
  const { session, signOut, isDemoMode } = useStaff();
  const router = useRouter();
  const [orders, setOrders] = useState<StaffQueueOrder[]>([]);
  const [failedNotifications, setFailedNotifications] = useState<FailedStaffNotification[]>([]);
  const [status, setStatus] = useState<StaffOrderStatus>('CONFIRMED');
  const [productionScope, setProductionScope] = useState<'all' | 'mine'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [claimErrors, setClaimErrors] = useState<Record<string, string>>({});
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const loadQueue = useCallback(async () => {
    if (!session) return;
    setRefreshing(true);
    try {
      const result = await getStaffOrders(session.token);
      setOrders(result.orders);
      setFailedNotifications(result.failedNotifications);
      setLastUpdated(new Date().toISOString());
      setError(null);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [session]);

  async function handleSignOut() {
    try {
      await signOut();
      router.replace('/staff/login');
    } catch (signOutError) {
      setError(errorMessage(signOutError));
    }
  }

  async function handleRetryNotification(notification: FailedStaffNotification) {
    if (!session) return;
    setRetryingId(notification.id);
    setError(null);
    try {
      await retryStaffNotification(notification.id, session.token);
      await loadQueue();
    } catch (retryError) {
      setError(errorMessage(retryError));
    } finally {
      setRetryingId(null);
    }
  }

  useEffect(() => {
    void loadQueue();
    const interval = window.setInterval(() => void loadQueue(), REFRESH_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [loadQueue]);

  const visibleOrders = useMemo(() => orders
    .filter((order) => order.status === status)
    .filter((order) => (
      status !== 'IN_PRODUCTION' ||
      productionScope === 'all' ||
      order.assignedStaffId === session?.id
    ))
    .sort((a, b) => {
      if (a.deadline && b.deadline) {
        const deadlineOrder = a.deadline.localeCompare(b.deadline);
        if (deadlineOrder !== 0) return deadlineOrder;
      } else if (a.deadline) {
        return -1;
      } else if (b.deadline) {
        return 1;
      }
      return a.confirmedAt.localeCompare(b.confirmedAt);
    }), [orders, productionScope, session?.id, status]);

  async function handleClaim(order: StaffQueueOrder) {
    if (!session) return;
    setClaimingId(order.id);
    setClaimErrors((current) => ({ ...current, [order.id]: '' }));
    try {
      const updated = await claimStaffOrder(order.id, session.token);
      setOrders((current) => current.map((queuedOrder) => (
        queuedOrder.id === updated.id
          ? {
              ...queuedOrder,
              status: updated.status,
              assignedStaffId: updated.assignedStaffId,
              assignedStaffName: session.displayName,
            }
          : queuedOrder
      )));
      await loadQueue();
    } catch (claimError) {
      const message = errorMessage(claimError);
      setClaimErrors((current) => ({ ...current, [order.id]: message }));
      await loadQueue();
    } finally {
      setClaimingId(null);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-8 sm:py-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[#0F1218] pb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#5A6070]">Press &amp; Proof / Staff</p>
          <h1 className="mt-2 text-3xl sm:text-4xl">Production queue</h1>
          <p className="mt-2 text-sm text-[#5A6070]">Signed artwork links expire after 5 minutes.</p>
        </div>
        <div className="flex items-center gap-3 text-sm text-[#5A6070]">
          <span className="inline-flex items-center gap-2" role="status">
            <span className={`h-2 w-2 rounded-full bg-[#0A95D4] ${refreshing ? 'animate-pulse motion-reduce:animate-none' : ''}`} aria-hidden="true" />
            {refreshing ? 'Refreshing' : lastUpdated ? `Updated ${timeSince(lastUpdated)} ago` : 'Connecting'}
          </span>
          <span>{session?.displayName}</span>
          {!isDemoMode && (
            <Link className="btn-proof-primary inline-flex min-h-11 items-center px-4" href="/staff/orders/new">
              Create order
            </Link>
          )}
          <button className="btn-proof-secondary min-h-11" onClick={() => void handleSignOut()} type="button">Sign out</button>
        </div>
      </header>

      {error && <p className="mt-4 border border-[#C4161C] bg-[#FFF3F3] p-3 text-sm text-[#C4161C]" role="alert">{error}</p>}

      {session?.role === 'admin' && failedNotifications.length > 0 && (
        <section className="mt-5 border-l-4 border-[#C4161C] bg-[#FFF3F3] p-4" aria-labelledby="failed-notifications-title">
          <h2 className="text-lg" id="failed-notifications-title">Failed notifications</h2>
          <ul className="mt-2 divide-y divide-[#D8DCE3]">
            {failedNotifications.map((notification) => (
              <li className="flex flex-wrap items-center justify-between gap-3 py-2 text-sm" key={notification.id}>
                <p>Order {shortId(notification.orderId)} · {notification.eventType} · {notification.lastError ?? 'No error details'}</p>
                <button
                  className="btn-proof-secondary min-h-11"
                  disabled={retryingId === notification.id}
                  onClick={() => void handleRetryNotification(notification)}
                  type="button"
                >
                  {retryingId === notification.id ? 'Retrying…' : 'Retry'}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-6" aria-label="Production job queues">
        <nav aria-label="Queue status" className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              aria-pressed={status === tab.status}
              className={`min-h-11 border px-4 py-2 text-sm font-semibold ${status === tab.status ? 'border-[#0F1218] bg-[#0F1218] text-white' : 'border-[#5A6070] bg-[#FDFDFC] text-[#0F1218]'}`}
              key={tab.status}
              onClick={() => setStatus(tab.status)}
              type="button"
            >
              {tab.label}
              <span className="ml-2 tabular-nums">{orders.filter((order) => order.status === tab.status).length}</span>
            </button>
          ))}
        </nav>

        {status === 'IN_PRODUCTION' && (
          <div className="mt-3 flex gap-2" aria-label="In-production jobs">
            {(['all', 'mine'] as const).map((scope) => (
              <button
                aria-pressed={productionScope === scope}
                className="min-h-11 border-b-2 px-3 py-2 text-sm"
                key={scope}
                onClick={() => setProductionScope(scope)}
                type="button"
              >
                {scope === 'all' ? 'All jobs' : 'Mine'}
              </button>
            ))}
          </div>
        )}

        <div className="proof-sheet mt-4 overflow-x-auto">
          <table className="w-full min-w-[690px] border-collapse text-left text-sm">
            <thead className="border-b border-[#0F1218] bg-[#E8EAEE] text-xs uppercase tracking-wide text-[#5A6070]">
              <tr>
                <th className="px-4 py-3" scope="col">Order</th>
                <th className="px-4 py-3" scope="col">Product</th>
                <th className="px-4 py-3" scope="col">Delivery</th>
                <th className="px-4 py-3" scope="col">Confirmed</th>
                <th className="px-4 py-3" scope="col">Claimed by</th>
                <th className="px-4 py-3" scope="col"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {visibleOrders.map((order) => (
                <tr className="border-b border-[#D8DCE3] last:border-b-0" key={order.id}>
                  <td className="px-4 py-3 align-top font-mono text-xs font-semibold">{shortId(order.id)}</td>
                  <td className="px-4 py-3 align-top">
                    <p className="font-semibold">{order.productName}</p>
                    <p className="mt-1 text-xs text-[#5A6070]">{order.quantity} copies</p>
                    {order.deadline && <p className="mt-1 text-xs text-[#00628F]">Due {formatDate(order.deadline)}</p>}
                  </td>
                  <td className="px-4 py-3 align-top">{order.deliveryMethod === 'SHIP' ? 'Ship' : 'Pickup'}</td>
                  <td className="px-4 py-3 align-top">
                    <p>{formatDate(order.confirmedAt)}</p>
                    <p className="mt-1 text-xs text-[#5A6070]">{timeSince(order.confirmedAt)} ago</p>
                  </td>
                  <td className="px-4 py-3 align-top">{order.assignedStaffName ?? '—'}</td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex items-center gap-2">
                      <Link className="btn-proof-secondary min-h-11" href={`/staff/orders/${encodeURIComponent(order.id)}`}>
                        Ticket
                      </Link>
                      {order.status === 'CONFIRMED' && (
                        <button
                          className="btn-proof-primary min-h-11"
                          disabled={claimingId === order.id}
                          onClick={() => void handleClaim(order)}
                          type="button"
                        >
                          {claimingId === order.id ? 'Claiming…' : 'Claim'}
                        </button>
                      )}
                    </div>
                    {claimErrors[order.id] && (
                      <p className="mt-2 max-w-64 text-xs text-[#C4161C]" role="alert">
                        {claimErrors[order.id]}
                      </p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!visibleOrders.length && (
            <p className="p-8 text-center text-sm text-[#5A6070]">
              {loading
                ? 'Loading queue…'
                : error
                  ? 'Queue could not be loaded. Retrying automatically in 5 seconds.'
                  : 'No jobs in this queue.'}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

function shortId(id: string): string {
  return id.slice(0, 8).toUpperCase();
}

function timeSince(value: string): string {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'The staff queue request failed.';
}
