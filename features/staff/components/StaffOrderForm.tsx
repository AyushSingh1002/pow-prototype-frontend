'use client';

import { FormEvent, useRef, useState } from 'react';
import Link from 'next/link';
import {
  createStaffOrder,
  getStaffCustomerQuotes,
  searchStaffCustomers,
  StaffCreatedOrder,
  StaffCustomer,
  StaffCustomerQuote,
} from '../../../lib/api/staff';
import { formatDate, formatPriceFromPaise } from '../../../lib/formatters';
import { useStaff } from '../../../context/StaffContext';

export function StaffOrderForm() {
  const { session, isDemoMode } = useStaff();
  const [query, setQuery] = useState('');
  const [customers, setCustomers] = useState<StaffCustomer[]>([]);
  const [customer, setCustomer] = useState<StaffCustomer | null>(null);
  const [quotes, setQuotes] = useState<StaffCustomerQuote[]>([]);
  const [quoteId, setQuoteId] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'SHIP' | 'PICKUP'>('SHIP');
  const [contact, setContact] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
  });
  const [result, setResult] = useState<StaffCreatedOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const idempotencyAttempt = useRef<{ fingerprint: string; key: string } | null>(null);

  async function handleCustomerSearch(event: FormEvent) {
    event.preventDefault();
    if (!session) return;
    setError(null);
    setResult(null);
    setCustomer(null);
    setQuotes([]);
    setQuoteId('');
    setLoadingCustomers(true);
    try {
      setCustomers(await searchStaffCustomers(session.token, query.trim()));
    } catch (requestError) {
      setError(messageFor(requestError));
    } finally {
      setLoadingCustomers(false);
    }
  }

  async function handleCustomerSelect(selected: StaffCustomer) {
    if (!session) return;
    setCustomer(selected);
    setQuotes([]);
    setQuoteId('');
    setResult(null);
    setError(null);
    setLoadingQuotes(true);
    try {
      const customerQuotes = await getStaffCustomerQuotes(session.token, selected.id);
      setQuotes(customerQuotes);
      setQuoteId(customerQuotes[0]?.id ?? '');
    } catch (requestError) {
      setError(messageFor(requestError));
    } finally {
      setLoadingQuotes(false);
    }
  }

  async function handleCreateOrder(event: FormEvent) {
    event.preventDefault();
    if (!session || !customer || !quoteId) return;
    setError(null);
    setResult(null);
    setSubmitting(true);
    const normalizedContact = deliveryMethod === 'SHIP'
      ? {
          name: contact.name.trim(),
          phone: contact.phone.replace(/\s+/g, ''),
          address: contact.address.trim(),
          city: contact.city.trim(),
          pincode: contact.pincode.trim(),
        }
      : undefined;
    const payload = {
      customerId: customer.id,
      quoteId,
      deliveryMethod,
      ...(normalizedContact ? { contact: normalizedContact } : {}),
    };
    const fingerprint = JSON.stringify(payload);
    if (idempotencyAttempt.current?.fingerprint !== fingerprint) {
      idempotencyAttempt.current = {
        fingerprint,
        key: `staff-order-${window.crypto.randomUUID()}`,
      };
    }
    try {
      setResult(await createStaffOrder(
        session.token,
        payload,
        idempotencyAttempt.current.key,
      ));
    } catch (requestError) {
      setError(messageFor(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  const selectedQuote = quotes.find((quote) => quote.id === quoteId);

  if (isDemoMode) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <p className="border border-[#0F1218] bg-white p-5 text-sm" role="status">
          Customer orders and payment links are unavailable in demo mode. No sample customer or payment link is fabricated.
        </p>
        <Link className="btn-proof-secondary mt-4 inline-flex min-h-11 items-center px-4" href="/staff">
          Back to queue
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-6 sm:px-8 sm:py-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[#0F1218] pb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#5A6070]">Press &amp; Proof / Staff</p>
          <h1 className="mt-2 text-3xl sm:text-4xl">Create customer order</h1>
          <p className="mt-2 text-sm text-[#5A6070]">Choose an existing customer quote. Pricing and payment amount are verified by the server.</p>
        </div>
        <Link className="btn-proof-secondary inline-flex min-h-11 items-center px-4" href="/staff">
          Back to queue
        </Link>
      </header>

      {error && <p className="mt-5 border border-[#C4161C] bg-[#FFF3F3] p-3 text-sm text-[#C4161C]" role="alert">{error}</p>}

      {result && (
        <section className="mt-5 border border-[#0F1218] bg-white p-5" aria-labelledby="created-order-title">
          <h2 className="text-xl font-bold" id="created-order-title">Payment link created</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-3"><dt>Order</dt><dd className="font-mono">{result.order.id}</dd></div>
            <div className="flex justify-between gap-3"><dt>Order total</dt><dd className="font-bold">{formatPriceFromPaise(result.order.total)}</dd></div>
            <div className="flex justify-between gap-3"><dt>Payment link expires</dt><dd>{formatDate(result.paymentLink.expiresAt)}</dd></div>
          </dl>
          <a
            className="btn-proof-primary mt-4 inline-flex min-h-11 items-center px-4"
            href={result.paymentLink.shortUrl}
            rel="noreferrer"
            target="_blank"
          >
            Open payment link
          </a>
          <p className="mt-3 text-sm text-[#5A6070]" role="status">
            The payment link email is queued for {customer?.email}. The order enters the production queue only after Razorpay confirms payment.
          </p>
        </section>
      )}

      <section className="mt-6 border border-[#0F1218] bg-white p-5" aria-labelledby="customer-search-title">
        <h2 className="text-lg font-bold" id="customer-search-title">1. Find customer</h2>
        <form className="mt-3 flex flex-wrap gap-3" onSubmit={(event) => void handleCustomerSearch(event)}>
          <label className="sr-only" htmlFor="staff-customer-query">Customer email or phone</label>
          <input
            className="min-h-11 min-w-0 flex-1 border border-[#0F1218] px-3"
            id="staff-customer-query"
            minLength={3}
            maxLength={80}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search email or phone"
            value={query}
          />
          <button className="btn-proof-secondary min-h-11 px-4" disabled={loadingCustomers || query.trim().length < 3} type="submit">
            {loadingCustomers ? 'Searching…' : 'Search'}
          </button>
        </form>
        {customers.length > 0 && (
          <ul className="mt-3 divide-y divide-[#CBD0DA]">
            {customers.map((candidate) => (
              <li className="py-2" key={candidate.id}>
                <button
                  className="min-h-11 w-full px-2 text-left hover:bg-[#E8EAEE]"
                  disabled={loadingQuotes}
                  onClick={() => void handleCustomerSelect(candidate)}
                  type="button"
                >
                  <span className="block font-semibold">{candidate.displayName}</span>
                  <span className="block text-xs text-[#5A6070]">{candidate.email}{candidate.phone ? ` · ${candidate.phone}` : ''}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {customers.length === 0 && !loadingCustomers && query.trim().length >= 3 && (
          <p className="mt-3 text-sm text-[#5A6070]" role="status">No customer accounts found.</p>
        )}
        {customer && (
          <p className="mt-3 border-l-4 border-[#0A95D4] bg-[#F4FAFD] p-3 text-sm">
            Selected: <strong>{customer.displayName}</strong> · {customer.email}
          </p>
        )}
      </section>

      {customer && (
        <form className="mt-6 space-y-6" onSubmit={(event) => void handleCreateOrder(event)}>
          <section className="border border-[#0F1218] bg-white p-5" aria-labelledby="quote-select-title">
            <h2 className="text-lg font-bold" id="quote-select-title">2. Select customer quote</h2>
            <p className="mt-1 text-sm text-[#5A6070]">
              Only unexpired, non-sample quotes for this account are listed. Required artwork must have passed upload checks before order creation.
            </p>
            {loadingQuotes ? (
              <p className="mt-3 text-sm" role="status">Loading customer quotes…</p>
            ) : quotes.length ? (
              <label className="mt-3 block text-sm font-semibold" htmlFor="customer-quote">
                Quote
                <select
                  className="mt-1 min-h-11 w-full border border-[#0F1218] bg-white px-3"
                  id="customer-quote"
                  onChange={(event) => setQuoteId(event.target.value)}
                  value={quoteId}
                >
                  {quotes.map((quote) => (
                    <option key={quote.id} value={quote.id}>
                      {quote.productId} · {quote.quantity} copies · {formatPriceFromPaise(quote.total)} · expires {formatDate(quote.expiresAt)}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <p className="mt-3 border-l-4 border-[#FFD60A] bg-[#FFFBE6] p-3 text-sm" role="status">
                This customer has no active production quote. Ask them to create a quote and complete any required artwork checks first.
              </p>
            )}
            {selectedQuote && (
              <div className="mt-4 border-t border-[#CBD0DA] pt-3 text-sm">
                <p className="font-semibold">Validated options</p>
                <ul className="mt-1 space-y-1 text-[#5A6070]">
                  {Object.entries(selectedQuote.validatedOptions).map(([name, value]) => (
                    <li key={name}>{name}: {value}</li>
                  ))}
                </ul>
                <ul className="mt-3 divide-y divide-[#CBD0DA]">
                  {selectedQuote.lineItems.map((item, index) => (
                    <li className="flex justify-between gap-3 py-2" key={`${item.code}-${index}`}>
                      <span>{item.description} × {item.quantity}</span>
                      <strong>{formatPriceFromPaise(item.lineTotal)}</strong>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 flex justify-between font-bold">
                  <span>Quote subtotal</span><span>{formatPriceFromPaise(selectedQuote.total)}</span>
                </p>
              </div>
            )}
          </section>

          <section className="border border-[#0F1218] bg-white p-5" aria-labelledby="delivery-title">
            <h2 className="text-lg font-bold" id="delivery-title">3. Delivery details</h2>
            <fieldset className="mt-3 flex flex-wrap gap-5 text-sm">
              <legend className="sr-only">Delivery method</legend>
              <label className="flex min-h-11 items-center gap-2">
                <input checked={deliveryMethod === 'SHIP'} name="staff-delivery-method" onChange={() => setDeliveryMethod('SHIP')} type="radio" value="SHIP" />
                Ship to customer
              </label>
              <label className="flex min-h-11 items-center gap-2">
                <input checked={deliveryMethod === 'PICKUP'} name="staff-delivery-method" onChange={() => setDeliveryMethod('PICKUP')} type="radio" value="PICKUP" />
                Pickup
              </label>
            </fieldset>
            {deliveryMethod === 'PICKUP' ? (
              <p className="mt-3 border-l-4 border-[#C4161C] bg-[#FFF3F3] p-3 text-sm" role="alert">
                Pickup cannot be submitted until an approved pickup location is configured. Select shipping for now.
              </p>
            ) : (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {([
                  ['name', 'Contact name'],
                  ['phone', 'Phone'],
                  ['address', 'Street address'],
                  ['city', 'City'],
                  ['pincode', 'PIN code'],
                ] as const).map(([key, label]) => (
                  <label className={key === 'address' ? 'sm:col-span-2' : ''} key={key}>
                    <span className="block text-xs font-semibold text-[#5A6070]">{label}</span>
                    <input
                      className="mt-1 min-h-11 w-full border border-[#0F1218] px-3 text-sm"
                      maxLength={key === 'address' ? 500 : 120}
                      onChange={(event) => setContact((current) => ({ ...current, [key]: event.target.value }))}
                      required
                      value={contact[key]}
                    />
                  </label>
                ))}
              </div>
            )}
          </section>

          <div className="flex flex-wrap items-center gap-3">
            <button
              className="btn-proof-primary min-h-11 px-5"
              disabled={submitting || loadingQuotes || !selectedQuote || deliveryMethod === 'PICKUP'}
              type="submit"
            >
              {submitting ? 'Creating order and payment link…' : 'Create order and email payment link'}
            </button>
            <p className="text-xs text-[#5A6070]">Razorpay payment links expire 24 hours after creation.</p>
          </div>
        </form>
      )}
    </main>
  );
}

function messageFor(error: unknown): string {
  return error instanceof Error ? error.message : 'The request could not be completed.';
}
