'use client';

import React, { useEffect, useState } from 'react';
import { ChevronRight, Truck } from 'lucide-react';
import { Product, PrintOption, QuoteResponse, StorefrontPage } from '../../../types';
import { useOrderFlow } from '../../../context/OrderFlowContext';
import { fetchPrintOptions, createQuote } from '../../../lib/api';
import { FlowStepper } from '../../../components/layout/FlowStepper';
import { Footer } from '../../../components/layout/Footer';
import { OptionSelector } from './OptionSelector';
import { QuantitySelector } from './QuantitySelector';
import { QuoteBreakdown } from './QuoteBreakdown';
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
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [calculatingQuote, setCalculatingQuote] = useState(false);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [pinCode, setPinCode] = useState('');
  const [pinChecked, setPinChecked] = useState(false);

  // Fetch print options when selected product changes
  useEffect(() => {
    let active = true;
    setLoadingOptions(true);
    fetchPrintOptions(currentProduct.id)
      .then((opts) => {
        if (!active) return;
        setPrintOptions(opts);
        const defaults: Record<string, string> = {};
        for (const opt of opts) {
          if (opt.choices.length > 0) {
            defaults[opt.code] = opt.choices[0].value;
          }
        }
        setOptions(defaults);
        setQuantity(Math.max(currentProduct.minQuantity || 1, 10));
      })
      .catch((err) => {
        console.error('Error fetching print options:', err);
      })
      .finally(() => {
        if (active) setLoadingOptions(false);
      });

    return () => {
      active = false;
    };
  }, [currentProduct.id]);

  // Real-time server quote calculation debounced
  useEffect(() => {
    if (printOptions.length === 0 || Object.keys(options).length === 0) return;

    setCalculatingQuote(true);
    setQuoteError(null);

    const timer = setTimeout(() => {
      createQuote({
        productId: currentProduct.id,
        options,
        quantity,
      })
        .then((q) => {
          setQuote(q);
          setQuoteError(null);
        })
        .catch((err: any) => {
          setQuote(null);
          setQuoteError(err.message || 'Unable to compute quote with selected configuration.');
        })
        .finally(() => {
          setCalculatingQuote(false);
        });
    }, 200);

    return () => clearTimeout(timer);
  }, [currentProduct.id, options, quantity, printOptions.length]);

  const handleOptionChange = (code: string, value: string) => {
    setOptions((prev) => ({ ...prev, [code]: value }));
  };

  const handleContinue = () => {
    if (quote) {
      onQuoteReady(quote, currentProduct, options, quantity);
      onNavigate('upload');
    }
  };

  return (
    <>
      <div className="page-intro compact">
        <div className="breadcrumbs">
          <button onClick={() => onNavigate('home')}>Home</button>
          <ChevronRight size={13} />
          <button onClick={() => onNavigate('catalogue')}>Products</button>
          <ChevronRight size={13} />
          <span>{currentProduct.name}</span>
        </div>
        <FlowStepper activeStep={1} onNavigate={onNavigate} />
        <h1 style={{ marginTop: 24 }}>{currentProduct.name}</h1>
        <p>{currentProduct.description}</p>
      </div>

      <main className="configurator">
        <div className="config-form">
          <div>
            <span
              style={{
                font: 'var(--font-mono)',
                fontSize: 11,
                letterSpacing: '0.1em',
                display: 'block',
                marginBottom: 12,
              }}
            >
              SELECT PRODUCT CATALOGUE
            </span>
            <div className="product-selector-tabs">
              {products.map((p) => (
                <button
                  key={p.id}
                  className={`product-tab ${p.id === currentProduct.id ? 'active' : ''}`}
                  onClick={() => onSelectProduct(p.id)}
                >
                  {p.name}
                  <small>({p.category})</small>
                </button>
              ))}
            </div>
          </div>

          {loadingOptions ? (
            <div
              style={{
                padding: 60,
                textAlign: 'center',
                color: 'var(--muted)',
                font: 'var(--font-mono)',
                fontSize: 12,
              }}
            >
              Loading print options matrix from backend...
            </div>
          ) : (
            <>
              {printOptions.map((opt, stepIndex) => (
                <OptionSelector
                  key={opt.id}
                  option={opt}
                  stepIndex={stepIndex}
                  selectedValue={options[opt.code]}
                  onChange={handleOptionChange}
                />
              ))}

              <QuantitySelector
                quantity={quantity}
                stepNumber={printOptions.length + 1}
                product={currentProduct}
                onChange={setQuantity}
              />

              <div className="config-step">
                <span>{printOptions.length + 2}. DELIVERY PIN CODE ESTIMATE</span>
                <div style={{ display: 'flex', gap: 8, maxWidth: 320 }}>
                  <input
                    placeholder="Enter PIN code"
                    value={pinCode}
                    maxLength={6}
                    onChange={(e) => {
                      setPinCode(e.target.value);
                      setPinChecked(false);
                    }}
                    style={{
                      padding: '10px 14px',
                      border: '1px solid var(--line)',
                      borderRadius: 'var(--radius-sm)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 12,
                      flex: 1,
                      backgroundColor: 'var(--surface)',
                    }}
                  />
                  <button className="btn btn-outline" onClick={() => setPinChecked(true)}>
                    Check
                  </button>
                </div>
                {pinChecked && pinCode.length === 6 && (
                  <p style={{ marginTop: 10, color: 'var(--success)', fontSize: 12 }}>
                    <Truck size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                    Standard Delivery: Estimated arrival in 2–3 business days.
                  </p>
                )}
              </div>
            </>
          )}

          {quoteError && (
            <div
              style={{
                backgroundColor: 'var(--warning-bg)',
                border: '1px solid var(--warning-border)',
                color: 'var(--rust)',
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)',
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              <b>Option Conflict or Bounds Error:</b> {quoteError}
            </div>
          )}
        </div>

        <QuoteBreakdown
          quote={quote}
          quantity={quantity}
          calculatingQuote={calculatingQuote}
          onContinue={handleContinue}
        />
      </main>

      <Footer onNavigate={onNavigate} />
    </>
  );
}
