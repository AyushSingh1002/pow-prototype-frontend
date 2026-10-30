'use client';

import React, { useRef, useState } from 'react';
import {
  QuoteResponse,
  Product,
  DemoCheckoutResponse,
  StorefrontPage,
} from '../../../types';
import { useOrderFlow } from '../../../context/OrderFlowContext';
import { useAuth } from '../../../context/AuthContext';
import {
  createDraftOrder,
  createPaymentOrder,
  verifyRazorpayCheckout,
  getOrder,
  processDemoCheckout,
} from '../../../lib/api';
import { formatPriceFromPaise } from '../../../lib/formatters';
import { FlowStepper } from '../../../components/layout/FlowStepper';
import { Footer } from '../../../components/layout/Footer';
import { loadRazorpayCheckout } from '../../../lib/api/razorpay';

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
  const { currentUser: contextUser, isDemoMode, authReady } = useAuth();

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

  const isDemoCheckout = isDemoMode;
  const [deliveryAddress, setDeliveryAddress] = useState({
    name: isDemoCheckout ? 'Ayush Singh' : '',
    phone: isDemoCheckout ? '+91 98765 43210' : '',
    address: isDemoCheckout ? 'Flat 402, Block B, Pre-Press Towers' : '',
    city: isDemoCheckout ? 'New Delhi' : '',
    pincode: isDemoCheckout ? '110001' : '',
  });
  const [deliveryMethod, setDeliveryMethod] = useState<'SHIP' | 'PICKUP'>('SHIP');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutCharges, setCheckoutCharges] = useState<
    Array<{ code: string; amount: number; description?: string }> | null
  >(null);
  const [paymentPending, setPaymentPending] = useState(false);
  const checkoutAttempt = useRef<{ fingerprint: string; idempotencyKey: string } | null>(null);

  const validateDeliveryAddress = (method: 'SHIP' | 'PICKUP' = 'SHIP') => {
    if (method === 'PICKUP') return null;
    const name = deliveryAddress.name.trim();
    const phone = deliveryAddress.phone.trim();
    const address = deliveryAddress.address.trim();
    const city = deliveryAddress.city.trim();
    const pincode = deliveryAddress.pincode.trim();

    if (!name || name.length < 2) {
      return 'Please enter the contact name.';
    }

    if (!/^((\+91|91|0)?[6-9]\d{9})$/.test(phone.replace(/\s+/g, ''))) {
      return 'Please enter a valid Indian mobile number.';
    }

    if (!address || address.length < 8) {
      return 'Please enter a complete delivery address.';
    }

    if (!city || city.length < 2) {
      return 'Please enter a valid city name.';
    }

    if (!/^\d{6}$/.test(pincode)) {
      return 'Please enter a valid 6-digit Indian PIN code.';
    }

    return null;
  };
  const displayCharges = checkoutCharges ?? quote?.lineItems.map((item) => ({
    code: item.code,
    amount: item.lineTotal,
    description: item.description,
  })) ?? [];

  const handlePlaceDemoOrder = async () => {
    setError(null);

    const validationError = validateDeliveryAddress('SHIP');
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      if (!quote?.id) {
        throw new Error('A valid quote is required before placing a demo order. Return to the configurator and calculate a quote.');
      }

      if (!currentUser) {
        throw new Error('Sign in with a prototype profile before placing a demo order.');
      }

      const draftOrder = await createDraftOrder({
        quoteId: quote.id,
        token: currentUser,
      });

      const checkoutRes = await processDemoCheckout({
        orderId: draftOrder.id,
        paymentMethod: 'demo_upi',
      });

      onOrderSuccess(draftOrder.id, checkoutRes);
      onNavigate('confirmation');
    } catch (err: any) {
      setError(err.message || 'Demo order transition failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const waitForPaymentConfirmation = async (orderId: string, token: string) => {
    setPaymentPending(true);
    for (let attempt = 0; attempt < 24; attempt += 1) {
      const result = await getOrder(orderId, token);
      if (result.order.status === 'CONFIRMED') {
        context.setLastOrderId(orderId);
        onNavigate('confirmation');
        setPaymentPending(false);
        return;
      }
      if (result.order.status === 'CANCELLED') {
        throw new Error('Payment was not completed. You can create a new checkout attempt.');
      }
      await new Promise((resolve) => window.setTimeout(resolve, 2500));
    }
    context.setLastOrderId(orderId);
    onNavigate('confirmation');
    setPaymentPending(false);
  };

  const handlePlacePaidOrder = async () => {
    setError(null);
    const validationError = validateDeliveryAddress(deliveryMethod);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (!quote?.id || !currentUser) {
      setError('A current quote and verified customer sign-in are required.');
      return;
    }
    setIsSubmitting(true);
    try {
      const contact = deliveryMethod === 'SHIP' ? {
        name: deliveryAddress.name.trim(),
        phone: deliveryAddress.phone.replace(/\s+/g, ''),
        address: deliveryAddress.address.trim(),
        city: deliveryAddress.city.trim(),
        pincode: deliveryAddress.pincode.trim(),
      } : undefined;
      const fingerprint = JSON.stringify({ quoteId: quote.id, contact, deliveryMethod });
      if (checkoutAttempt.current?.fingerprint !== fingerprint) {
        checkoutAttempt.current = {
          fingerprint,
          idempotencyKey: `checkout-${window.crypto.randomUUID()}`,
        };
      }
      const order = await createDraftOrder({
        quoteId: quote.id,
        token: currentUser,
        contact,
        deliveryMethod,
        idempotencyKey: checkoutAttempt.current.idempotencyKey,
      });
      setCheckoutCharges(order.lineItems);
      const paymentOrder = await createPaymentOrder(order.id, currentUser);
      await loadRazorpayCheckout();
      if (!window.Razorpay) throw new Error('Razorpay checkout could not be loaded.');
      const checkout = new window.Razorpay({
        key: paymentOrder.keyId,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: 'Press & Proof',
        description: 'Print order payment',
        order_id: paymentOrder.paymentOrderId,
        handler: (response) => {
          setPaymentPending(true);
          void verifyRazorpayCheckout(
            order.id,
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature,
            currentUser,
          ).then(() => waitForPaymentConfirmation(order.id, currentUser)).catch((paymentError: unknown) => {
            setError(paymentError instanceof Error ? paymentError.message : 'Payment confirmation could not be verified.');
            setPaymentPending(false);
            setIsSubmitting(false);
          });
        },
        modal: {
          ondismiss: () => setIsSubmitting(false),
        },
        theme: { color: '#0F1218' },
      });
      checkout.on('payment.failed', (response) => {
        setError(response.error?.description || 'Payment did not complete.');
        setIsSubmitting(false);
      });
      checkout.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start secure checkout.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="proof-container py-6">
        <FlowStepper activeStep={4} onNavigate={onNavigate} />

        <div className="border-b border-[#0F1218] pb-4 mb-8">
          <div className="flex justify-between items-baseline flex-wrap gap-2">
            <h1>{isDemoCheckout ? 'Demo Checkout' : 'Secure Checkout'}</h1>
            <span className="sample-stamp">{isDemoCheckout ? 'Prototype demo' : 'Production checkout'}</span>
          </div>
          <p className="reading-text-soft text-sm mt-1">
            {isDemoCheckout
              ? 'Review delivery destination and inspect the job ticket. No payment or financial data is collected.'
              : 'Review your delivery destination and server-calculated charges before paying securely.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Delivery destination & Transparent Demo Notice */}
          <div className="lg:col-span-7 space-y-6">
            <div className="proof-sheet p-6 md:p-8 border border-[#0F1218] bg-white space-y-6">
              <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-headline)' }}>
                1. {isDemoCheckout ? 'Delivery details' : 'Delivery method'}
              </h2>

              {!isDemoCheckout && (
                <fieldset className="flex flex-wrap gap-5 text-sm">
                  <legend className="sr-only">Delivery method</legend>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="delivery-method"
                      value="SHIP"
                      checked={deliveryMethod === 'SHIP'}
                      onChange={() => setDeliveryMethod('SHIP')}
                    />
                    Ship to an address
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="delivery-method"
                      value="PICKUP"
                      checked={deliveryMethod === 'PICKUP'}
                      onChange={() => setDeliveryMethod('PICKUP')}
                    />
                    Pick up
                  </label>
                </fieldset>
              )}

              {deliveryMethod === 'SHIP' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label htmlFor="delivery-name" className="text-xs font-semibold text-[#5A6070] block mb-1">
                      Contact name
                    </label>
                    <input
                      type="text"
                      id="delivery-name"
                      value={deliveryAddress.name}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, name: e.target.value })}
                      className="w-full p-2 border border-[#0F1218] rounded-[var(--control-radius)] bg-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="delivery-phone" className="text-xs font-semibold text-[#5A6070] block mb-1">
                      Phone number
                    </label>
                    <input
                      type="text"
                      id="delivery-phone"
                      value={deliveryAddress.phone}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, phone: e.target.value })}
                      className="w-full p-2 border border-[#0F1218] rounded-[var(--control-radius)] bg-white tabular-nums"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="delivery-address" className="text-xs font-semibold text-[#5A6070] block mb-1">
                      Delivery address
                    </label>
                    <input
                      type="text"
                      id="delivery-address"
                      value={deliveryAddress.address}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, address: e.target.value })}
                      className="w-full p-2 border border-[#0F1218] rounded-[var(--control-radius)] bg-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="delivery-city" className="text-xs font-semibold text-[#5A6070] block mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      id="delivery-city"
                      value={deliveryAddress.city}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                      className="w-full p-2 border border-[#0F1218] rounded-[var(--control-radius)] bg-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="delivery-pincode" className="text-xs font-semibold text-[#5A6070] block mb-1">
                      PIN code (India)
                    </label>
                    <input
                      type="text"
                      id="delivery-pincode"
                      value={deliveryAddress.pincode}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, pincode: e.target.value })}
                      className="w-full p-2 border border-[#0F1218] rounded-[var(--control-radius)] bg-white tabular-nums"
                    />
                  </div>
                </div>
              ) : (
                <p className="border border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                  Pickup selected. No shipping address or shipping charge will be added.
                </p>
              )}
            </div>

            {isDemoCheckout ? (
            <div className="p-6 bg-[#FFD60A] border-2 border-[#0F1218] space-y-2">
              <span className="sample-stamp">Prototype safety</span>
              <h3 className="text-lg font-bold text-[#0F1218]" style={{ fontFamily: 'var(--font-headline)' }}>
                Payment is not part of this demo.
              </h3>
              <p className="reading-text text-sm text-[#0F1218]">
                This prototype demonstrates the order flow only. Delivery details stay in this browser and are not sent or saved. No bank, card, or UPI details are requested or stored. The demo checkout charges nothing and does not create a production order.
              </p>
            </div>
            ) : (
              <div className="p-6 border-2 border-[#0F1218] bg-white space-y-2">
                <h3 className="text-lg font-bold text-[#0F1218]" style={{ fontFamily: 'var(--font-headline)' }}>
                  Payment is processed securely by Razorpay.
                </h3>
                <p className="reading-text text-sm text-[#0F1218]">
                  Your delivery details and order information are saved to process and fulfill this order. Tax and shipping are calculated by the server before payment. Contact details are retained for {process.env.NEXT_PUBLIC_CONTACT_DATA_RETENTION_DAYS} days, then deleted from the order record.
                </p>
                <a className="text-sm underline" href={process.env.NEXT_PUBLIC_PRIVACY_POLICY_URL || '/privacy'}>
                  Read the privacy policy
                </a>
              </div>
            )}

            {error && (
              <div className="p-3 bg-[#FFF3F3] border border-[#C4161C] text-xs font-semibold text-[#C4161C]">
                {error}
              </div>
            )}
            {paymentPending && (
              <p role="status" className="text-sm text-[#00628F]">
                Payment submitted to the provider; waiting for verified server confirmation.
              </p>
            )}

            <button
              className="btn-proof-primary w-full py-4 text-base font-bold"
              disabled={isSubmitting || paymentPending || !authReady || !quote?.id || !currentUser}
              onClick={isDemoCheckout ? handlePlaceDemoOrder : handlePlacePaidOrder}
            >
              {isSubmitting
                ? isDemoCheckout ? 'Placing demo order...' : 'Starting secure payment...'
                : isDemoCheckout ? 'Place demo order' : 'Continue to payment'}
            </button>
          </div>

          {/* Right Column: Perforated Job Ticket */}
          <div className="lg:col-span-5 sticky top-24">
            <div className="job-ticket-sheet proof-sheet">
              <div className="border-b border-dashed border-[#0F1218] pb-4 mb-4">
                <span className="sample-stamp">Sample ticket</span>
                <h3 className="text-xl font-bold mt-2" style={{ fontFamily: 'var(--font-headline)' }}>
                  {product?.name || 'Custom Book'}
                </h3>
                <span className="text-xs text-[#5A6070] font-mono block mt-1">
                  SPEC: 148×210mm · {quantity} COPIES
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-[#CBD0DA]">
                  <span className="text-[#5A6070]">Interior document</span>
                  <span className="font-semibold text-[#0F1218] truncate max-w-[160px]">
                    {interiorFile?.name || 'Preflight PDF verified'}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-[#CBD0DA]">
                  <span className="text-[#5A6070]">Cover file</span>
                  <span className="font-semibold text-[#0F1218] truncate max-w-[160px]">
                    {coverFile?.name || 'Cover template generated'}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-[#CBD0DA]">
                  <span className="text-[#5A6070]">Total print volume</span>
                  <span className="font-semibold text-[#0F1218] tabular-nums">
                    {quantity} copies
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-[#CBD0DA]">
                  <span className="text-[#5A6070]">Shipping method</span>
                  <span className="font-semibold text-[#0F1218]">
                    {isDemoCheckout
                      ? 'Standard Courier (Sample)'
                      : checkoutCharges
                        ? 'Configured shipping provider'
                        : 'Calculated by shipping provider at order creation'}
                  </span>
                </div>

                {displayCharges.map((li, idx) => (
                  <div key={idx} className="flex justify-between py-0.5 text-[#5A6070]">
                    <span>{li.description || li.code}</span>
                    <span className="tabular-nums font-medium text-[#0F1218]">
                      {formatPriceFromPaise(li.amount)}
                    </span>
                  </div>
                ))}

                <div className="pt-4 border-t-2 border-[#0F1218] flex justify-between items-baseline">
                  <span className="text-base font-bold text-[#0F1218]" style={{ fontFamily: 'var(--font-headline)' }}>
                    {isDemoCheckout ? 'Illustrative total' : checkoutCharges ? 'Total due' : 'Print subtotal'}
                  </span>
                  <span className="text-2xl font-extrabold tabular-nums text-[#0F1218]">
                    {checkoutCharges
                      ? formatPriceFromPaise(checkoutCharges.reduce((sum, item) => sum + item.amount, 0))
                      : quote ? formatPriceFromPaise(quote.total) : 'No valid quote'}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-dashed border-[#0F1218] text-[10px] text-[#5A6070] text-center font-mono">
                NON-COMMERCIAL PROTOTYPE TICKET
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}

export default CheckoutView;
