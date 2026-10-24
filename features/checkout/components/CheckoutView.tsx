'use client';

import React, { useState } from 'react';
import {
  QuoteResponse,
  Product,
  DemoCheckoutResponse,
  StorefrontPage,
} from '../../../types';
import { useOrderFlow } from '../../../context/OrderFlowContext';
import { useAuth } from '../../../context/AuthContext';
import { createDraftOrder, processDemoCheckout } from '../../../lib/api';
import { formatPriceFromPaise } from '../../../lib/formatters';
import { FlowStepper } from '../../../components/layout/FlowStepper';
import { Footer } from '../../../components/layout/Footer';

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

  const [deliveryAddress, setDeliveryAddress] = useState({
    name: 'Ayush Singh',
    phone: '+91 98765 43210',
    address: 'Flat 402, Block B, Pre-Press Towers',
    city: 'New Delhi',
    pincode: '110001',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateDeliveryAddress = () => {
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

  const handlePlaceDemoOrder = async () => {
    setError(null);

    const validationError = validateDeliveryAddress();
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

  return (
    <div className="w-full">
      <div className="proof-container py-6">
        <FlowStepper activeStep={4} onNavigate={onNavigate} />

        <div className="border-b border-[#0F1218] pb-4 mb-8">
          <div className="flex justify-between items-baseline flex-wrap gap-2">
            <h1>Demo Checkout</h1>
            <span className="sample-stamp">Prototype demo</span>
          </div>
          <p className="reading-text-soft text-sm mt-1">
            Review delivery destination and inspect the job ticket. No payment or financial data is collected.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Delivery destination & Transparent Demo Notice */}
          <div className="lg:col-span-7 space-y-6">
            <div className="proof-sheet p-6 md:p-8 border border-[#0F1218] bg-white space-y-6">
              <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-headline)' }}>
                1. Delivery details (not saved)
              </h2>

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
            </div>

            {/* Transparent Demo Notice Panel */}
            <div className="p-6 bg-[#FFD60A] border-2 border-[#0F1218] space-y-2">
              <span className="sample-stamp">Prototype safety</span>
              <h3 className="text-lg font-bold text-[#0F1218]" style={{ fontFamily: 'var(--font-headline)' }}>
                Payment is not part of this demo.
              </h3>
              <p className="reading-text text-sm text-[#0F1218]">
                This prototype demonstrates the order flow only. Delivery details stay in this browser and are not sent or saved. No bank, card, or UPI details are requested or stored. The demo checkout charges nothing and does not create a production order.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-[#FFF3F3] border border-[#C4161C] text-xs font-semibold text-[#C4161C]">
                {error}
              </div>
            )}

            <button
              className="btn-proof-primary w-full py-4 text-base font-bold"
              disabled={isSubmitting || !quote?.id || !currentUser}
              onClick={handlePlaceDemoOrder}
            >
              {isSubmitting ? 'Placing demo order...' : 'Place demo order'}
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
                    Standard Courier (Sample)
                  </span>
                </div>

                {quote?.lineItems.map((li, idx) => (
                  <div key={idx} className="flex justify-between py-0.5 text-[#5A6070]">
                    <span>{li.description}</span>
                    <span className="tabular-nums font-medium text-[#0F1218]">
                      {formatPriceFromPaise(li.lineTotal)}
                    </span>
                  </div>
                ))}

                <div className="pt-4 border-t-2 border-[#0F1218] flex justify-between items-baseline">
                  <span className="text-base font-bold text-[#0F1218]" style={{ fontFamily: 'var(--font-headline)' }}>
                    Illustrative total
                  </span>
                  <span className="text-2xl font-extrabold tabular-nums text-[#0F1218]">
                    {quote ? formatPriceFromPaise(quote.total) : 'No valid quote'}
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
