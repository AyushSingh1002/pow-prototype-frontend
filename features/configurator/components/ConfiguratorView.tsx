'use client';

import React, { useEffect, useState } from 'react';
import { Product, PrintOption, QuoteResponse, StorefrontPage } from '../../../types';
import { useOrderFlow } from '../../../context/OrderFlowContext';
import { fetchPrintOptions, createQuote } from '../../../lib/api';
import { FlowStepper } from '../../../components/layout/FlowStepper';
import { Footer } from '../../../components/layout/Footer';
import { OptionSelector } from './OptionSelector';
import { QuantitySelector } from './QuantitySelector';
import { QuoteBreakdown } from './QuoteBreakdown';
import { LiveBookPreview } from './LiveBookPreview';
import { fallbackProducts } from '../../catalog/data/fallbackProducts';

interface ConfiguratorViewProps {
  products?: Product[];
  selectedProductId?: string;
  onSelectProduct?: (id: string) => void;
  onQuoteReady?: (
    quote: QuoteResponse,
    product: Product,
    options: Record<string, string>,
    quantity: number
  ) => void;
  onNavigate?: (page: StorefrontPage) => void;
}

export function ConfiguratorView({
  products: propProducts,
  selectedProductId: propSelectedId,
  onSelectProduct: propSelectProduct,
  onQuoteReady: propQuoteReady,
  onNavigate: propNavigate,
}: ConfiguratorViewProps) {
  const {
    products: contextProducts,
    selectedProductId: contextSelectedId,
    setSelectedProductId: contextSelectProduct,
    handleQuoteReady: contextQuoteReady,
    navigate: contextNavigate,
  } = useOrderFlow();

  const products = propProducts || contextProducts;
  const selectedProductId = propSelectedId || contextSelectedId;
  const onSelectProduct = propSelectProduct || contextSelectProduct;
  const onQuoteReady = propQuoteReady || contextQuoteReady;
  const onNavigate = propNavigate || contextNavigate;

  const currentProduct =
    products.find((p) => p.id === selectedProductId) || products[0] || fallbackProducts[0];

  const [options, setOptions] = useState<Record<string, string>>({});
  const [printOptions, setPrintOptions] = useState<PrintOption[]>([]);
  const [quantity, setQuantity] = useState<number>(10);
  const [interiorColour, setInteriorColour] = useState<'bw' | 'colour'>('bw');
  const [pinCode, setPinCode] = useState<string>('110001');
  const [pinValid, setPinValid] = useState<boolean>(true);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [calculatingQuote, setCalculatingQuote] = useState(false);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  // Load option definitions
  useEffect(() => {
    let isMounted = true;
    async function loadOptions() {
      setLoadingOptions(true);
      try {
        const fetched = await fetchPrintOptions(currentProduct.id);
        if (isMounted) {
          setPrintOptions(fetched);
          const defaultOpts: Record<string, string> = {};
          fetched.forEach((opt) => {
            if (opt.choices && opt.choices.length > 0) {
              defaultOpts[opt.code] = opt.choices[0].value;
            }
          });
          setOptions(defaultOpts);
        }
      } catch (err) {
        console.warn('Using fallback options', err);
      } finally {
        if (isMounted) setLoadingOptions(false);
      }
    }
    loadOptions();
    return () => {
      isMounted = false;
    };
  }, [currentProduct.id]);

  // Recalculate quote
  useEffect(() => {
    if (Object.keys(options).length === 0) return;

    let isMounted = true;
    async function getQuote() {
      setCalculatingQuote(true);
      setQuoteError(null);
      try {
        const res = await createQuote({
          productId: currentProduct.id,
          options,
          quantity,
        });
        if (isMounted) {
          setQuote(res);
        }
      } catch (err: any) {
        if (isMounted) {
          setQuoteError(err.message || 'Pricing bounds error. Select alternative choices.');
        }
      } finally {
        if (isMounted) setCalculatingQuote(false);
      }
    }

    const timer = setTimeout(getQuote, 150);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [currentProduct.id, options, quantity]);

  const handleOptionChange = (code: string, value: string) => {
    setOptions((prev) => ({ ...prev, [code]: value }));
  };

  const handlePinChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 6);
    setPinCode(cleaned);
    setPinValid(cleaned.length === 6);
  };

  const handleContinue = () => {
    if (quote) {
      onQuoteReady(quote, currentProduct, options, quantity);
      onNavigate('upload');
    }
  };

  // Extract selected parameters for visual preview
  const formatChoice = (options['format'] || options['size'] || 'a5').toLowerCase();
  const bindingChoice = (options['binding'] || 'perfect_bound').toLowerCase();
  const finishChoice = (options['finish'] || options['cover_finish'] || 'matte').toLowerCase();
  const pageCountChoice = parseInt(options['pages'] || '120', 10) || 120;

  return (
    <div className="w-full">
      <div className="proof-container py-6">
        {/* Step Indicator */}
        <FlowStepper activeStep={1} onNavigate={onNavigate} />

        {/* Page Heading */}
        <div className="border-b border-[#0F1218] pb-4 mb-8">
          <div className="flex justify-between items-baseline flex-wrap gap-2">
            <h1>Configure {currentProduct.name}</h1>
            <span className="sample-stamp">Sample prices</span>
          </div>
          <p className="reading-text-soft text-sm mt-1">
            Choose binding, paper weight and dimensions. Quotes update instantly through server integer calculation.
          </p>
        </div>

        {/* WORKED-ON SHEET WITH CROP MARKS */}
        <div className="crop-marked proof-sheet p-6 md:p-12 border border-[#0F1218] bg-[#FDFDFC]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left 7 Columns: Physical Attribute Selectors */}
            <div className="lg:col-span-7 space-y-6">
              {loadingOptions ? (
                <div className="py-12 flex items-center justify-center gap-3 text-[#5A6070]">
                  <span className="registration-target animating" />
                  <span>Loading product specification matrices...</span>
                </div>
              ) : (
                <>
                  {printOptions.map((opt) => (
                    <OptionSelector
                      key={opt.code}
                      option={opt}
                      selectedValue={options[opt.code] || ''}
                      onChange={handleOptionChange}
                    />
                  ))}

                  {/* Interior Colour Selector (Change 6) */}
                  <div className="py-6 border-b border-[#CBD0DA]">
                    <div className="flex justify-between items-baseline mb-4">
                      <label className="text-base font-bold text-[#0F1218]" style={{ fontFamily: 'var(--font-headline)' }}>
                        Interior printing colour
                      </label>
                      <span className="text-xs text-[#5A6070]">
                        {interiorColour === 'colour' ? 'Full CMYK colour' : 'Monochrome black & white'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setInteriorColour('bw')}
                        className={`p-3 text-left border cursor-pointer transition-all duration-150 relative bg-white ${
                          interiorColour === 'bw'
                            ? 'border-[#0F1218] ring-1 ring-[#0F1218]'
                            : 'border-[#CBD0DA]'
                        }`}
                      >
                        <span className="text-xs font-bold block text-[#0F1218]">Black &amp; white</span>
                        <span className="text-[11px] text-[#5A6070] block mt-0.5">High-contrast text &amp; line art</span>
                        {interiorColour === 'bw' && (
                          <>
                            <span className="absolute top-0.5 left-0.5 w-1.5 h-1.5 border-t border-l border-[#0F1218] pointer-events-none" />
                            <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 border-t border-r border-[#0F1218] pointer-events-none" />
                            <span className="absolute bottom-0.5 left-0.5 w-1.5 h-1.5 border-b border-l border-[#0F1218] pointer-events-none" />
                            <span className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 border-b border-r border-[#0F1218] pointer-events-none" />
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setInteriorColour('colour')}
                        className={`p-3 text-left border cursor-pointer transition-all duration-150 relative bg-white ${
                          interiorColour === 'colour'
                            ? 'border-[#0F1218] ring-1 ring-[#0F1218]'
                            : 'border-[#CBD0DA]'
                        }`}
                      >
                        <span className="text-xs font-bold block text-[#0F1218]">Full colour CMYK</span>
                        <span className="text-[11px] text-[#5A6070] block mt-0.5">Pigment reproduction for photos</span>
                        {interiorColour === 'colour' && (
                          <>
                            <span className="absolute top-0.5 left-0.5 w-1.5 h-1.5 border-t border-l border-[#0F1218] pointer-events-none" />
                            <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 border-t border-r border-[#0F1218] pointer-events-none" />
                            <span className="absolute bottom-0.5 left-0.5 w-1.5 h-1.5 border-b border-l border-[#0F1218] pointer-events-none" />
                            <span className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 border-b border-r border-[#0F1218] pointer-events-none" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Quantity Selector */}
                  <div className="py-6 border-b border-[#CBD0DA]">
                    <QuantitySelector
                      quantity={quantity}
                      onChange={setQuantity}
                    />
                  </div>

                  {/* Delivery PIN Code Validator (Change 6) */}
                  <div className="py-6">
                    <label className="text-sm font-bold text-[#0F1218] block mb-2" style={{ fontFamily: 'var(--font-headline)' }}>
                      Delivery postal PIN code (India)
                    </label>
                    <div className="flex items-center gap-4 max-w-xs">
                      <input
                        type="text"
                        value={pinCode}
                        onChange={(e) => handlePinChange(e.target.value)}
                        placeholder="e.g. 110001"
                        maxLength={6}
                        className="w-36 p-2.5 border border-[#0F1218] text-base font-semibold tabular-nums rounded-[var(--control-radius)] bg-white text-[#0F1218]"
                      />
                      <span className="text-xs font-medium" style={{ color: pinValid ? '#00628F' : '#C4161C' }}>
                        {pinValid ? 'Valid 6-digit PIN' : 'Enter 6 digits'}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Right 5 Columns: Sticky Live Book Preview & Rolling Estimate on Desktop */}
            <div className="hidden lg:block lg:col-span-5 space-y-6 sticky top-24">
              <LiveBookPreview
                format={formatChoice}
                binding={bindingChoice}
                pageCount={pageCountChoice}
                coverFinish={finishChoice}
                interiorColour={interiorColour}
                title={currentProduct.name}
              />

              <QuoteBreakdown
                quote={quote}
                quantity={quantity}
                calculatingQuote={calculatingQuote}
                quoteError={quoteError}
                onRetry={() => {
                  setQuoteError(null);
                  setCalculatingQuote(true);
                }}
                onContinue={handleContinue}
              />
            </div>

            {/* Mobile View: Inline Preview and Breakdown below options */}
            <div className="lg:hidden space-y-6 pt-6 border-t border-[#CBD0DA]">
              <LiveBookPreview
                format={formatChoice}
                binding={bindingChoice}
                pageCount={pageCountChoice}
                coverFinish={finishChoice}
                interiorColour={interiorColour}
                title={currentProduct.name}
              />

              <QuoteBreakdown
                quote={quote}
                quantity={quantity}
                calculatingQuote={calculatingQuote}
                quoteError={quoteError}
                onRetry={() => {
                  setQuoteError(null);
                  setCalculatingQuote(true);
                }}
                onContinue={handleContinue}
              />
            </div>
          </div>

          <div className="crop-marks-bottom" />
        </div>
      </div>

      {/* Sticky Mobile Bottom Bar: Total Estimate & Continue */}
      <aside
        className="fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-white border-t border-[#0F1218] px-4 py-3 shadow-[0_-4px_12px_rgba(15,18,24,0.08)] flex items-center justify-between gap-4"
        aria-label="Mobile estimate bar"
      >
        <div>
          <div className="flex items-center gap-1.5">
            <span className="sample-stamp text-[10px]">Sample</span>
            <span className="text-xs text-[#5A6070]">{quantity} copies</span>
          </div>
          <span className="text-lg font-bold tabular-nums text-[#0F1218] block leading-tight mt-0.5">
            {quote ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.round(quote.total / 100)) : 'Calculating...'}
          </span>
        </div>

        <button
          className="btn-proof-primary py-2.5 px-5 text-sm font-semibold shrink-0"
          onClick={handleContinue}
          disabled={!quote || calculatingQuote}
        >
          Continue
        </button>
      </aside>

      <div className="lg:hidden h-16" />

      <Footer onNavigate={onNavigate} />
    </div>
  );
}

export default ConfiguratorView;
