'use client';

import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import {
  assignStaffOrder,
  claimStaffOrder,
  completeStaffOrder,
  flagStaffOrder,
  getStaffOrder,
  getStaffAccounts,
  releaseStaffOrder,
  StaffAccount,
  StaffOrderDetails,
} from '../../../lib/api/staff';
import { formatDate, formatPriceFromPaise } from '../../../lib/formatters';
import { useStaff } from '../../../context/StaffContext';

type ArtworkExpiry = Record<string, number>;

export function JobDetailView({ orderId }: { orderId: string }) {
  const { session } = useStaff();
  const [order, setOrder] = useState<StaffOrderDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [problemNote, setProblemNote] = useState('');
  const [staffAccounts, setStaffAccounts] = useState<StaffAccount[]>([]);
  const [reassignTo, setReassignTo] = useState('');
  const [busy, setBusy] = useState(false);
  const [artworkExpiry, setArtworkExpiry] = useState<ArtworkExpiry>({});
  const [now, setNow] = useState(Date.now());

  const refreshOrder = useCallback(async () => {
    if (!session) return;
    const latest = await getStaffOrder(orderId, session.token);
    setOrder(latest);
    setArtworkExpiry(Object.fromEntries(
      latest.artworkFiles.map((file) => [
        file.slotId,
        Date.now() + Math.max(0, file.expiresInSeconds) * 1000,
      ]),
    ));
  }, [orderId, session]);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        await refreshOrder();
        if (active) setError(null);
      } catch (loadError) {
        if (active) setError(errorMessage(loadError));
      }
    }
    void load();
    return () => { active = false; };
  }, [refreshOrder]);

  useEffect(() => {
    if (!session || session.role !== 'admin') return;
    getStaffAccounts(session.token)
      .then(setStaffAccounts)
      .catch((accountsError: unknown) => setError(errorMessage(accountsError)));
  }, [session]);

  useEffect(() => {
    if (order?.assignedStaffId) setReassignTo(order.assignedStaffId);
  }, [order?.assignedStaffId]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  async function performAction(action: 'claim' | 'release' | 'complete') {
    if (!session || !order) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const updated = action === 'claim'
        ? await claimStaffOrder(order.id, session.token)
        : action === 'release'
          ? await releaseStaffOrder(order.id, session.token)
          : await completeStaffOrder(order.id, session.token);

      setOrder((current) => current ? { ...current, ...updated } : current);
      setNotice(action === 'claim' ? 'Job claimed.' : action === 'release' ? 'Job released.' : 'Job marked complete.');
      try {
        await refreshOrder();
      } catch (refreshError) {
        setError(`The action succeeded, but the ticket could not be refreshed: ${errorMessage(refreshError)}`);
      }
    } catch (actionError) {
      setError(errorMessage(actionError));
      if (isConflict(actionError)) {
        try {
          await refreshOrder();
        } catch (refreshError) {
          setError(`${errorMessage(actionError)} The latest job state could not be loaded: ${errorMessage(refreshError)}`);
        }
      }
    } finally {
      setBusy(false);
    }
  }

  async function submitReassignment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session || !order || !reassignTo) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const updated = await assignStaffOrder(order.id, session.token, reassignTo);
      setOrder((current) => current ? { ...current, ...updated } : current);
      setNotice('Job reassigned.');
      try {
        await refreshOrder();
      } catch (refreshError) {
        setError(`The reassignment succeeded, but the ticket could not be refreshed: ${errorMessage(refreshError)}`);
      }
    } catch (assignmentError) {
      setError(errorMessage(assignmentError));
    } finally {
      setBusy(false);
    }
  }

  async function submitProblem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session || !order) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await flagStaffOrder(order.id, session.token, problemNote.trim());
      setProblemNote('');
      setNotice('Problem recorded and operations alerted.');
      try {
        await refreshOrder();
      } catch (refreshError) {
        setError(`The problem was recorded, but the ticket could not be refreshed: ${errorMessage(refreshError)}`);
      }
    } catch (problemError) {
      setError(errorMessage(problemError));
    } finally {
      setBusy(false);
    }
  }

  if (!order && !error) {
    return <main className="mx-auto max-w-5xl px-4 py-8" aria-busy="true">Loading job ticket…</main>;
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-6 sm:px-8 sm:py-8">
      <Link className="btn-proof-link min-h-11" href="/staff">← Production queue</Link>
      {error && <p className="mt-4 border border-[#C4161C] bg-[#FFF3F3] p-3 text-sm text-[#C4161C]" role="alert">{error}</p>}
      {notice && <p className="mt-4 border border-[#0A95D4] bg-white p-3 text-sm text-[#00628F]" role="status">{notice}</p>}
      {!order ? (
        <p className="proof-sheet mt-5 p-6 text-sm text-[#5A6070]">The job ticket could not be loaded.</p>
      ) : (
        <article className="proof-sheet mt-5 p-5 sm:p-7">
          <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[#0F1218] pb-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#5A6070]">Job ticket · {shortId(order.id)}</p>
              <h1 className="mt-2 text-3xl sm:text-4xl">{order.productName}</h1>
              <p className="mt-2 text-sm text-[#5A6070]">{order.quantity} copies · {order.status.replace('_', ' ')}</p>
            </div>
            <div className="text-sm sm:text-right">
              <p className="text-[#5A6070]">Confirmed</p>
              <p className="font-semibold">{formatDate(order.confirmedAt)}</p>
              {order.assignedStaffName && <p className="mt-1 text-[#5A6070]">Claimed by {order.assignedStaffName}</p>}
            </div>
          </header>

          <section className="grid gap-6 border-b border-[#D8DCE3] py-5 sm:grid-cols-2">
            <div>
              <h2 className="text-lg">Delivery</h2>
              <p className="mt-2 text-sm font-semibold">{order.deliveryMethod === 'SHIP' ? 'Ship' : 'Pickup'}</p>
              {order.deliveryMethod === 'SHIP' ? (
                order.contact ? (
                  <address className="mt-1 not-italic text-sm leading-6 text-[#5A6070]">
                    {order.contact.name}<br />
                    {order.contact.phone}<br />
                    {order.contact.address}<br />
                    {order.contact.city}, {order.contact.pincode}
                  </address>
                ) : <p className="mt-1 text-sm text-[#5A6070]">No delivery address is attached to this job.</p>
              ) : (
                <p className="reading-text-soft mt-1">The current staff order API does not provide a pickup location.</p>
              )}
            </div>
            <div>
              <h2 className="text-lg">Order total</h2>
              <p className="mt-2 text-2xl font-bold tabular-nums">{formatPriceFromPaise(order.total)}</p>
              {order.deadline && <p className="mt-2 text-sm text-[#00628F]">Due {formatDate(order.deadline)}</p>}
            </div>
          </section>

          {session?.role === 'admin' && (order.status === 'CONFIRMED' || order.status === 'IN_PRODUCTION') && (
            <form className="flex flex-wrap gap-2 border-b border-[#D8DCE3] py-5" onSubmit={(event) => void submitReassignment(event)}>
              <label className="sr-only" htmlFor="staff-assignee">Assign to staff member</label>
              <select
                className="min-h-11 min-w-0 flex-1 border border-[#5A6070] bg-white px-3 text-sm"
                id="staff-assignee"
                required
                value={reassignTo}
                onChange={(event) => setReassignTo(event.target.value)}
              >
                <option value="" disabled>Select staff member</option>
                {staffAccounts.map((account) => (
                  <option key={account.id} value={account.id}>{account.displayName} · {account.role}</option>
                ))}
              </select>
              <button className="btn-proof-secondary min-h-11" disabled={busy || !staffAccounts.length} type="submit">Reassign</button>
            </form>
          )}

          <section className="border-b border-[#D8DCE3] py-5">
            <h2 className="text-lg">Validated print options</h2>
            <dl className="mt-3 divide-y divide-[#D8DCE3]">
              {Object.entries(order.validatedOptions).map(([label, value]) => (
                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-2 text-sm" key={label}>
                  <dt className="text-[#5A6070]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
              {order.lineItems.map((item, index) => (
                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-2 text-sm" key={`${item.code}-${index}`}>
                  <dt className="text-[#5A6070]">{item.description}</dt>
                  <dd className="text-right font-semibold tabular-nums">{formatPriceFromPaise(item.lineTotal)}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="border-b border-[#D8DCE3] py-5">
            <h2 className="text-lg">Artwork</h2>
            {order.artworkFiles.length ? (
              <ul className="mt-3 space-y-2">
                {order.artworkFiles.map((file) => {
                  const secondsRemaining = Math.max(0, Math.ceil(((artworkExpiry[file.slotId] ?? now) - now) / 1000));
                  const expired = secondsRemaining === 0;
                  return (
                    <li key={file.slotId}>
                      <a
                        aria-disabled={expired}
                        className={`btn-proof-secondary min-h-11 ${expired ? 'pointer-events-none opacity-50' : ''}`}
                        href={expired ? undefined : file.signedUrl}
                        aria-label={expired
                          ? `${file.slotId} artwork link expired`
                          : `Open ${file.slotId} artwork (expires in ${countdown(secondsRemaining)})`}
                        onClick={(event) => { if (expired) event.preventDefault(); }}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {expired
                          ? `${file.slotId}: artwork link expired`
                          : `Open artwork (expires in ${countdown(secondsRemaining)})`}
                      </a>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-[#5A6070]">No scanned artwork is attached to this order.</p>
            )}
          </section>

          <section className="flex flex-wrap gap-2 border-b border-[#D8DCE3] py-5">
            {order.status === 'CONFIRMED' && (
              <button className="btn-proof-primary min-h-11" disabled={busy} onClick={() => void performAction('claim')} type="button">
                Claim job
              </button>
            )}
            {order.status === 'IN_PRODUCTION' && (order.assignedStaffId === session?.id || session?.role === 'admin') && (
              <>
                <button className="btn-proof-primary min-h-11" disabled={busy} onClick={() => void performAction('complete')} type="button">
                  Mark complete
                </button>
                <button className="btn-proof-secondary min-h-11" disabled={busy} onClick={() => void performAction('release')} type="button">
                  Release
                </button>
              </>
            )}
            {order.status === 'IN_PRODUCTION' && order.assignedStaffId !== session?.id && session?.role !== 'admin' && (
              <p className="self-center text-sm text-[#5A6070]">This job is held by {order.assignedStaffName ?? 'another staff member'}.</p>
            )}
            {order.status === 'COMPLETED' && <p className="self-center text-sm font-semibold">Completed</p>}
          </section>

          <form className="border-b border-[#D8DCE3] py-5" onSubmit={(event) => void submitProblem(event)}>
            <label className="text-lg font-semibold" htmlFor="staff-problem-note">Flag a problem</label>
            <textarea
              className="reading-text mt-3 min-h-24 w-full border border-[#5A6070] bg-white p-3"
              id="staff-problem-note"
              required
              maxLength={2000}
              value={problemNote}
              onChange={(event) => setProblemNote(event.target.value)}
              placeholder="Describe what needs attention…"
            />
            <button className="btn-proof-secondary mt-3 min-h-11" disabled={busy || !problemNote.trim()} type="submit">
              Record problem
            </button>
          </form>

          {order.notes.length > 0 && (
            <section className="pt-5">
              <h2 className="text-lg">Staff notes</h2>
              <ul className="mt-3 space-y-3">
                {order.notes.map((note) => (
                  <li className="border-l-2 border-[#E4007C] bg-[#FDFDFC] p-3" key={note.id}>
                    <p className="reading-text-soft">{note.note}</p>
                    <p className="mt-2 text-xs text-[#5A6070]">{note.staffName} · {formatDate(note.createdAt)}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>
      )}
    </main>
  );
}

function shortId(id: string): string {
  return id.slice(0, 8).toUpperCase();
}

function countdown(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'The staff order request failed.';
}

function isConflict(error: unknown): error is Error & { status: number } {
  return error instanceof Error && 'status' in error && error.status === 409;
}
