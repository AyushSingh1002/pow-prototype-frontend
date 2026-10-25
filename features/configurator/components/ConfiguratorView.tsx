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
import { useAuth } from '../../../context/AuthContext';

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
  const { currentUser, isDemoMode, authReady, openSignIn } = useAuth();

  const products = propProducts || contextProducts;
  const selectedProductId = propSelectedId || contextSelectedId;
  const onSelectProduct = propSelectProduct || contextSelectProduct;
  const onQuoteReady = propQuoteReady || contextQuoteReady;
  const onNavigate = propNavigate || contextNavigate;

  const currentProduct =
    products.find((p) => p.id === selectedProductId) ||
    products[0] ||
    (isDemoMode ? fallbackProducts[0] : null);

  const [options, setOptions] = useState<Record<string, string>>({});
  const [printOptions, setPrintOptions] = useState<PrintOption[]>([]);
  const [quantity, setQuantity] = useState<number>(10);
  const [pinCode, setPinCode] = useState<string>('110001');
  const [pinValid, setPinValid] = useState<boolean>(true);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [calculatingQuote, setCalculatingQuote] = useState(false);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [quoteRequestRevision, setQuoteRequestRevision] = useState(0);

  const quoteOptions = isDemoMode && currentProduct?.id === 'books'
    ? { ...options, pages: options.pages || '120', finish: options.finish || 'matte' }
    : options;
  const configuredOptions = printOptions;

  // Load option definitions
  useEffect(() => {
    let isMounted = true;
    if (!currentProduct) {
      setQuote(null);
      setQuoteError(null);
      setPrintOptions([]);
      setOptions({});
      setLoadingOptions(false);
      setOptionsError('The production catalogue is unavailable. Please try again later.');
      return () => {
        isMounted = false;
      };
    }
    const product = currentProduct;
    setQuote(null);
    setQuoteError(null);
    setOptionsError(null);
    setPrintOptions([]);
    setOptions({});
    setQuantity((currentQuantity) =>
      Math.max(product.minQuantity, Math.min(product.maxQuantity, currentQuantity))
    );

    async function loadOptions() {
      setLoadingOptions(true);
      try {
        const fetched = await fetchPrintOptions(product.id);
        if (fetched.length === 0) {
          throw new Error(`No print configuration is available for ${product.name}.`);
        }
        if (isMounted) {
          setPrintOptions(fetched);
          const defaultOpts: Record<string, string> = {};
          fetched.forEach((opt) => {
            if (opt.choices && opt.choices.length > 0) {
              defaultOpts[opt.code] = opt.choices[0].value;
            }
          });
          if (isDemoMode && product.id === 'books') {
            defaultOpts.pages = '120';
          }
          setOptions(defaultOpts);
        }
      } catch (err) {
        console.error('Unable to load product configuration:', err);
        if (isMounted) {
          setPrintOptions([]);
          setOptions({});
          setOptionsError(
            err instanceof Error
              ? err.message
              : `Unable to load configuration for ${product.name}.`
          );
        }
      } finally {
        if (isMounted) setLoadingOptions(false);
      }
    }
    loadOptions();
    return () => {
      isMounted = false;
    };
  }, [currentProduct?.id, currentProduct?.minQuantity, currentProduct?.maxQuantity, currentProduct?.name]);

  // Recalculate quote
  useEffect(() => {
    if (!currentProduct || Object.keys(options).length === 0) return;
    const product = currentProduct;

    let isMounted = true;
    async function getQuote() {
      if (!authReady) return;
      if (!isDemoMode && !currentUser) {
        setQuoteError('Sign in with your verified customer account to request a quote.');
        return;
      }
      setCalculatingQuote(true);
      setQuoteError(null);
      try {
        const res = await createQuote({
          productId: product.id,
          options: quoteOptions,
          quantity,
          token: currentUser ?? undefined,
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
  }, [currentProduct?.id, options, quantity, quoteRequestRevision, authReady, isDemoMode, currentUser]);

  const handleOptionChange = (code: string, value: string) => {
    setOptions((prev) => ({ ...prev, [code]: value }));
  };

  const handlePinChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 6);
    setPinCode(cleaned);
    setPinValid(cleaned.length === 6);
  };

  const handleContinue = () => {
    if (quote && currentProduct) {
      onQuoteReady(quote, currentProduct, quoteOptions, quantity);
      onNavigate('upload');
    }
  };

  // Extract selected parameters for visual preview
  const formatChoice = (options['format'] || options['size'] || 'a5').toLowerCase();
  const bindingChoice = (options['binding'] || 'perfect_bound').toLowerCase();
  const finishChoice = (options['finish'] || options['cover_finish'] || 'matte').toLowerCase();
  const pageCountChoice = parseInt(options['pages'] || '120', 10) || 120;

  if (!currentProduct) {
    return (
      <div className="proof-container py-6">
        <FlowStepper activeStep={1} onNavigate={onNavigate} />
        <div className="proof-sheet p-8 border border-[#0F1218] bg-white" role="status">
          <h1 className="text-2xl font-bold">Catalogue unavailable</h1>
          <p className="reading-text-soft mt-3">
            Production product configuration is not available right now. Please try again later.
          </p>
        </div>
        <Footer onNavigate={onNavigate} />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="proof-container py-6">
        {/* Step Indicator */}
        <FlowStepper activeStep={1} onNavigate={onNavigate} />

        {/* Page Heading */}
        <div className="border-b border-[#0F1218] pb-4 mb-8">
          <div className="flex justify-between items-baseline flex-wrap gap-2">
            <h1>Configure {currentProduct.name}</h1>
            <span className="sample-stamp">
              {isDemoMode || currentProduct.isSample ? 'Sample prices' : 'Production prices'}
            </span>
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
                  {optionsError && (
                    <p className="text-sm text-[#C4161C]" role="alert">
                      {optionsError}
                    </p>
                  )}
                  {!isDemoMode && !currentUser && (
                    <div className="p-4 border border-[#C4161C] bg-white" role="status">
                      <p className="text-sm">Sign in with a verified customer account to request a quote.</p>
                      <button type="button" className="btn-proof-primary mt-3 px-5 py-2 text-xs" onClick={openSignIn}>
                        Sign in
                      </button>
                    </div>
                  )}
                  {configuredOptions.map((opt) => (
                    <OptionSelector
                      key={opt.code}
                      option={opt}
                      selectedValue={options[opt.code] || ''}
                      onChange={handleOptionChange}
                    />
                  ))}

                  {/* Quantity Selector */}
                  <div className="py-6 border-b border-[#CBD0DA]">
                    <QuantitySelector
                      quantity={quantity}
                      product={currentProduct}
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
              <ProductConfigurationPreview
                product={currentProduct}
                printOptions={printOptions}
                options={options}
                format={formatChoice}
                binding={bindingChoice}
                pageCount={pageCountChoice}
                coverFinish={finishChoice}
              />

              <QuoteBreakdown
                quote={quote}
                quantity={quantity}
                calculatingQuote={calculatingQuote}
                quoteError={quoteError}
                onRetry={() => {
                  setQuoteError(null);
                  setQuoteRequestRevision((revision) => revision + 1);
                }}
                onContinue={handleContinue}
              />
            </div>

            {/* Mobile View: Inline Preview and Breakdown below options */}
            <div className="lg:hidden space-y-6 pt-6 border-t border-[#CBD0DA]">
              <ProductConfigurationPreview
                product={currentProduct}
                printOptions={printOptions}
                options={options}
                format={formatChoice}
                binding={bindingChoice}
                pageCount={pageCountChoice}
                coverFinish={finishChoice}
              />

              <QuoteBreakdown
                quote={quote}
                quantity={quantity}
                calculatingQuote={calculatingQuote}
                quoteError={quoteError}
                onRetry={() => {
                  setQuoteError(null);
                  setQuoteRequestRevision((revision) => revision + 1);
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

interface ProductConfigurationPreviewProps {
  product: Product;
  printOptions: PrintOption[];
  options: Record<string, string>;
  format: string;
  binding: string;
  pageCount: number;
  coverFinish: string;
}

function ProductConfigurationPreview({
  product,
  printOptions,
  options,
  format,
  binding,
  pageCount,
  coverFinish,
}: ProductConfigurationPreviewProps) {
  if (product.id === 'books') {
    const normalizedBinding = binding === 'paperback'
      ? 'perfect_bound'
      : binding.replace(/-/g, '_');

    return (
      <LiveBookPreview
        format={format.includes('a4') ? 'a4' : format.includes('b5') ? 'b5' : 'a5'}
        binding={normalizedBinding}
        pageCount={pageCount}
        coverFinish={coverFinish.replace(/-/g, '_')}
        interiorColour={options.interior === 'full-colour' ? 'colour' : 'bw'}
        title={product.name}
      />
    );
  }

  return (
    <aside className="proof-sheet p-6 border border-[#0F1218] bg-white">
      <div className="border-b border-[#0F1218] pb-3 mb-3">
        <span className="sample-stamp">Format preview</span>
        <h3 className="text-lg font-bold mt-2" style={{ fontFamily: 'var(--font-headline)' }}>
          {product.name}
        </h3>
        <p className="reading-text-soft text-xs mt-1">{product.description}</p>
      </div>
      <dl className="divide-y divide-[#CBD0DA]">
        {printOptions.map((option) => {
          const selectedChoice = option.choices.find(
            (choice) => choice.value === options[option.code]
          );
          return (
            <div key={option.code} className="flex justify-between gap-4 py-2 text-xs">
              <dt className="text-[#5A6070]">{option.name}</dt>
              <dd className="text-right font-semibold text-[#0F1218]">
                {selectedChoice?.label || 'Select an option'}
              </dd>
            </div>
          );
        })}
      </dl>
    </aside>
  );
}

export default ConfiguratorView;
