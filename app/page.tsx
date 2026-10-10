'use client'

import React, { useEffect, useMemo, useState, useRef } from 'react'
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  FileCheck2,
  FileUp,
  Menu,
  Minus,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Truck,
  UploadCloud,
  X,
  CreditCard,
  QrCode,
  Building,
  CheckCircle2,
  Clock,
  Layers,
  HelpCircle,
  FileText,
  User,
  LogOut,
  Send,
  BookOpen,
  Printer,
  Sliders,
  ExternalLink,
  Trash2,
  RotateCcw,
  Image as ImageIcon,
} from 'lucide-react'
import {
  checkBackendHealth,
  fetchProducts,
  fetchPrintOptions,
  createQuote,
  registerArtworkUpload,
  createDraftOrder,
  getOrder,
  processDemoCheckout,
  Product,
  PrintOption,
  QuoteResponse,
  OrderLookupResponse,
  UploadMetadataResponse,
  DemoCheckoutResponse,
} from '../lib/api'
import { generateArtworkPreview } from '../lib/pdfPreview'
import {
  calculateCoverSpreadDimensions,
  detectArtworkLayout,
  CoverSpreadCalculation,
  ArtworkLayoutType,
} from '../lib/coverSpread'
import {
  getProductUploadConfig,
  ProductUploadConfig,
  UploadSlotConfig,
  ValidationResult,
  UploadedSlotData,
} from '../lib/productUploadConfig'

// Fallback catalogue if API is loading or offline
const fallbackProducts: Product[] = [
  { id: 'books', slug: 'books', name: 'Custom Books & Notebooks', category: 'books', description: 'Paperback & hardcover custom bound books with vivid colour or black-and-white printing.', isActive: true, minQuantity: 1, maxQuantity: 2000, sampleStartingPrice: 29900, currency: 'INR', isSample: true },
  { id: 'certificates', slug: 'certificates', name: 'Certificates & Diplomas', category: 'stationery', description: 'Official award & achievement certificates printed on premium parchment, linen or heavy ivory art card.', isActive: true, minQuantity: 10, maxQuantity: 2500, sampleStartingPrice: 800, currency: 'INR', isSample: true },
  { id: 'posters', slug: 'posters', name: 'Large-Format Posters', category: 'marketing', description: 'High-definition large-format art & promotional posters on satin photo paper or presentation matte.', isActive: true, minQuantity: 1, maxQuantity: 500, sampleStartingPrice: 15000, currency: 'INR', isSample: true },
  { id: 'business-cards', slug: 'business-cards', name: 'Premium Visiting Cards', category: 'stationery', description: 'Standard 3.5x2 inch high-definition visiting cards on premium stock with optional lamination and spot UV.', isActive: true, minQuantity: 50, maxQuantity: 10000, sampleStartingPrice: 300, currency: 'INR', isSample: true },
  { id: 'letterheads', slug: 'letterheads', name: 'Corporate Letterheads', category: 'stationery', description: 'Laser & inkjet friendly official stationery printed on executive watermark bond or ultra-smooth card.', isActive: true, minQuantity: 50, maxQuantity: 5000, sampleStartingPrice: 400, currency: 'INR', isSample: true },
  { id: 'flyers-brochures', slug: 'flyers-brochures', name: 'Marketing Flyers & Leaflets', category: 'marketing', description: 'Full-color promotional flyers printed on crisp gloss or matte paper, available with bi-fold or tri-fold.', isActive: true, minQuantity: 100, maxQuantity: 25000, sampleStartingPrice: 450, currency: 'INR', isSample: true },
  { id: 'custom-stickers', slug: 'custom-stickers', name: 'Custom Die-Cut Vinyl Stickers', category: 'labels', description: 'Weather-resistant custom cut vinyl stickers on white or transparent stock with vibrant pigment inks.', isActive: true, minQuantity: 25, maxQuantity: 5000, sampleStartingPrice: 600, currency: 'INR', isSample: true },
  { id: 'documents', slug: 'documents', name: 'Documents & Reports', category: 'documents', description: 'High-speed document printing for reports, manuals, assignments, and presentations.', isActive: true, minQuantity: 1, maxQuantity: 10000, sampleStartingPrice: 4900, currency: 'INR', isSample: true },
  { id: 'photo-albums', slug: 'photo-albums', name: 'Custom Photo Albums', category: 'books', description: 'Seamless panoramic layflat hardcover photo books printed on archival photographic luster paper.', isActive: true, minQuantity: 1, maxQuantity: 100, sampleStartingPrice: 99900, currency: 'INR', isSample: true },
  { id: 'calendars', slug: 'calendars', name: 'Desk & Wall Calendars', category: 'stationery', description: 'Custom multi-month desk tent easel and hanging wall calendars with wire-o spiral binding.', isActive: true, minQuantity: 10, maxQuantity: 2000, sampleStartingPrice: 12000, currency: 'INR', isSample: true },
]

function money(paiseOrRupees: number, isPaise = false) {
  const rupees = isPaise ? Math.round(paiseOrRupees / 100) : paiseOrRupees
  return `₹${rupees.toLocaleString('en-IN')}`
}

/* ==========================================================================
   Shared Header Component
   ========================================================================== */

function Header({
  currentPage,
  onNavigate,
  backendHealth,
  currentUser,
  onOpenSignIn,
  onOpenMobileMenu,
}: {
  currentPage: string
  onNavigate: (page: string) => void
  backendHealth: { connected: boolean; version?: string }
  currentUser: string | null
  onOpenSignIn: () => void
  onOpenMobileMenu: () => void
}) {
  return (
    <header className="site-header">
      <div className="header-left">
        <button className="wordmark" onClick={() => onNavigate('home')} aria-label="Press and Proof home">
          <span>PRESS</span><b>&amp;</b><span>PROOF</span>
        </button>

        <span
          className={`backend-status-pill ${backendHealth.connected ? 'connected' : 'error'}`}
          title={
            backendHealth.connected
              ? `Backend Connected (Config: ${backendHealth.version || 'sample-v1'})`
              : 'Connecting to Express backend on port 5000...'
          }
        >
          <span className="status-dot" />
          {backendHealth.connected ? (
            <>API Connected · {backendHealth.version || 'sample-v1'}</>
          ) : (
            <>Connecting...</>
          )}
        </span>
      </div>

      <nav className="desktop-nav" aria-label="Main navigation">
        <button
          className={currentPage === 'catalogue' ? 'active' : ''}
          onClick={() => onNavigate('catalogue')}
        >
          Products
        </button>
        <button
          className={currentPage === 'configurator' ? 'active' : ''}
          onClick={() => onNavigate('configurator')}
        >
          Configurator
        </button>
        <button
          className={currentPage === 'tracking' ? 'active' : ''}
          onClick={() => onNavigate('tracking')}
        >
          Track order
        </button>
        <button
          className={currentPage === 'bulk' ? 'active' : ''}
          onClick={() => onNavigate('bulk')}
        >
          Bulk quotes
        </button>
        <button
          className={currentPage === 'help' ? 'active' : ''}
          onClick={() => onNavigate('help')}
        >
          Help
        </button>
      </nav>

      <div className="header-actions">
        {currentUser ? (
          <button className="btn btn-ghost" onClick={onOpenSignIn} title="Account profile">
            <User size={14} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{currentUser}</span>
          </button>
        ) : (
          <button className="btn btn-ghost" onClick={onOpenSignIn}>
            Sign in
          </button>
        )}

        <button className="btn btn-primary" onClick={() => onNavigate('configurator')}>
          Start printing <ArrowRight size={14} />
        </button>

        <button className="btn btn-ghost mobile-menu" onClick={onOpenMobileMenu} aria-label="Open mobile menu">
          <Menu size={20} />
        </button>
      </div>
    </header>
  )
}

/* ==========================================================================
   Notice Banner
   ========================================================================== */

function Notice({ backendHealth }: { backendHealth: { connected: boolean; version?: string } }) {
  return (
    <div className="notice">
      {backendHealth.connected ? (
        <>
          ✓ Live Backend Connected on Port 5000 · Server-side integer pricing active ({backendHealth.version}) · Demo only, no real charges.
        </>
      ) : (
        <>Concept prototype: sample estimates only. Connecting to backend service on port 5000...</>
      )}
    </div>
  )
}

/* ==========================================================================
   Shared Footer Component
   ========================================================================== */

function Footer({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div>
          <div className="footer-mark">PRESS &amp; PROOF</div>
          <p>
            Independent concept print storefront.<br />
            Connected to Express.js pricing engine &amp; auditable quote service.<br />
            Sample estimates computed in integer paise minor units.
          </p>
        </div>
        <div className="footer-col">
          <b>Products</b>
          <button onClick={() => onNavigate('catalogue')}>Custom Books</button>
          <button onClick={() => onNavigate('catalogue')}>Document Printing</button>
          <button onClick={() => onNavigate('catalogue')}>Marketing Collateral</button>
          <button onClick={() => onNavigate('catalogue')}>Visiting Cards</button>
          <button onClick={() => onNavigate('catalogue')}>Die-Cut Stickers</button>
        </div>
        <div className="footer-col">
          <b>Pipeline &amp; Specs</b>
          <button onClick={() => onNavigate('configurator')}>Pricing Engine</button>
          <button onClick={() => onNavigate('upload')}>Preflight API</button>
          <button onClick={() => onNavigate('tracking')}>Order Tracking</button>
          <button onClick={() => onNavigate('help')}>Paper GSM Guide</button>
          <button onClick={() => onNavigate('help')}>Binding Styles</button>
        </div>
        <div className="footer-col">
          <b>Verification &amp; Help</b>
          <button onClick={() => onNavigate('help')}>Architecture Specs</button>
          <button onClick={() => onNavigate('help')}>54 Backend Tests</button>
          <button onClick={() => onNavigate('bulk')}>Bulk Estimates</button>
          <button onClick={() => onNavigate('help')}>Customer Support</button>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Press &amp; Proof. Independent concept prototype.</span>
        <span>Express Backend + Next.js Frontend · Zero client price spoofing</span>
      </div>
    </footer>
  )
}

/* ==========================================================================
   Visual Mockup Illustration
   ========================================================================== */

function ProductVisual({ type = 'book' }: { type?: string }) {
  return (
    <div className={`product-visual visual-${type}`} aria-hidden="true">
      <div className="paper-sheet">
        <span>
          PRESS
          <br />
          &amp;
          <br />
          PROOF
        </span>
      </div>
      {type === 'book' && <div className="book-spine" />}
    </div>
  )
}

function ProductCard({
  product,
  index,
  onClick,
}: {
  product: Product
  index: number
  onClick: () => void
}) {
  const visualType =
    product.id === 'books' ? 'book' : product.id === 'business-cards' ? 'card' : 'paper'
  return (
    <article className="product-card">
      <div className={`card-image tone-${index % 4}`}>
        <ProductVisual type={visualType} />
      </div>
      <div className="card-meta">
        <span className="card-group">{product.category}</span>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <div className="price-line">
          <b>From {money(product.sampleStartingPrice, true)}</b>
          <small>Server sample</small>
        </div>
        <button onClick={onClick}>
          Configure &amp; see price <ArrowRight size={13} />
        </button>
      </div>
    </article>
  )
}

/* ==========================================================================
   Flow Progress Stepper (01 Configure -> 02 Upload -> 03 Proof -> 04 Order)
   ========================================================================== */

function FlowStepper({
  activeStep,
  onNavigate,
}: {
  activeStep: number
  onNavigate: (page: string) => void
}) {
  const steps = [
    { num: 1, label: 'Configure Options', page: 'configurator' },
    { num: 2, label: 'Upload Artwork', page: 'upload' },
    { num: 3, label: 'Review Proof', page: 'proof' },
    { num: 4, label: 'Confirm & Order', page: 'checkout' },
  ]

  return (
    <div className="flow-stepper" role="navigation" aria-label="Order progress">
      {steps.map((s, idx) => (
        <React.Fragment key={s.num}>
          <div
            className={`flow-step-item ${
              activeStep === s.num ? 'active' : activeStep > s.num ? 'completed' : ''
            }`}
          >
            <span className="flow-step-num">
              {activeStep > s.num ? <Check size={11} /> : s.num}
            </span>
            <span>{s.label}</span>
          </div>
          {idx < steps.length - 1 && (
            <ChevronRight size={13} style={{ color: 'var(--line-strong)', margin: '0 2px' }} />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

/* ==========================================================================
   Sign-In Modal Dialog
   ========================================================================== */

function SignInModal({
  isOpen,
  onClose,
  currentUser,
  onSelectUser,
}: {
  isOpen: boolean
  onClose: () => void
  currentUser: string | null
  onSelectUser: (user: string | null) => void
}) {
  const [activeTab, setActiveTab] = useState<'demo' | 'email'>('demo')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  if (!isOpen) return null

  const demoAccounts = [
    { id: 'demo-token', name: 'Demo Customer (Standard)', role: 'Standard Account' },
    { id: 'cust_author_42', name: 'Author Account (cust_author_42)', role: 'Independent Publisher' },
    { id: 'cust_business_07', name: 'Enterprise Corporate (cust_business_07)', role: 'Commercial Print Client' },
  ]

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close dialog">
          <X size={20} />
        </button>

        <p className="eyebrow">CUSTOMER AUTHENTICATION</p>
        <h2 style={{ fontSize: 28, marginBottom: 8 }}>Sign in to Press &amp; Proof</h2>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 24 }}>
          Access authenticated draft order conversion and encrypted status audit records.
        </p>

        {currentUser && (
          <div
            style={{
              padding: 14,
              backgroundColor: 'var(--success-bg)',
              border: '1px solid var(--success-border)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 20,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <small style={{ font: 'var(--font-mono)', fontSize: 10, color: 'var(--success)', display: 'block' }}>
                CURRENTLY SIGNED IN AS
              </small>
              <b style={{ color: 'var(--ink)' }}>{currentUser}</b>
            </div>
            <button
              className="btn btn-outline"
              style={{ padding: '6px 12px' }}
              onClick={() => onSelectUser(null)}
            >
              <LogOut size={13} /> Sign out
            </button>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--line)', marginBottom: 20 }}>
          <button
            className={`btn ${activeTab === 'demo' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '8px 14px', fontSize: 11 }}
            onClick={() => setActiveTab('demo')}
          >
            Quick Demo Profiles
          </button>
          <button
            className={`btn ${activeTab === 'email' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '8px 14px', fontSize: 11 }}
            onClick={() => setActiveTab('email')}
          >
            Email &amp; Password
          </button>
        </div>

        {activeTab === 'demo' ? (
          <div>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14 }}>
              Select a simulated bearer profile supported by the Express backend auth middleware:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {demoAccounts.map((acc) => (
                <button
                  key={acc.id}
                  style={{
                    padding: '12px 16px',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: currentUser === acc.id ? 'var(--info-bg)' : 'var(--surface)',
                    borderColor: currentUser === acc.id ? 'var(--navy)' : 'var(--line)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    textAlign: 'left',
                  }}
                  onClick={() => {
                    onSelectUser(acc.id)
                    onClose()
                  }}
                >
                  <div>
                    <b style={{ display: 'block', fontSize: 13, color: 'var(--ink)' }}>{acc.name}</b>
                    <small style={{ color: 'var(--muted)', font: 'var(--font-mono)', fontSize: 10 }}>
                      Token: {acc.id} · {acc.role}
                    </small>
                  </div>
                  {currentUser === acc.id && <Check size={16} color="var(--navy)" />}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (email) {
                onSelectUser(email)
                onClose()
              }
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
          >
            <div>
              <label style={{ display: 'block', font: 'var(--font-mono)', fontSize: 10, marginBottom: 6 }}>
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                required
                placeholder="editor@pressandproof.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--surface)',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', font: 'var(--font-mono)', fontSize: 10, marginBottom: 6 }}>
                PASSWORD
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--surface)',
                }}
              />
            </div>
            <button className="btn btn-primary" type="submit" style={{ marginTop: 8 }}>
              Sign In to Account <ArrowRight size={14} />
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

/* ==========================================================================
   Mobile Navigation Drawer
   ========================================================================== */

function MobileNavDrawer({
  isOpen,
  onClose,
  onNavigate,
  backendHealth,
}: {
  isOpen: boolean
  onClose: () => void
  onNavigate: (page: string) => void
  backendHealth: { connected: boolean; version?: string }
}) {
  if (!isOpen) return null

  const handleNav = (p: string) => {
    onNavigate(p)
    onClose()
  }

  return (
    <div className="mobile-drawer" role="dialog" aria-modal="true">
      <div className="mobile-drawer-header">
        <div className="wordmark">
          <span>PRESS</span><b>&amp;</b><span>PROOF</span>
        </div>
        <button className="btn btn-ghost" onClick={onClose} aria-label="Close menu">
          <X size={24} />
        </button>
      </div>

      <div style={{ marginBottom: 24 }}>
        <span className={`backend-status-pill ${backendHealth.connected ? 'connected' : 'error'}`}>
          <span className="status-dot" />
          {backendHealth.connected ? 'Backend Connected' : 'Connecting to API...'}
        </span>
      </div>

      <nav className="mobile-nav-links">
        <button onClick={() => handleNav('home')}>Home</button>
        <button onClick={() => handleNav('catalogue')}>Products Catalogue</button>
        <button onClick={() => handleNav('configurator')}>Configurator &amp; Pricing</button>
        <button onClick={() => handleNav('tracking')}>Track Order</button>
        <button onClick={() => handleNav('bulk')}>Bulk Quotes</button>
        <button onClick={() => handleNav('help')}>Help &amp; Guidelines</button>
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: 30, borderTop: '1px solid var(--line)' }}>
        <button
          className="btn btn-primary full"
          style={{ width: '100%', padding: '14px 20px' }}
          onClick={() => handleNav('configurator')}
        >
          Start a Print Job <ArrowRight size={15} />
        </button>
      </div>
    </div>
  )
}

/* ==========================================================================
   Home Page View
   ========================================================================== */

function Home({
  products,
  onNavigate,
  onSelectProduct,
}: {
  products: Product[]
  onNavigate: (page: string) => void
  onSelectProduct: (productId: string) => void
}) {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const faqs = [
    {
      q: 'How does live server-side pricing work?',
      a: 'Unlike traditional storefronts that calculate estimated totals in client JavaScript, Press & Proof evaluates your size, paper stock, binding style, and quantity directly in a server-side pricing engine. Line items are calculated strictly in integer minor units (paise) with single-pass rounding, eliminating price discrepancies.',
    },
    {
      q: 'Can I inspect a digital proof before printing?',
      a: 'Yes. Every order goes through our automated preflight pipeline to inspect file dimensions, DPI resolution, color gamut, and bleed margins. You will review and approve a digital simulation before your draft order is submitted.',
    },
    {
      q: 'What file formats are accepted for print artwork?',
      a: 'We accept high-resolution PDFs (PDF/X-1a or PDF 1.7 recommended), TIFF, PNG, and JPEG files up to 50MB. All fonts must be embedded or outlined, with 3mm bleed margins for edge-to-edge printing.',
    },
    {
      q: 'Do you offer bulk enterprise and volume discounts?',
      a: 'Yes. Bulk tier discount brackets (5% up to 40%) are automatically factored into the live price calculation when you increase your order volume. For orders exceeding 10,000 copies, custom commercial quotes can be requested via our Bulk Quotes desk.',
    },
  ]

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">ONLINE PRINTING ENGINE</p>
          <h1>
            Print anything,<br />
            <em>see the exact price first.</em>
          </h1>
          <p className="hero-sub">
            Connected to a server-side integer pricing engine. Set your paper, binding, and quantity to watch live server quotes compute in real time.
          </p>
          <div className="hero-actions">
            <button
              className="btn btn-primary"
              onClick={() => {
                onSelectProduct('books')
                onNavigate('configurator')
              }}
            >
              Start a print job <ArrowRight size={15} />
            </button>
            <button className="btn btn-outline" onClick={() => onNavigate('tracking')}>
              Track an order
            </button>
          </div>
        </div>
        <div className="hero-art">
          <div className="sun" />
          <ProductVisual type="book" />
          <span className="art-note note-one">A5 / 120 pages</span>
          <span className="art-note note-two">Server calculated</span>
          <div className="hero-estimate">
            <span>LIVE SERVER ESTIMATE</span>
            <strong>₹2,631</strong>
            <small>10 books · A5 · paperback</small>
            <i>Minor unit integer quote</i>
          </div>
        </div>
      </section>

      <div className="offer-strip">
        <Sparkles size={14} /> <b>Server-Side Integrity:</b> Client-side price tampering is strictly rejected. Every quote is cryptographically auditable.
      </div>

      <section className="audience section">
        <div className="section-heading" style={{ maxWidth: 540 }}>
          <p className="eyebrow">WHO WE SERVE</p>
          <h2>Precision print options tailored for every workflow.</h2>
        </div>
        <div className="audience-grid">
          <article>
            <span>01</span>
            <h3>Authors &amp; Publishers</h3>
            <p>Hardcover and paperback books printed with tight tolerances, spine alignment, and archival paper stock.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Enterprises &amp; Startups</h3>
            <p>Visiting cards, spot UV finishes, branded letterheads, and collateral with bulk tier discounts.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Academics &amp; Students</h3>
            <p>Project reports, thesis binding, and documentation with rapid turnaround across India.</p>
          </article>
        </div>
      </section>

      <section className="products section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p className="eyebrow">LIVE CATALOGUE</p>
            <h2>Products from Backend API</h2>
          </div>
          <button className="btn btn-quiet" onClick={() => onNavigate('catalogue')}>
            View full catalogue <ArrowRight size={14} />
          </button>
        </div>
        <div className="product-grid">
          {products.map((p, i) => (
            <ProductCard
              key={p.id}
              product={p}
              index={i}
              onClick={() => {
                onSelectProduct(p.id)
                onNavigate('configurator')
              }}
            />
          ))}
        </div>
      </section>

      <section className="steps section">
        <div className="section-heading" style={{ maxWidth: 540 }}>
          <p className="eyebrow">HOW THE PIPELINE WORKS</p>
          <h2>Five auditable steps from file to print.</h2>
        </div>
        <div className="steps-grid">
          {[
            ['01', 'Configure', 'options', 'Server computes minor unit quote.'],
            ['02', 'Upload', 'artwork', 'Preflight metadata validation API.'],
            ['03', 'Review', 'digital proof', 'Verify specifications and margins.'],
            ['04', 'Draft', 'order', 'Idempotent state machine transition.'],
            ['05', 'Track', 'delivery', 'Audit status history timeline.'],
          ].map((s) => (
            <div className="step" key={s[0]}>
              <span>{s[0]}</span>
              <strong>
                {s[1]}
                <br />
                {s[2]}
              </strong>
              <p>{s[3]}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="pricing-banner">
        <div>
          <p className="eyebrow">INTEGRITY GUARANTEE</p>
          <h2>Pure server-side calculations. Zero rounding drift.</h2>
          <p>
            Every line item uses integer paise calculations with single-pass Math.round. Try altering quantities to inspect bulk tier discounts in real time.
          </p>
          <div style={{ marginTop: 24 }}>
            <button
              className="btn btn-rust"
              onClick={() => {
                onSelectProduct('books')
                onNavigate('configurator')
              }}
            >
              Launch Configurator <ArrowRight size={15} />
            </button>
          </div>
        </div>
        <div className="estimate-mini">
          <span>SERVER ESTIMATE</span>
          <strong>₹1,249</strong>
          <small>500 brochures · A4</small>
          <i>Verified sample v1</i>
        </div>
      </section>

      <section className="section">
        <div className="section-heading" style={{ maxWidth: 540 }}>
          <p className="eyebrow">TRUSTED REVIEWS</p>
          <h2>What our print creators say.</h2>
        </div>
        <div className="quote-grid">
          <blockquote>
            <div className="quote-rating" aria-label="5 stars">★★★★★</div>
            “The digital proof viewer identified a resolution warning before printing 500 books. Saved our entire launch.”
            <cite>Aditi Verma · Independent Author</cite>
          </blockquote>
          <blockquote>
            <div className="quote-rating" aria-label="5 stars">★★★★★</div>
            “The price shown in the live configurator matched the final invoice to the exact rupee. Clean, auditable, fast.”
            <cite>Rohan Sen · Design Lead, Apex Labs</cite>
          </blockquote>
          <blockquote>
            <div className="quote-rating" aria-label="5 stars">★★★★★</div>
            “Got our corporate stationery and visiting cards printed with spot UV. Crisp registration and dependable delivery.”
            <cite>Meera Nair · Creative Director</cite>
          </blockquote>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="section-heading" style={{ maxWidth: 540 }}>
          <p className="eyebrow">FREQUENTLY ASKED QUESTIONS</p>
          <h2>Clear answers to common questions.</h2>
        </div>
        <div className="faq-accordion">
          {faqs.map((faq, index) => (
            <div className="faq-item" key={index}>
              <button
                className="faq-trigger"
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                aria-expanded={openFaq === index}
              >
                <span>{faq.q}</span>
                <ChevronDown
                  size={18}
                  style={{
                    transform: openFaq === index ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform var(--duration-fast) var(--ease)',
                    color: 'var(--muted)',
                  }}
                />
              </button>
              {openFaq === index && <div className="faq-content">{faq.a}</div>}
            </div>
          ))}
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </>
  )
}

/* ==========================================================================
   Catalogue Page View
   ========================================================================== */

function Catalogue({
  products,
  onNavigate,
  onSelectProduct,
}: {
  products: Product[]
  onNavigate: (page: string) => void
  onSelectProduct: (productId: string) => void
}) {
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [sortOrder, setSortOrder] = useState<'default' | 'asc' | 'desc'>('default')
  const [pin, setPin] = useState('')
  const [pinMessage, setPinMessage] = useState('')

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category))
    return ['All', ...Array.from(set)]
  }, [products])

  const filtered = useMemo(() => {
    let list = filter === 'All' ? products : products.filter((p) => p.category.toLowerCase() === filter.toLowerCase())
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
    }
    if (sortOrder === 'asc') {
      list = [...list].sort((a, b) => a.sampleStartingPrice - b.sampleStartingPrice)
    } else if (sortOrder === 'desc') {
      list = [...list].sort((a, b) => b.sampleStartingPrice - a.sampleStartingPrice)
    }
    return list
  }, [products, filter, search, sortOrder])

  const handlePinCheck = () => {
    if (pin.length === 6 && /^\d+$/.test(pin)) {
      setPinMessage(`✓ Delivery available for PIN ${pin}: Estimated delivery in 2–3 business days`)
    } else {
      setPinMessage('Please enter a valid 6-digit Indian PIN code.')
    }
  }

  return (
    <>
      <div className="page-intro">
        <div className="breadcrumbs">
          <button onClick={() => onNavigate('home')}>Home</button>
          <ChevronRight size={13} />
          <span>Products</span>
        </div>
        <p className="eyebrow">API PRODUCT CATALOGUE</p>
        <h1>High-quality printing<br />for every need.</h1>
        <p>Browse standard and custom print products connected to our live pricing matrix.</p>
      </div>

      <main className="catalogue">
        <aside className="filters">
          <b>PRODUCT CATEGORIES</b>
          {categories.map((c) => (
            <button
              className={filter === c ? 'active' : ''}
              onClick={() => setFilter(c)}
              key={c}
            >
              <span style={{ textTransform: 'capitalize' }}>{c}</span>
              <span>
                {c === 'All'
                  ? products.length
                  : products.filter((p) => p.category.toLowerCase() === c.toLowerCase()).length}
              </span>
            </button>
          ))}

          <b className="filter-label">DELIVERY BY PIN CODE</b>
          <p style={{ color: 'var(--muted)', fontSize: 12, margin: '4px 0 8px' }}>
            Check courier lead times for your delivery area.
          </p>
          <div className="pin-input">
            <input
              placeholder="e.g. 400001"
              value={pin}
              maxLength={6}
              onChange={(e) => setPin(e.target.value)}
              aria-label="Enter PIN code"
            />
            <button onClick={handlePinCheck}>CHECK</button>
          </div>
          {pinMessage && (
            <small style={{ color: pinMessage.startsWith('✓') ? 'var(--success)' : 'var(--rust)', marginTop: 8, display: 'block' }}>
              {pinMessage}
            </small>
          )}
        </aside>

        <div className="catalogue-content">
          <div className="catalogue-toolbar">
            <div className="search-input-wrapper">
              <Search size={14} />
              <input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span>{filtered.length} products found</span>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                style={{
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '6px 10px',
                  backgroundColor: 'var(--surface)',
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                }}
              >
                <option value="default">Sort: Recommended</option>
                <option value="asc">Price: Low to High</option>
                <option value="desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', marginTop: 30, border: '1px solid var(--line)' }}>
              <h3>No products matched your search.</h3>
              <p style={{ color: 'var(--muted)', marginTop: 8 }}>Try clearing filters or search terms.</p>
              <button
                className="btn btn-outline"
                style={{ marginTop: 16 }}
                onClick={() => {
                  setFilter('All')
                  setSearch('')
                }}
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="catalogue-grid" style={{ marginTop: 30 }}>
              {filtered.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  index={i}
                  onClick={() => {
                    onSelectProduct(p.id)
                    onNavigate('configurator')
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer onNavigate={onNavigate} />
    </>
  )
}

/* ==========================================================================
   Product Configurator View
   ========================================================================== */

function Configurator({
  products,
  selectedProductId,
  onSelectProduct,
  onQuoteReady,
  onNavigate,
}: {
  products: Product[]
  selectedProductId: string
  onSelectProduct: (id: string) => void
  onQuoteReady: (quote: QuoteResponse, product: Product, options: Record<string, string>, quantity: number) => void
  onNavigate: (page: string) => void
}) {
  const currentProduct =
    products.find((p) => p.id === selectedProductId) || products[0] || fallbackProducts[0]

  const [options, setOptions] = useState<Record<string, string>>({})
  const [printOptions, setPrintOptions] = useState<PrintOption[]>([])
  const [quantity, setQuantity] = useState<number>(10)
  const [loadingOptions, setLoadingOptions] = useState(false)
  const [calculatingQuote, setCalculatingQuote] = useState(false)
  const [quote, setQuote] = useState<QuoteResponse | null>(null)
  const [quoteError, setQuoteError] = useState<string | null>(null)
  const [pinCode, setPinCode] = useState('')
  const [pinChecked, setPinChecked] = useState(false)

  // Fetch print options when selected product changes
  useEffect(() => {
    let active = true
    setLoadingOptions(true)
    fetchPrintOptions(currentProduct.id)
      .then((opts) => {
        if (!active) return
        setPrintOptions(opts)
        const defaults: Record<string, string> = {}
        for (const opt of opts) {
          if (opt.choices.length > 0) {
            defaults[opt.code] = opt.choices[0].value
          }
        }
        setOptions(defaults)
        setQuantity(Math.max(currentProduct.minQuantity || 1, 10))
      })
      .catch((err) => {
        console.error('Error fetching print options:', err)
      })
      .finally(() => {
        if (active) setLoadingOptions(false)
      })

    return () => {
      active = false
    }
  }, [currentProduct.id])

  // Real-time server quote calculation debounced
  useEffect(() => {
    if (printOptions.length === 0 || Object.keys(options).length === 0) return

    setCalculatingQuote(true)
    setQuoteError(null)

    const timer = setTimeout(() => {
      createQuote({
        productId: currentProduct.id,
        options,
        quantity,
      })
        .then((q) => {
          setQuote(q)
          setQuoteError(null)
        })
        .catch((err: any) => {
          setQuote(null)
          setQuoteError(err.message || 'Unable to compute quote with selected configuration.')
        })
        .finally(() => {
          setCalculatingQuote(false)
        })
    }, 200)

    return () => clearTimeout(timer)
  }, [currentProduct.id, options, quantity, printOptions.length])

  const handleOptionChange = (code: string, value: string) => {
    setOptions((prev) => ({ ...prev, [code]: value }))
  }

  const handleContinue = () => {
    if (quote) {
      onQuoteReady(quote, currentProduct, options, quantity)
      onNavigate('upload')
    }
  }

  const presets = [10, 25, 50, 100, 250, 500, 1000].filter(
    (q) => q >= (currentProduct.minQuantity || 1) && q <= (currentProduct.maxQuantity || 5000)
  )

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
            <span style={{ font: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', display: 'block', marginBottom: 12 }}>
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
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)', font: 'var(--font-mono)', fontSize: 12 }}>
              Loading print options matrix from backend...
            </div>
          ) : (
            <>
              {printOptions.map((opt, stepIndex) => (
                <div className="config-step" key={opt.id}>
                  <span>{stepIndex + 1}. {opt.name.toUpperCase()}</span>
                  <div className="option-grid">
                    {opt.choices.map((choice) => (
                      <button
                        key={choice.value}
                        className={options[opt.code] === choice.value ? 'selected' : ''}
                        onClick={() => handleOptionChange(opt.code, choice.value)}
                      >
                        <b>{choice.label}</b>
                        {choice.description && <small>{choice.description}</small>}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="config-step">
                <span>
                  {printOptions.length + 1}. QUANTITY (MIN {currentProduct.minQuantity} · MAX {currentProduct.maxQuantity})
                </span>
                <div className="quantity-wrapper">
                  <div className="quantity">
                    <button
                      onClick={() => setQuantity((q) => Math.max(currentProduct.minQuantity || 1, q - 5))}
                      disabled={quantity <= (currentProduct.minQuantity || 1)}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={15} />
                    </button>
                    <b>{quantity}</b>
                    <button
                      onClick={() => setQuantity((q) => Math.min(currentProduct.maxQuantity || 5000, q + 5))}
                      disabled={quantity >= (currentProduct.maxQuantity || 5000)}
                      aria-label="Increase quantity"
                    >
                      <Plus size={15} />
                    </button>
                    <span>Copies</span>
                  </div>

                  <div className="preset-chips">
                    {presets.map((val) => (
                      <button
                        key={val}
                        className={`preset-chip ${quantity === val ? 'active' : ''}`}
                        onClick={() => setQuantity(val)}
                      >
                        {val} copies
                      </button>
                    ))}
                  </div>
                  <small style={{ color: 'var(--muted)', fontSize: 11 }}>
                    Bulk discount tiers are automatically calculated server-side based on quantity breaks.
                  </small>
                </div>
              </div>

              <div className="config-step">
                <span>{printOptions.length + 2}. DELIVERY PIN CODE ESTIMATE</span>
                <div style={{ display: 'flex', gap: 8, maxWidth: 320 }}>
                  <input
                    placeholder="Enter PIN code"
                    value={pinCode}
                    maxLength={6}
                    onChange={(e) => {
                      setPinCode(e.target.value)
                      setPinChecked(false)
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
                  <button
                    className="btn btn-outline"
                    onClick={() => setPinChecked(true)}
                  >
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

        <aside className="price-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="eyebrow" style={{ margin: 0 }}>LIVE SERVER ESTIMATE</span>
            <span className="audit-badge">
              <ShieldCheck size={11} /> Audited
            </span>
          </div>

          <div style={{ opacity: calculatingQuote ? 0.6 : 1, transition: 'opacity 150ms ease' }}>
            {quote ? (
              <>
                <b>
                  {money(Math.round(quote.total / quantity), true)}
                  <small> per copy</small>
                </b>

                <div className="breakdown">
                  {quote.lineItems.map((li, idx) => (
                    <span key={idx}>
                      {li.description}
                      <i style={{ color: li.lineTotal < 0 ? 'var(--success)' : 'inherit' }}>
                        {money(li.lineTotal, true)}
                      </i>
                    </span>
                  ))}
                </div>

                <div className="grand-total">
                  <span>Grand Total (Paise Audited)</span>
                  <strong>{money(quote.total, true)}</strong>
                </div>

                <div style={{ margin: '6px 0 16px', fontSize: 10, color: 'var(--muted)', font: 'var(--font-mono)' }}>
                  Quote ID: {quote.id.slice(0, 16)}... · Valid for 30m
                </div>
              </>
            ) : (
              <div style={{ padding: '36px 0', textAlign: 'center', color: 'var(--muted)' }}>
                {calculatingQuote ? 'Calculating server estimate...' : 'Select valid options'}
              </div>
            )}
          </div>

          <button
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px 20px', fontSize: 11 }}
            disabled={!quote || calculatingQuote}
            onClick={handleContinue}
          >
            Continue to upload artwork <ArrowRight size={14} />
          </button>
          <p className="sample-note">
            Calculated server-side in integer paise minor units. Client-supplied totals are rejected at the edge.
          </p>
        </aside>
      </main>

      <Footer onNavigate={onNavigate} />
    </>
  )
}

/* ==========================================================================
   Product-Specific Artwork Upload View
   ========================================================================== */

function Upload({
  quote,
  product,
  options,
  slotsData,
  onSlotChange,
  onSlotRemove,
  onNavigate,
}: {
  quote: QuoteResponse | null
  product: Product | null
  options: Record<string, string>
  slotsData: Record<string, UploadedSlotData | undefined>
  onSlotChange: (slotId: string, data: UploadedSlotData) => void
  onSlotRemove: (slotId: string) => void
  onNavigate: (page: string) => void
}) {
  const config = useMemo(() => getProductUploadConfig(product?.id), [product?.id])
  const [uploadingSlots, setUploadingSlots] = useState<Record<string, boolean>>({})
  const [slotErrors, setSlotErrors] = useState<Record<string, string | null>>({})
  const [dragOverSlots, setDragOverSlots] = useState<Record<string, boolean>>({})
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const MAX_FILE_SIZE = 250 * 1024 * 1024 // 250MB

  // Only display upload fields applicable to the selected product and its configuration
  const activeSlots = useMemo(() => {
    return config.slots.filter((slot) => {
      if (!slot.condition) return true
      return slot.condition(options)
    })
  }, [config, options])

  const handleFileUpload = async (slot: UploadSlotConfig, file: File) => {
    setSlotErrors((prev) => ({ ...prev, [slot.id]: null }))

    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    const isExtensionAllowed = slot.acceptedExtensions.some((allowed) => ext === allowed.toLowerCase())
    const isMimeAllowed = slot.acceptedMimeTypes.some((mime) => {
      if (mime.endsWith('/*')) {
        return file.type.startsWith(mime.replace('/*', ''))
      }
      return file.type === mime
    })

    if (!isExtensionAllowed && !isMimeAllowed) {
      setSlotErrors((prev) => ({
        ...prev,
        [slot.id]: `Unsupported file format (${ext}). Allowed formats: ${slot.acceptedExtensions.join(', ').toUpperCase()}.`,
      }))
      return
    }

    if (file.size > (slot.maxSizeBytes || MAX_FILE_SIZE)) {
      setSlotErrors((prev) => ({
        ...prev,
        [slot.id]: `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds limit (${Math.round((slot.maxSizeBytes || MAX_FILE_SIZE) / (1024 * 1024))}MB).`,
      }))
      return
    }

    setUploadingSlots((prev) => ({ ...prev, [slot.id]: true }))
    try {
      let previewUrl = ''
      let isObjectUrl = false
      let metadata: any = {}

      try {
        const preview = await generateArtworkPreview(file)
        previewUrl = preview.previewUrl
        isObjectUrl = !!preview.isObjectUrl
        metadata = {
          width: preview.width,
          height: preview.height,
          aspectRatio: preview.aspectRatio,
          detectedLayout: preview.detectedLayout,
          numPages: preview.numPages,
        }
      } catch (previewErr) {
        console.warn('Artwork preview generation note:', previewErr)
        previewUrl = ''
      }

      let uploadResult: UploadMetadataResponse | null = null
      try {
        uploadResult = await registerArtworkUpload({
          originalFilename: file.name,
          mimeType: file.type || 'application/octet-stream',
          sizeBytes: file.size,
          quoteId: quote?.id,
        })
      } catch (regErr) {
        console.warn('Upload registration warning:', regErr)
      }

      onSlotChange(slot.id, {
        file,
        previewUrl,
        isObjectUrl,
        metadata,
        uploadResponse: uploadResult,
      })
    } catch (err: any) {
      setSlotErrors((prev) => ({
        ...prev,
        [slot.id]: err.message || 'File processing failed.',
      }))
    } finally {
      setUploadingSlots((prev) => ({ ...prev, [slot.id]: false }))
    }
  }

  const handleRemove = (slotId: string) => {
    onSlotRemove(slotId)
    setSlotErrors((prev) => ({ ...prev, [slotId]: null }))
    if (inputRefs.current[slotId]) {
      inputRefs.current[slotId]!.value = ''
    }
  }

  // Preflight validation checks from the central product configuration
  const validationResults = useMemo(() => {
    return config.evaluateChecks({
      productId: config.productId,
      options,
      slotsData,
      quantity: quote?.quantity,
    })
  }, [config, options, slotsData, quote?.quantity])

  // Can proceed if all required active slots are uploaded and none are currently uploading
  const canProceed = useMemo(() => {
    const isAnyUploading = Object.values(uploadingSlots).some(Boolean)
    if (isAnyUploading) return false

    return activeSlots.every((slot) => {
      const isRequired = typeof slot.required === 'function' ? slot.required(options) : slot.required
      if (!isRequired) return true
      return Boolean(slotsData[slot.id]?.file)
    })
  }, [activeSlots, options, slotsData, uploadingSlots])

  return (
    <>
      <div className="page-intro compact">
        <div className="breadcrumbs">
          <button onClick={() => onNavigate('home')}>Home</button>
          <ChevronRight size={13} />
          <button onClick={() => onNavigate('configurator')}>Configurator</button>
          <ChevronRight size={13} />
          <span>Upload Artwork</span>
        </div>
        <FlowStepper activeStep={2} onNavigate={onNavigate} />
        <h1 style={{ marginTop: 24 }}>{config.title}</h1>
        <p>{config.subtitle}</p>
      </div>

      <main className="upload-layout">
        <div className="upload-main">
          {activeSlots.map((slot, index) => {
            const slotData = slotsData[slot.id]
            const isUploading = !!uploadingSlots[slot.id]
            const isDragOver = !!dragOverSlots[slot.id]
            const error = slotErrors[slot.id]
            const isRequired = typeof slot.required === 'function' ? slot.required(options) : slot.required

            return (
              <div
                key={slot.id}
                className={index > 0 ? 'cover-upload-section' : undefined}
                style={index > 0 ? { marginTop: 28 } : undefined}
              >
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ fontSize: 18, margin: 0, color: 'var(--ink)' }}>
                      {slot.title}
                    </h3>
                    <span
                      style={{
                        fontSize: 10,
                        fontFamily: 'var(--font-mono)',
                        padding: '2px 6px',
                        borderRadius: 3,
                        backgroundColor: isRequired ? 'rgba(180, 83, 9, 0.12)' : 'var(--surface-hover)',
                        color: isRequired ? 'var(--amber)' : 'var(--muted)',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                      }}
                    >
                      {isRequired ? 'Required' : 'Optional'}
                    </span>
                  </div>
                  <p style={{ color: 'var(--muted)', fontSize: 13, margin: '4px 0 0' }}>
                    {slot.subtitle}
                  </p>
                </div>

                <input
                  type="file"
                  ref={(el) => {
                    inputRefs.current[slot.id] = el
                  }}
                  style={{ display: 'none' }}
                  accept={slot.acceptedExtensions.join(',')}
                  onClick={(e) => {
                    ;(e.target as HTMLInputElement).value = ''
                  }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(slot, e.target.files[0])
                    }
                  }}
                />

                {!slotData ? (
                  <div
                    className={slot.role === 'cover' ? 'cover-dropzone' : 'dropzone'}
                    style={{
                      borderColor: isDragOver ? 'var(--navy)' : undefined,
                      backgroundColor: isDragOver ? 'var(--surface-hover)' : undefined,
                    }}
                    onClick={() => inputRefs.current[slot.id]?.click()}
                    onDragOver={(e) => {
                      e.preventDefault()
                      setDragOverSlots((prev) => ({ ...prev, [slot.id]: true }))
                    }}
                    onDragLeave={() => {
                      setDragOverSlots((prev) => ({ ...prev, [slot.id]: false }))
                    }}
                    onDrop={(e) => {
                      e.preventDefault()
                      setDragOverSlots((prev) => ({ ...prev, [slot.id]: false }))
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleFileUpload(slot, e.dataTransfer.files[0])
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && inputRefs.current[slot.id]?.click()}
                  >
                    {slot.role === 'cover' || slot.role === 'secondary' ? (
                      <FileUp size={32} style={{ color: 'var(--muted)', marginBottom: 10 }} />
                    ) : (
                      <UploadCloud size={36} />
                    )}
                    <h4 style={{ fontSize: 15, margin: '0 0 6px', fontWeight: 600 }}>
                      {slot.dropzoneLabel}
                    </h4>
                    <p style={{ color: 'var(--muted)', fontSize: 12, margin: '0 0 14px' }}>
                      {slot.formatHelpText}
                    </p>
                    <button
                      className="btn btn-outline"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        inputRefs.current[slot.id]?.click()
                      }}
                    >
                      {isUploading ? 'Registering with backend...' : slot.buttonLabel}
                    </button>
                    {!isRequired && (
                      <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 12, marginBottom: 0, fontStyle: 'italic' }}>
                        This slot is optional. If not uploaded, standard default layout will be used.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="uploaded-file">
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 4,
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'var(--surface-alt)',
                        border: '1px solid var(--line)',
                        flexShrink: 0,
                      }}
                    >
                      {slotData.previewUrl ? (
                        <img
                          src={slotData.previewUrl}
                          alt={`${slot.title} thumbnail`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--ink)' }}>
                          {slotData.file.name.split('.').pop()?.toUpperCase() || 'FILE'}
                        </span>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <b style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {slotData.file.name}
                      </b>
                      <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--muted)' }}>
                        {(slotData.file.size / (1024 * 1024)).toFixed(2)} MB ·{' '}
                        {slotData.uploadResponse ? (
                          <span style={{ color: 'var(--success)', fontWeight: 600 }}>✓ Registered with Backend</span>
                        ) : (
                          <span style={{ color: 'var(--success)', fontWeight: 600 }}>✓ Ready for proof</span>
                        )}
                      </p>
                      {slotData.uploadResponse && (
                        <small style={{ font: 'var(--font-mono)', color: 'var(--muted)', fontSize: 10, display: 'block', marginTop: 2 }}>
                          Server File ID: {slotData.uploadResponse.fileId}
                        </small>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{ padding: '6px 12px', fontSize: 11 }}
                        onClick={() => inputRefs.current[slot.id]?.click()}
                      >
                        Replace
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        style={{ color: 'var(--rust)', padding: '6px 10px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}
                        onClick={() => handleRemove(slot.id)}
                        aria-label={`Remove ${slot.title}`}
                      >
                        <Trash2 size={14} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                )}

                {error && (
                  <div
                    style={{
                      backgroundColor: 'var(--warning-bg)',
                      border: '1px solid var(--warning-border)',
                      color: 'var(--rust)',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      marginTop: 10,
                      fontSize: 12,
                    }}
                  >
                    {error}
                  </div>
                )}
              </div>
            )
          })}

          <button
            className="btn btn-primary"
            style={{ padding: '14px 24px', fontSize: 11, marginTop: 28 }}
            disabled={!canProceed}
            onClick={() => onNavigate('proof')}
          >
            Continue to visual proof <ArrowRight size={14} />
          </button>
        </div>

        <aside className="upload-side">
          <div className="side-title">
            <FileCheck2 size={16} />
            <b>PRINT-READINESS CHECKS</b>
          </div>
          {validationResults.map((result) => (
            <div className="check-row" key={result.ruleId}>
              <span>
                {result.name}
                <b style={{ maxWidth: 170, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {result.details}
                </b>
              </span>
              <strong
                className={result.status === 'WAITING' ? 'warning' : ''}
                style={{
                  color:
                    result.status === 'PASSED'
                      ? 'var(--success)'
                      : result.status === 'WARNING' || result.status === 'WAITING'
                      ? 'var(--amber)'
                      : result.status === 'FAILED'
                      ? 'var(--rust)'
                      : 'var(--muted)',
                  fontSize: 10,
                }}
              >
                {result.status === 'NOT_VERIFIED' ? 'NOT VERIFIED' : result.status}
              </strong>
            </div>
          ))}
          <p style={{ color: 'var(--muted)', fontSize: 11, marginTop: 16, lineHeight: 1.5 }}>
            Automated preflight evaluates files for <b>{product?.name || 'selected product'}</b>. Server keys generated at <code>POST /api/demo/uploads</code>.
          </p>
        </aside>
      </main>

      <Footer onNavigate={onNavigate} />
    </>
  )
}

/* ==========================================================================
   Proof Review View
   ========================================================================== */

function Proof({
  quote,
  product,
  options,
  quantity,
  interiorFile,
  coverFile,
  coverPreviewUrl,
  coverMetadata,
  interiorPageCount,
  currentManuscriptPage,
  onManuscriptPageChange,
  onManuscriptPageCountSync,
  proofApproved,
  onSetProofApproved,
  onNavigate,
}: {
  quote: QuoteResponse | null
  product: Product | null
  options: Record<string, string>
  quantity: number
  interiorFile: File | null
  coverFile: File | null
  coverPreviewUrl: string | null
  coverMetadata?: {
    width?: number
    height?: number
    aspectRatio?: number
    detectedLayout?: ArtworkLayoutType
    numPages?: number
  } | null
  interiorPageCount: number
  currentManuscriptPage: number
  onManuscriptPageChange: (page: number) => void
  onManuscriptPageCountSync?: (count: number) => void
  proofApproved: boolean
  onSetProofApproved: (approved: boolean) => void
  onNavigate: (page: string) => void
}) {
  const [activePreview, setActivePreview] = useState<'cover' | 'manuscript'>('cover')
  const [coverDisplayMode, setCoverDisplayMode] = useState<'full-wrap' | 'front-only' | 'mockup'>('full-wrap')
  const [showGuides, setShowGuides] = useState<boolean>(true)
  const [coverZoom, setCoverZoom] = useState<number>(1.0)
  const [detectedLayout, setDetectedLayout] = useState<ArtworkLayoutType>(
    coverMetadata?.detectedLayout || 'unknown'
  )
  const [userLayoutConfirmed, setUserLayoutConfirmed] = useState<ArtworkLayoutType | null>(null)

  // Dynamic spread geometry based on configured page count, paper stock, and binding
  const spreadCalc = useMemo(() => {
    return calculateCoverSpreadDimensions({
      pageCount: interiorPageCount,
      size: options.size,
      paper: options.paper,
      binding: options.binding,
    })
  }, [interiorPageCount, options.size, options.paper, options.binding])

  // Sync detected layout when metadata changes
  useEffect(() => {
    if (coverMetadata?.detectedLayout) {
      setDetectedLayout(coverMetadata.detectedLayout)
    } else if (!coverFile) {
      setDetectedLayout('unknown')
      setUserLayoutConfirmed(null)
    }
  }, [coverMetadata, coverFile])

  // Fallback image dimension detection on load
  const handleCoverImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    if (img.naturalWidth && img.naturalHeight && (!detectedLayout || detectedLayout === 'unknown')) {
      const detected = detectArtworkLayout(img.naturalWidth, img.naturalHeight, 1)
      setDetectedLayout(detected.layout)
    }
  }

  const effectiveLayout = userLayoutConfirmed || detectedLayout

  const [pdfDoc, setPdfDoc] = useState<any>(null)
  const [isDocLoading, setIsDocLoading] = useState(false)
  const [docError, setDocError] = useState<string | null>(null)
  const [isPageRendering, setIsPageRendering] = useState(false)
  const [pageRenderError, setPageRenderError] = useState<string | null>(null)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const activeRenderTaskRef = useRef<any>(null)
  const renderSeqRef = useRef<number>(0)
  const pdfDocRef = useRef<any>(null)

  // Load interior PDF document
  useEffect(() => {
    let isCancelled = false

    if (!interiorFile) {
      if (pdfDocRef.current) {
        try {
          (pdfDocRef.current as any)?.destroy?.()
        } catch (e) {}
        pdfDocRef.current = null
      }
      setPdfDoc(null)
      return
    }

    const loadDoc = async () => {
      setIsDocLoading(true)
      setDocError(null)

      try {
        const arrayBuffer = await interiorFile.arrayBuffer()
        if (isCancelled) return

        const pdfjs = await import('pdfjs-dist')
        if (!pdfjs.GlobalWorkerOptions.workerSrc) {
          pdfjs.GlobalWorkerOptions.workerSrc =
            typeof window !== 'undefined'
              ? '/pdf.worker.min.mjs'
              : `https://unpkg.com/pdfjs-dist@${pdfjs.version || '6.4.299'}/build/pdf.worker.min.mjs`
        }

        const loadingTask = pdfjs.getDocument({
          data: new Uint8Array(arrayBuffer),
        })

        const doc = await loadingTask.promise
        if (isCancelled) {
          try {
            (doc as any)?.destroy?.()
          } catch (e) {}
          return
        }

        if (pdfDocRef.current && pdfDocRef.current !== doc) {
          try {
            (pdfDocRef.current as any)?.destroy?.()
          } catch (e) {}
        }
        pdfDocRef.current = doc
        setPdfDoc(doc)

        if (doc.numPages && doc.numPages !== interiorPageCount && onManuscriptPageCountSync) {
          onManuscriptPageCountSync(doc.numPages)
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.error('Failed to load interior PDF:', err)
          setDocError(err.message || 'Failed to load interior PDF document')
          setPdfDoc(null)
        }
      } finally {
        if (!isCancelled) {
          setIsDocLoading(false)
        }
      }
    }

    loadDoc()

    return () => {
      isCancelled = true
      if (activeRenderTaskRef.current) {
        try {
          activeRenderTaskRef.current.cancel()
        } catch (e) {}
        activeRenderTaskRef.current = null
      }
    }
  }, [interiorFile])

  // Render selected manuscript page to canvas
  useEffect(() => {
    if (activePreview !== 'manuscript') {
      return
    }

    if (!pdfDoc) {
      return
    }

    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return
    }

    // Cancel any previous in-flight render task
    if (activeRenderTaskRef.current) {
      try {
        activeRenderTaskRef.current.cancel()
      } catch (e) {}
      activeRenderTaskRef.current = null
    }

    const currentSeq = ++renderSeqRef.current
    setIsPageRendering(true)
    setPageRenderError(null)

    const renderPage = async () => {
      try {
        const pageNum = Math.max(1, Math.min(currentManuscriptPage, pdfDoc.numPages))
        const page = await pdfDoc.getPage(pageNum)
        if (currentSeq !== renderSeqRef.current) {
          return
        }

        // Calculate viewport to fit inside standard preview container without distortion
        const unscaledViewport = page.getViewport({ scale: 1.0 })
        const targetWidth = 340
        const targetHeight = 460
        const scale = Math.min(targetWidth / unscaledViewport.width, targetHeight / unscaledViewport.height)

        const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
        const viewport = page.getViewport({ scale: scale * dpr })

        // Clear canvas before rendering new page
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        canvas.width = Math.floor(viewport.width)
        canvas.height = Math.floor(viewport.height)
        canvas.style.width = `${Math.floor(viewport.width / dpr)}px`
        canvas.style.height = `${Math.floor(viewport.height / dpr)}px`

        const renderContext = {
          canvasContext: ctx as any,
          canvas: canvas as any,
          viewport,
        }

        const task = page.render(renderContext as any)
        activeRenderTaskRef.current = task

        await task.promise

        if (currentSeq === renderSeqRef.current) {
          setIsPageRendering(false)
          activeRenderTaskRef.current = null
        }
      } catch (err: any) {
        if (err?.name === 'RenderingCancelledException' || currentSeq !== renderSeqRef.current) {
          return
        }
        console.error('Error rendering manuscript page:', err)
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        setPageRenderError(err.message || 'Error rendering manuscript page')
        setIsPageRendering(false)
        activeRenderTaskRef.current = null
      }
    }

    renderPage()

    return () => {
      if (activeRenderTaskRef.current) {
        try {
          activeRenderTaskRef.current.cancel()
        } catch (e) {}
        activeRenderTaskRef.current = null
      }
    }
  }, [pdfDoc, currentManuscriptPage, activePreview])

  const totalPages = pdfDoc?.numPages || interiorPageCount || 1

  const handlePrevPage = () => {
    if (currentManuscriptPage > 1) {
      onManuscriptPageChange(currentManuscriptPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentManuscriptPage < totalPages) {
      onManuscriptPageChange(currentManuscriptPage + 1)
    }
  }

  return (
    <>
      <div className="page-intro compact">
        <div className="breadcrumbs">
          <button onClick={() => onNavigate('home')}>Home</button>
          <ChevronRight size={13} />
          <button onClick={() => onNavigate('upload')}>Upload</button>
          <ChevronRight size={13} />
          <span>Proof Review</span>
        </div>
        <FlowStepper activeStep={3} onNavigate={onNavigate} />
        <h1 style={{ marginTop: 24 }}>Visual preview &amp; proof</h1>
        <p>Review specifications and trim lines before order creation.</p>
      </div>

      <main className="proof-layout">
        <div className="proof-viewer">
          {/* Top Bar: Audited Label on left, Mode Toggle on right */}
          <div className="mockup-label">
            {activePreview === 'cover' ? (
              coverDisplayMode === 'full-wrap' ? (
                <>FULL COVER WRAP SPREAD · {options.binding?.toUpperCase() || 'PAPERBACK'} · SPINE ~{spreadCalc.spineWidthMm}MM</>
              ) : coverDisplayMode === 'front-only' ? (
                <>FRONT COVER TRIM PREVIEW · {spreadCalc.trimDescription.toUpperCase()}</>
              ) : (
                <>BOOK COVER 3D MOCKUP</>
              )
            ) : (
              <>MANUSCRIPT INTERIOR · PAGE {currentManuscriptPage} OF {totalPages}</>
            )}
          </div>

          <div className="proof-view-toggle">
            <button
              type="button"
              className={`toggle-tab ${activePreview === 'cover' ? 'active' : ''}`}
              onClick={() => setActivePreview('cover')}
              id="toggle-cover-preview"
            >
              <BookOpen size={12} />
              <span>Cover Wrap</span>
              {coverFile && (
                <span className="tab-badge">
                  {effectiveLayout === 'front-only' ? 'Front only' : 'Spread'}
                </span>
              )}
            </button>
            <button
              type="button"
              className={`toggle-tab ${activePreview === 'manuscript' ? 'active' : ''}`}
              onClick={() => setActivePreview('manuscript')}
              id="toggle-manuscript-preview"
            >
              <FileText size={12} />
              <span>Manuscript Preview</span>
              {interiorFile && <span className="tab-badge">{totalPages} pp</span>}
            </button>
          </div>

          {/* Preview Area: Cover Wrap Spread vs Manuscript Sheet */}
          {activePreview === 'cover' ? (
            <div className="cover-viewer-container">
              {/* Honest Format & Panel Arrangement Warnings / Confirmations */}
              {coverFile && effectiveLayout === 'front-only' && (
                <div className="front-only-warning">
                  <CircleHelp size={13} style={{ color: 'var(--rust)', flexShrink: 0 }} />
                  <span>
                    Front-cover-only artwork detected. Back cover and spine are unprinted.
                  </span>
                  {userLayoutConfirmed !== 'full-wrap' && (
                    <button
                      type="button"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--muted)',
                        fontSize: 9,
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        padding: '0 2px',
                        fontFamily: 'inherit',
                      }}
                      onClick={() => setUserLayoutConfirmed('full-wrap')}
                    >
                      (Force Full Wrap)
                    </button>
                  )}
                </div>
              )}

              {coverFile && (effectiveLayout === 'multi-page' || effectiveLayout === 'unknown') && !userLayoutConfirmed && (
                <div className="front-only-warning" style={{ color: 'var(--ink)' }}>
                  <CircleHelp size={13} style={{ color: 'var(--navy)', flexShrink: 0 }} />
                  <span>
                    {effectiveLayout === 'multi-page'
                      ? `Multi-page PDF detected (${coverMetadata?.numPages || 'multiple'} pp). Confirm intended arrangement:`
                      : 'Non-standard artwork aspect ratio. Confirm intended arrangement:'}
                  </span>
                  <button
                    type="button"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--navy)',
                      fontSize: 10,
                      fontWeight: 600,
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      padding: '0 4px',
                      fontFamily: 'inherit',
                    }}
                    onClick={() => setUserLayoutConfirmed('full-wrap')}
                  >
                    Full Wrap
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--navy)',
                      fontSize: 10,
                      fontWeight: 600,
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      padding: '0 4px',
                      fontFamily: 'inherit',
                    }}
                    onClick={() => setUserLayoutConfirmed('front-only')}
                  >
                    Front Cover Only
                  </button>
                </div>
              )}

              {/* Cover Interaction Toolbar */}
              <div className="cover-toolbar">
                <div className="cover-mode-pills">
                  <button
                    type="button"
                    className={`cover-pill-btn ${coverDisplayMode === 'full-wrap' ? 'active' : ''}`}
                    onClick={() => setCoverDisplayMode('full-wrap')}
                    id="btn-cover-mode-full-wrap"
                    title="View complete back, spine, and front cover spread"
                  >
                    Full Wrap Spread
                  </button>
                  <button
                    type="button"
                    className={`cover-pill-btn ${coverDisplayMode === 'front-only' ? 'active' : ''}`}
                    onClick={() => setCoverDisplayMode('front-only')}
                    id="btn-cover-mode-front-only"
                    title="View front cover panel only"
                  >
                    Front Cover
                  </button>
                  <button
                    type="button"
                    className={`cover-pill-btn ${coverDisplayMode === 'mockup' ? 'active' : ''}`}
                    onClick={() => setCoverDisplayMode('mockup')}
                    id="btn-cover-mode-mockup"
                    title="View 3D perspective mockup"
                  >
                    3D Mockup
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {coverDisplayMode !== 'mockup' && (
                    <button
                      type="button"
                      className={`cover-guides-btn ${showGuides ? 'active' : ''}`}
                      onClick={() => setShowGuides(!showGuides)}
                      id="btn-toggle-cover-guides"
                      title="Toggle bleed, trim, and spine fold guides"
                    >
                      <span>Guides:</span>
                      <b>{showGuides ? 'ON' : 'OFF'}</b>
                    </button>
                  )}

                  {coverDisplayMode === 'full-wrap' && (
                    <div className="cover-zoom-ctrls">
                      <button
                        type="button"
                        className="cover-zoom-btn"
                        onClick={() => setCoverZoom((z) => Math.max(0.8, Number((z - 0.1).toFixed(1))))}
                        disabled={coverZoom <= 0.8}
                        aria-label="Zoom out cover"
                      >
                        <Minus size={11} />
                      </button>
                      <span style={{ minWidth: 28, textAlign: 'center' }}>{Math.round(coverZoom * 100)}%</span>
                      <button
                        type="button"
                        className="cover-zoom-btn"
                        onClick={() => setCoverZoom((z) => Math.min(1.5, Number((z + 0.1).toFixed(1))))}
                        disabled={coverZoom >= 1.5}
                        aria-label="Zoom in cover"
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Mode 1: Full Wrap Spread */}
              {coverDisplayMode === 'full-wrap' && (
                <div
                  className="cover-spread-wrapper"
                  style={{
                    transform: coverZoom !== 1 ? `scale(${coverZoom})` : undefined,
                  }}
                >
                  <div
                    className="cover-wrap-spread"
                    style={{
                      aspectRatio: `${spreadCalc.totalSpreadWithBleedWidthMm} / ${spreadCalc.totalSpreadWithBleedHeightMm}`,
                    }}
                  >
                    {/* Render uploaded full-wrap artwork without cropping or stretching */}
                    {coverPreviewUrl && effectiveLayout !== 'front-only' && (
                      <img
                        src={coverPreviewUrl}
                        onLoad={handleCoverImageLoad}
                        className="cover-spread-art"
                        alt="Full wraparound book cover spread"
                      />
                    )}

                    {/* Three Connected Regions: Back Cover, Spine, Front Cover */}
                    <div className="cover-spread-panels">
                      {/* Region 1: Back Cover (Left) */}
                      <div
                        className="spread-panel back-cover"
                        style={{ width: `${spreadCalc.backWidthPercent}%` }}
                      >
                        <span className="panel-tag">BACK COVER</span>
                        {(!coverPreviewUrl || effectiveLayout === 'front-only') && (
                          <div className="unprinted-panel-notice">
                            <b>{effectiveLayout === 'front-only' ? 'Unprinted Panel' : 'Back Cover'}</b>
                            <span>
                              {effectiveLayout === 'front-only'
                                ? 'Back cover artwork not supplied'
                                : 'No cover artwork uploaded'}
                            </span>
                            <small>
                              {effectiveLayout === 'front-only'
                                ? 'Will remain unprinted blank'
                                : 'Awaiting artwork file'}
                            </small>
                          </div>
                        )}
                        <span className="panel-dim">{spreadCalc.trimWidthMm} mm</span>
                      </div>

                      {/* Region 2: Spine (Centre) */}
                      <div
                        className="spread-panel spine"
                        style={{ width: `${spreadCalc.spineWidthPercent}%` }}
                      >
                        <span className="panel-tag" style={{ fontSize: 7, padding: '1px 3px' }}>
                          SPINE
                        </span>
                        <span className="spine-text-rot">
                          SPINE · {spreadCalc.spineWidthMm} mm
                          {effectiveLayout === 'front-only' ? ' (BLANK)' : ''}
                        </span>
                        <span className="panel-dim" style={{ alignSelf: 'center' }}>
                          {spreadCalc.spineWidthMm} mm
                        </span>
                      </div>

                      {/* Region 3: Front Cover (Right) */}
                      <div
                        className="spread-panel front-cover"
                        style={{ width: `${spreadCalc.frontWidthPercent}%` }}
                      >
                        <span className="panel-tag" style={{ zIndex: 3 }}>
                          FRONT COVER
                        </span>
                        {coverPreviewUrl && effectiveLayout === 'front-only' ? (
                          <img
                            src={coverPreviewUrl}
                            onLoad={handleCoverImageLoad}
                            style={{
                              position: 'absolute',
                              inset: 0,
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                              zIndex: 1,
                            }}
                            alt="Front cover artwork"
                          />
                        ) : !coverPreviewUrl ? (
                          <div className="unprinted-panel-notice">
                            <b>Front Cover</b>
                            <span>No cover artwork uploaded</span>
                            <small>Awaiting artwork file</small>
                          </div>
                        ) : null}
                        <span className="panel-dim" style={{ zIndex: 3 }}>
                          {spreadCalc.trimWidthMm} mm
                        </span>
                      </div>
                    </div>

                    {/* Optional Bleed and Trim Guides Overlay */}
                    {showGuides && (
                      <div className="cover-guides-overlay">
                        <div className="guide-bleed-box">
                          <span className="guide-bleed-tag">3mm Bleed Limit</span>
                        </div>
                        <div className="guide-trim-box">
                          <span className="guide-trim-tag">Trim Cut Line</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Mode 2: Front Cover Only */}
              {coverDisplayMode === 'front-only' && (
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: 320,
                    aspectRatio: `${spreadCalc.trimWidthMm} / ${spreadCalc.trimHeightMm}`,
                    backgroundColor: '#F8F6F0',
                    borderRadius: 2,
                    boxShadow: '0 16px 38px rgba(34, 33, 30, 0.16)',
                    border: '1px solid rgba(34, 33, 30, 0.12)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: 12,
                    overflow: 'hidden',
                    margin: 'auto',
                  }}
                >
                  {coverPreviewUrl ? (
                    <img
                      src={coverPreviewUrl}
                      onLoad={handleCoverImageLoad}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                      }}
                      alt="Front cover artwork"
                    />
                  ) : (
                    <div className="cover-placeholder" style={{ margin: 'auto' }}>
                      <FileText size={32} style={{ opacity: 0.45, marginBottom: 8 }} />
                      <span>Front cover artwork not uploaded</span>
                      <small>Upload artwork to preview.</small>
                    </div>
                  )}

                  {showGuides && (
                    <div className="cover-guides-overlay">
                      <div className="guide-trim-box">
                        <span className="guide-trim-tag">
                          Front Trim: {spreadCalc.trimWidthMm} × {spreadCalc.trimHeightMm} mm
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Mode 3: 3D Mockup */}
              {coverDisplayMode === 'mockup' && (
                <div className={`book-preview ${coverPreviewUrl ? 'with-cover' : ''}`}>
                  {coverPreviewUrl ? (
                    <img
                      src={coverPreviewUrl}
                      className="book-preview-img"
                      alt="Cover artwork preview"
                    />
                  ) : (
                    <div className="cover-placeholder">
                      <FileText size={32} style={{ opacity: 0.45, marginBottom: 8 }} />
                      <span>Cover artwork not uploaded</span>
                      <small>Interior document pages will be bound as configured.</small>
                    </div>
                  )}
                </div>
              )}

              {/* Bottom Specifications & Geometry Bar */}
              <div className="cover-specs-bar">
                <span>
                  Estimated Spread:{' '}
                  <b>
                    {spreadCalc.totalSpreadWithBleedWidthMm} × {spreadCalc.totalSpreadWithBleedHeightMm} mm
                  </b>{' '}
                  (incl. 3mm bleed)
                </span>
                <span>·</span>
                <span>
                  Spine: <b>~{spreadCalc.spineWidthMm} mm</b> ({interiorPageCount} pp ·{' '}
                  {spreadCalc.paperStockDescription.split(' ')[0]} GSM)
                </span>
                <span>·</span>
                <span>
                  Binding: <b>{spreadCalc.bindingDescription}</b>
                </span>
              </div>
            </div>
          ) : (
            <div className="manuscript-preview-container">
              <div className="manuscript-sheet">
                {interiorFile ? (
                  <>
                    <canvas
                      ref={canvasRef}
                      className="manuscript-canvas"
                      style={{ display: isPageRendering || isDocLoading ? 'none' : 'block' }}
                    />
                    {(isPageRendering || isDocLoading) && (
                      <div className="manuscript-loading">
                        <Clock size={24} style={{ opacity: 0.6, marginBottom: 8 }} />
                        <span>Rendering page {currentManuscriptPage}...</span>
                        <small>Loading PDF.js document vector stream</small>
                      </div>
                    )}
                    {(pageRenderError || docError) && (
                      <div className="manuscript-error">
                        <CircleHelp size={24} style={{ color: 'var(--rust)', marginBottom: 8 }} />
                        <b>Unable to render page {currentManuscriptPage}</b>
                        <small>{pageRenderError || docError}</small>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="cover-placeholder">
                    <FileText size={32} style={{ opacity: 0.45, marginBottom: 8 }} />
                    <span>Interior manuscript not uploaded</span>
                    <small>Upload an interior PDF to preview pages.</small>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Page Jump Chips (when in Manuscript Preview with multiple pages) */}
          {activePreview === 'manuscript' && interiorFile && totalPages > 1 && (
            <div className="manuscript-quick-nav">
              {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  className={`quick-page-chip ${currentManuscriptPage === pageNum ? 'active' : ''}`}
                  onClick={() => onManuscriptPageChange(pageNum)}
                  aria-label={`Jump to page ${pageNum}`}
                >
                  p.{pageNum}
                </button>
              ))}
              {totalPages > 10 && currentManuscriptPage > 10 && (
                <span className="quick-page-chip active">
                  p.{currentManuscriptPage}
                </span>
              )}
              {totalPages > 10 && (
                <span style={{ fontSize: 9, color: 'var(--muted)', padding: '0 4px', font: 'var(--font-mono)' }}>
                  (1–{totalPages})
                </span>
              )}
            </div>
          )}

          {/* Bottom Viewer Controls */}
          <div className="viewer-controls">
            <button
              onClick={() => {
                if (activePreview !== 'manuscript') setActivePreview('manuscript')
                handlePrevPage()
              }}
              disabled={currentManuscriptPage <= 1 || !interiorFile}
              aria-label="Previous page"
              id="btn-prev-manuscript-page"
            >
              <ChevronLeft size={14} />
            </button>
            <span
              onClick={() => setActivePreview('manuscript')}
              style={{ cursor: 'pointer' }}
              title="Click to view manuscript preview"
            >
              Page {interiorFile ? currentManuscriptPage : 0} <i>of</i> {interiorFile ? totalPages : 0}
            </span>
            <button
              onClick={() => {
                if (activePreview !== 'manuscript') setActivePreview('manuscript')
                handleNextPage()
              }}
              disabled={currentManuscriptPage >= totalPages || !interiorFile}
              aria-label="Next page"
              id="btn-next-manuscript-page"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <aside className="proof-side">
          <div className="proof-order">
            <p className="eyebrow" style={{ margin: 0 }}>ACTIVE SERVER QUOTE</p>
            <h3 style={{ fontSize: 24, margin: '6px 0 2px' }}>{product?.name || 'Custom Print'}</h3>
            <p style={{ color: 'var(--muted)', fontSize: 12 }}>
              {Object.entries(options)
                .map(([k, v]) => `${k}: ${v}`)
                .join(' · ')}
            </p>
            <dl>
              <dt>Total copies</dt>
              <dd>{quantity}</dd>
              <dt>Interior file</dt>
              <dd style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {interiorFile?.name || 'Preflight PDF'}
              </dd>
              <dt>Cover artwork</dt>
              <dd style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {coverFile ? coverFile.name : 'No cover artwork uploaded'}
              </dd>
              <dt>Cover layout</dt>
              <dd style={{ font: 'var(--font-mono)', fontSize: 11 }}>
                {coverFile
                  ? effectiveLayout === 'full-wrap'
                    ? 'Full-wrap spread'
                    : effectiveLayout === 'front-only'
                    ? 'Front cover only (unprinted back)'
                    : 'Cover artwork'
                  : 'Awaiting upload'}
              </dd>
              <dt>Estimated spine</dt>
              <dd style={{ font: 'var(--font-mono)', fontSize: 11 }}>
                ~{spreadCalc.spineWidthMm} mm ({interiorPageCount} pp)
              </dd>
              <dt>Backend Quote ID</dt>
              <dd style={{ font: 'var(--font-mono)', fontSize: 10 }}>{quote?.id.slice(0, 16)}...</dd>
              <dt>Server Total</dt>
              <dd>{quote ? money(quote.total, true) : '₹0'}</dd>
            </dl>
            <div className="proof-total">
              <span>Final Total</span>
              <b>{quote ? money(quote.total, true) : '₹0'}</b>
            </div>
          </div>

          <label className="confirm-check">
            <input
              type="checkbox"
              checked={proofApproved}
              onChange={(e) => onSetProofApproved(e.target.checked)}
            />
            <span>
              I have inspected the specifications, bleeds, margins, and server quote breakdown.
            </span>
          </label>

          <div className="proof-actions">
            <button
              className="btn btn-primary"
              style={{ padding: '14px 20px', fontSize: 11 }}
              disabled={!proofApproved || !quote}
              onClick={() => {
                onSetProofApproved(true)
                onNavigate('checkout')
              }}
            >
              Approve proof &amp; proceed to checkout <ArrowRight size={14} />
            </button>
            <button className="btn btn-outline" onClick={() => onNavigate('upload')}>
              Replace file
            </button>
          </div>

          <div style={{ display: 'flex', gap: 10, color: 'var(--muted)', fontSize: 11, borderTop: '1px solid var(--line)', paddingTop: 16 }}>
            <CircleHelp size={16} style={{ flexShrink: 0 }} />
            <span>
              <b>Server Quote Verification:</b>
              <br />
              This quote was verified against pricing matrix version {quote?.pricingConfigVersion}.
            </span>
          </div>
        </aside>
      </main>

      <Footer onNavigate={onNavigate} />
    </>
  )
}

/* ==========================================================================
   Checkout View (Demo Zero-Dollar Order Creation)
   ========================================================================== */

function Checkout({
  quote,
  product,
  quantity,
  interiorFile,
  coverFile,
  currentUser,
  onNavigate,
  onOrderSuccess,
}: {
  quote: QuoteResponse | null
  product: Product | null
  quantity: number
  interiorFile: File | null
  coverFile: File | null
  currentUser: string | null
  onNavigate: (page: string) => void
  onOrderSuccess: (orderId: string, checkoutData: DemoCheckoutResponse) => void
}) {
  const [paymentMethod, setPaymentMethod] = useState<'demo_upi' | 'demo_card' | 'demo_netbanking'>('demo_upi')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePlaceOrder = async () => {
    if (!quote) return
    setIsSubmitting(true)
    setError(null)

    try {
      const draftOrder = await createDraftOrder({
        quoteId: quote.id,
        token: currentUser || 'demo-token',
      })

      const checkout = await processDemoCheckout({
        orderId: draftOrder.id,
        paymentMethod,
      })

      onOrderSuccess(draftOrder.id, checkout)
      onNavigate('confirmation')
    } catch (err: any) {
      setError(err.message || 'Failed to place draft order.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="page-intro compact">
        <div className="breadcrumbs">
          <button onClick={() => onNavigate('home')}>Home</button>
          <ChevronRight size={13} />
          <button onClick={() => onNavigate('proof')}>Proof</button>
          <ChevronRight size={13} />
          <span>Demo Checkout</span>
        </div>
        <FlowStepper activeStep={4} onNavigate={onNavigate} />
        <h1 style={{ marginTop: 24 }}>Confirm sample order</h1>
        <p>No real charges will occur. Demonstrates idempotent order creation &amp; payment stub.</p>
      </div>

      <main className="section" style={{ maxWidth: 820 }}>
        <div className="checkout-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 26, margin: 0 }}>{product?.name || 'Print Order'}</h2>
              <small style={{ color: 'var(--muted)', font: 'var(--font-mono)', fontSize: 10 }}>
                Quote ID: {quote?.id}
              </small>
            </div>
            <span className="audit-badge">₹0 Demo Checkout</span>
          </div>

          <div style={{ borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', padding: '16px 0', margin: '20px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
              <span>Quantity:</span>
              <b>{quantity} copies</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
              <span>Interior Document:</span>
              <b style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {interiorFile?.name || 'Preflight PDF'}
              </b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
              <span>Cover Artwork:</span>
              <b style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {coverFile ? coverFile.name : 'No cover artwork uploaded'}
              </b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
              <span>Server-Calculated Quote Total:</span>
              <b>{quote ? money(quote.total, true) : '₹0'}</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--navy)' }}>
              <b>Amount Charged in Demo:</b>
              <b>₹0 (Simulated Demo)</b>
            </div>
          </div>

          <p style={{ font: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', margin: '20px 0 10px' }}>
            SELECT DEMO PAYMENT METHOD
          </p>
          <div className="payment-methods-grid">
            <div
              className={`payment-option-card ${paymentMethod === 'demo_upi' ? 'selected' : ''}`}
              onClick={() => setPaymentMethod('demo_upi')}
              role="button"
              tabIndex={0}
            >
              <QrCode size={20} color="var(--navy)" />
              <b>Instant UPI</b>
              <small>Simulated QR / VPA</small>
            </div>
            <div
              className={`payment-option-card ${paymentMethod === 'demo_card' ? 'selected' : ''}`}
              onClick={() => setPaymentMethod('demo_card')}
              role="button"
              tabIndex={0}
            >
              <CreditCard size={20} color="var(--navy)" />
              <b>Credit / Debit</b>
              <small>Mock payment gate</small>
            </div>
            <div
              className={`payment-option-card ${paymentMethod === 'demo_netbanking' ? 'selected' : ''}`}
              onClick={() => setPaymentMethod('demo_netbanking')}
              role="button"
              tabIndex={0}
            >
              <Building size={20} color="var(--navy)" />
              <b>Net Banking</b>
              <small>Simulated Indian banks</small>
            </div>
          </div>

          {error && (
            <div
              style={{
                backgroundColor: 'var(--warning-bg)',
                border: '1px solid var(--warning-border)',
                color: 'var(--rust)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                marginBottom: 20,
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}

          <button
            className="btn btn-primary"
            style={{ width: '100%', padding: '16px 20px', fontSize: 12 }}
            disabled={isSubmitting || !quote}
            onClick={handlePlaceOrder}
          >
            {isSubmitting ? (
              <>Processing Order in Backend...</>
            ) : (
              <>Place Demo Order (Create Draft &amp; Complete Checkout) <ArrowRight size={15} /></>
            )}
          </button>
        </div>
      </main>

      <Footer onNavigate={onNavigate} />
    </>
  )
}

/* ==========================================================================
   Order Confirmation View
   ========================================================================== */

function OrderConfirmation({
  orderId,
  checkoutData,
  interiorFile,
  coverFile,
  onNavigate,
  onTrack,
}: {
  orderId: string
  checkoutData: DemoCheckoutResponse | null
  interiorFile: File | null
  coverFile: File | null
  onNavigate: (page: string) => void
  onTrack: (id: string) => void
}) {
  return (
    <main className="section" style={{ minHeight: 'calc(100vh - 120px)', display: 'flex', alignItems: 'center' }}>
      <div className="simple-card">
        <div className="success-icon">
          <Check size={28} />
        </div>
        <p className="eyebrow" style={{ textAlign: 'center' }}>ORDER CREATED IN BACKEND</p>
        <h1 style={{ textAlign: 'center', fontSize: 36 }}>Sample order placed!</h1>
        <p style={{ margin: '14px 0 20px', textAlign: 'center', color: 'var(--muted)' }}>
          Your draft order was created with status <code>DRAFT</code> and demo checkout transaction verified.
        </p>

        <div
          style={{
            backgroundColor: 'var(--paper)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-md)',
            padding: 16,
            textAlign: 'left',
            fontSize: 12,
            fontFamily: 'var(--font-mono)',
            marginBottom: 25,
          }}
        >
          <div>
            <b>Order ID:</b> {orderId}
          </div>
          {interiorFile && (
            <div style={{ marginTop: 6 }}>
              <b>Interior Document:</b> {interiorFile.name}
            </div>
          )}
          <div style={{ marginTop: 6 }}>
            <b>Cover Artwork:</b> {coverFile ? coverFile.name : 'No cover artwork uploaded'}
          </div>
          {checkoutData && (
            <>
              <div style={{ marginTop: 6 }}>
                <b>Transaction:</b> {checkoutData.transactionId}
              </div>
              <div style={{ marginTop: 6 }}>
                <b>Status:</b> {checkoutData.status} (Amount: ₹{checkoutData.amountCharged})
              </div>
              <div style={{ marginTop: 6, color: 'var(--muted)', fontSize: 10 }}>
                {checkoutData.message}
              </div>
            </>
          )}
        </div>

        <div className="tracking-line">
          <span className="done"><Check size={14} /> Quote verified</span>
          <span className="done"><Check size={14} /> Artwork preflight</span>
          <span className="done"><Check size={14} /> Draft order</span>
          <span>In production</span>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            className="btn btn-primary"
            onClick={() => {
              onTrack(orderId)
              onNavigate('tracking')
            }}
          >
            Track this order <ArrowRight size={14} />
          </button>
          <button className="btn btn-outline" onClick={() => onNavigate('home')}>
            Back to home
          </button>
        </div>
      </div>
    </main>
  )
}

/* ==========================================================================
   Order Tracking View
   ========================================================================== */

function Tracking({
  initialOrderId,
  currentUser,
  onNavigate,
}: {
  initialOrderId?: string
  currentUser: string | null
  onNavigate: (page: string) => void
}) {
  const [orderId, setOrderId] = useState(initialOrderId || '')
  const [lookupResult, setLookupResult] = useState<OrderLookupResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLookup = async (idToSearch: string) => {
    if (!idToSearch.trim()) return
    setLoading(true)
    setError(null)
    setLookupResult(null)

    try {
      const data = await getOrder(idToSearch.trim(), currentUser || 'demo-token')
      setLookupResult(data)
    } catch (err: any) {
      setError(err.message || 'Order not found in backend repository.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialOrderId) {
      handleLookup(initialOrderId)
    }
  }, [initialOrderId])

  return (
    <>
      <div className="page-intro compact">
        <div className="breadcrumbs">
          <button onClick={() => onNavigate('home')}>Home</button>
          <ChevronRight size={13} />
          <span>Order Tracking</span>
        </div>
        <p className="eyebrow">AUDITABLE STATUS &amp; LIFECYCLE</p>
        <h1>Track your order</h1>
        <p>Direct query via GET /api/orders/:id with authenticated customer session.</p>
      </div>

      <main className="section" style={{ maxWidth: 840 }}>
        <div className="checkout-card" style={{ maxWidth: '100%' }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <input
              placeholder="Enter Order UUID (e.g., 550e8400-e29b-41d4-a716-446655440000)"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              style={{
                flex: 1,
                padding: '12px 14px',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                backgroundColor: 'var(--surface)',
              }}
            />
            <button
              className="btn btn-primary"
              onClick={() => handleLookup(orderId)}
              disabled={loading || !orderId.trim()}
            >
              {loading ? 'Searching...' : 'Track'}
            </button>
          </div>

          {error && (
            <div
              style={{
                backgroundColor: 'var(--warning-bg)',
                border: '1px solid var(--warning-border)',
                color: 'var(--rust)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}

          {lookupResult && (
            <div style={{ marginTop: 25 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span className="eyebrow" style={{ margin: 0 }}>ORDER RECORD</span>
                  <h3 style={{ margin: '6px 0 0', fontSize: 24 }}>
                    Status: <span style={{ color: 'var(--navy)' }}>{lookupResult.order.status}</span>
                  </h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 11, color: 'var(--muted)', display: 'block' }}>Total Amount</span>
                  <b style={{ fontSize: 22, fontFamily: 'var(--font-serif)' }}>{money(lookupResult.order.total, true)}</b>
                </div>
              </div>

              <div style={{ margin: '20px 0', padding: 14, backgroundColor: 'var(--paper)', borderRadius: 'var(--radius-md)', font: 'var(--font-mono)', fontSize: 11, border: '1px solid var(--line)' }}>
                <div><b>Customer ID:</b> {lookupResult.order.customerId}</div>
                <div style={{ marginTop: 4 }}><b>Created At:</b> {new Date(lookupResult.order.createdAt).toLocaleString()}</div>
                <div style={{ marginTop: 4 }}><b>Idempotency Key:</b> {lookupResult.order.idempotencyKey}</div>
                <div style={{ marginTop: 4 }}><b>Quote Binding:</b> {lookupResult.order.quoteId}</div>
              </div>

              <h4 style={{ margin: '25px 0 10px', fontSize: 16 }}>Audit Status Transitions History</h4>
              <div className="timeline-list">
                {lookupResult.history.map((h) => (
                  <div className="timeline-item active" key={h.id}>
                    <b>Status: {h.toStatus}</b>
                    <p>{h.reason}</p>
                    <time>{new Date(h.createdAt).toLocaleTimeString()} ({new Date(h.createdAt).toLocaleDateString()})</time>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer onNavigate={onNavigate} />
    </>
  )
}

/* ==========================================================================
   Bulk Quotes View (Dedicated Form & Capabilities)
   ========================================================================== */

function BulkQuotesPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    company: '',
    name: '',
    email: '',
    phone: '',
    product: 'books',
    quantity: '2500',
    finishing: 'hardcover',
    pin: '',
    notes: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <>
      <div className="page-intro">
        <div className="breadcrumbs">
          <button onClick={() => onNavigate('home')}>Home</button>
          <ChevronRight size={13} />
          <span>Bulk Quotes</span>
        </div>
        <p className="eyebrow">COMMERCIAL &amp; HIGH-VOLUME PRINTING</p>
        <h1>Bespoke quotes for large print runs.</h1>
        <p>Procuring 500 to 50,000+ copies? Dedicated account management, physical proofs, and custom logistics across India.</p>
      </div>

      <main className="section" style={{ maxWidth: 960 }}>
        {submitted ? (
          <div className="simple-card" style={{ maxWidth: 600 }}>
            <div className="success-icon">
              <Check size={28} />
            </div>
            <p className="eyebrow" style={{ textAlign: 'center' }}>REQUEST RECEIVED</p>
            <h2 style={{ textAlign: 'center', fontSize: 32 }}>Your bulk quote is being prepared</h2>
            <p style={{ textAlign: 'center', color: 'var(--muted)', margin: '14px 0 24px' }}>
              Reference <b>BQ-{Math.floor(100000 + Math.random() * 900000)}</b> registered. A dedicated print production manager will review your specifications and contact <b>{formData.email}</b> within 4 business hours.
            </p>
            <button className="btn btn-primary" onClick={() => setSubmitted(false)}>
              Submit another request
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 'var(--space-12)' }}>
            <form onSubmit={handleSubmit} className="checkout-card" style={{ maxWidth: '100%', margin: 0 }}>
              <p className="eyebrow" style={{ margin: '0 0 16px' }}>ESTIMATE REQUEST FORM</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', font: 'var(--font-mono)', fontSize: 10, marginBottom: 6 }}>
                    ORGANIZATION / COMPANY NAME
                  </label>
                  <input
                    required
                    placeholder="e.g. Oxford University Press India"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--surface)' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', font: 'var(--font-mono)', fontSize: 10, marginBottom: 6 }}>
                      CONTACT PERSON
                    </label>
                    <input
                      required
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--surface)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', font: 'var(--font-mono)', fontSize: 10, marginBottom: 6 }}>
                      PHONE NUMBER
                    </label>
                    <input
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--surface)' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', font: 'var(--font-mono)', fontSize: 10, marginBottom: 6 }}>
                    WORK EMAIL
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="procurement@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--surface)' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', font: 'var(--font-mono)', fontSize: 10, marginBottom: 6 }}>
                      PRODUCT TYPE
                    </label>
                    <select
                      value={formData.product}
                      onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--surface)' }}
                    >
                      <option value="books">Books &amp; Monographs</option>
                      <option value="documents">Reports &amp; Manuals</option>
                      <option value="cards">Corporate Cards</option>
                      <option value="marketing">Flyers &amp; Catalogues</option>
                      <option value="packaging">Custom Packaging</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', font: 'var(--font-mono)', fontSize: 10, marginBottom: 6 }}>
                      TARGET QUANTITY
                    </label>
                    <input
                      required
                      placeholder="e.g. 5,000"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--surface)' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', font: 'var(--font-mono)', fontSize: 10, marginBottom: 6 }}>
                    CUSTOM SPECIFICATIONS &amp; DELIVERY DEADLINE
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Mention custom page counts, spot UV, foil stamping, FSC certified paper requirements, or specific delivery dates..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--surface)' }}
                  />
                </div>

                <button className="btn btn-primary" type="submit" style={{ padding: '14px 20px', marginTop: 10 }}>
                  <Send size={14} /> Submit Commercial Quote Request
                </button>
              </div>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ padding: 24, backgroundColor: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)' }}>
                <b style={{ font: 'var(--font-serif)', fontSize: 18, display: 'block', marginBottom: 12 }}>
                  Commercial Volume Benefits
                </b>
                <ul style={{ paddingLeft: 18, color: 'var(--muted)', fontSize: 13, lineHeight: 1.8, margin: 0 }}>
                  <li>Custom quantity breaks beyond 10,000 units</li>
                  <li>Complimentary physical press proof</li>
                  <li>Split shipping to multiple offices across India</li>
                  <li>GST e-invoicing &amp; 30-day corporate credit terms</li>
                  <li>FSC certified &amp; archival paper sourcing</li>
                </ul>
              </div>

              <div style={{ padding: 24, backgroundColor: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)' }}>
                <b style={{ font: 'var(--font-serif)', fontSize: 18, display: 'block', marginBottom: 8 }}>
                  Urgent Tender Assistance
                </b>
                <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.6 }}>
                  Direct procurement desk:<br />
                  <b>enterprise@pressandproof.in</b><br />
                  Mon–Fri · 9:00 AM – 7:00 PM IST
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer onNavigate={onNavigate} />
    </>
  )
}

/* ==========================================================================
   Help Centre & Architecture View
   ========================================================================== */

function HelpPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [activeTab, setActiveTab] = useState<'prep' | 'paper' | 'shipping' | 'api'>('prep')

  return (
    <>
      <div className="page-intro">
        <div className="breadcrumbs">
          <button onClick={() => onNavigate('home')}>Home</button>
          <ChevronRight size={13} />
          <span>Help &amp; Specifications</span>
        </div>
        <p className="eyebrow">PRE-PRESS DOCUMENTATION</p>
        <h1>Help Centre &amp; Print Guidelines</h1>
        <p>Artwork preparation specs, paper GSM metrics, binding styles, and technical architecture.</p>
      </div>

      <main className="section" style={{ maxWidth: 960 }}>
        <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--line)', paddingBottom: 12, marginBottom: 30, flexWrap: 'wrap' }}>
          {[
            { id: 'prep', label: 'File Preparation Guide', icon: FileText },
            { id: 'paper', label: 'Paper & Binding Specs', icon: Layers },
            { id: 'shipping', label: 'Shipping & Delivery', icon: Truck },
            { id: 'api', label: 'API Architecture & Tests', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setActiveTab(tab.id as any)}
                style={{ padding: '8px 14px', fontSize: 11 }}
              >
                <Icon size={14} /> {tab.label}
              </button>
            )
          })}
        </div>

        {activeTab === 'prep' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ padding: 28, backgroundColor: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)' }}>
              <h2 style={{ fontSize: 24, marginBottom: 12 }}>Pre-Press File Preparation Checklist</h2>
              <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 20 }}>
                Follow these parameters to guarantee crisp printing, accurate colors, and zero clipping during trimming.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                <div style={{ padding: 16, backgroundColor: 'var(--paper)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
                  <b>1. Bleed Margins (3mm)</b>
                  <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 4 }}>
                    Extend all background graphics and imagery 3mm beyond the final trim line to prevent white gaps during trimming.
                  </p>
                </div>
                <div style={{ padding: 16, backgroundColor: 'var(--paper)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
                  <b>2. CMYK Color Profile</b>
                  <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 4 }}>
                    Convert all RGB assets to CMYK (FOGRA39 or Coated GRACoL) before exporting to avoid unexpected shifts in saturation.
                  </p>
                </div>
                <div style={{ padding: 16, backgroundColor: 'var(--paper)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
                  <b>3. Image Resolution (300 DPI)</b>
                  <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 4 }}>
                    All continuous-tone photographic images should have an effective resolution of at least 300 DPI at 100% scale.
                  </p>
                </div>
                <div style={{ padding: 16, backgroundColor: 'var(--paper)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
                  <b>4. Font Embedding &amp; Outlining</b>
                  <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 4 }}>
                    Embed all font subsets in the exported PDF or convert rare typography to vector curves/outlines.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'paper' && (
          <div style={{ padding: 28, backgroundColor: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)' }}>
            <h2 style={{ fontSize: 24, marginBottom: 16 }}>Paper Weights &amp; Binding Guide</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <b>80 GSM Natural White (Book Text)</b>
                <p style={{ color: 'var(--muted)', fontSize: 13 }}>Uncoated warm book paper ideal for long-form reading, novels, and non-fiction.</p>
              </div>
              <div>
                <b>130 GSM Art Matte (Catalogues &amp; Photo Albums)</b>
                <p style={{ color: 'var(--muted)', fontSize: 13 }}>Smooth coated paper with zero glare, delivering vivid color reproduction.</p>
              </div>
              <div>
                <b>350 GSM Velvet Premium Card (Visiting Cards)</b>
                <p style={{ color: 'var(--muted)', fontSize: 13 }}>Rigid cardstock ideal for thermal matte lamination, spot UV, and tactile finishes.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'shipping' && (
          <div style={{ padding: 28, backgroundColor: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)' }}>
            <h2 style={{ fontSize: 24, marginBottom: 16 }}>Turnaround &amp; Pan-India Delivery</h2>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 20 }}>
              Orders are dispatched from our automated hubs in Mumbai, Bengaluru, and New Delhi.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <div style={{ padding: 16, backgroundColor: 'var(--paper)', borderRadius: 'var(--radius-md)' }}>
                <b>Metro Cities</b>
                <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 4 }}>1–2 business days via express air courier.</p>
              </div>
              <div style={{ padding: 16, backgroundColor: 'var(--paper)', borderRadius: 'var(--radius-md)' }}>
                <b>Tier 2 &amp; 3 Hubs</b>
                <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 4 }}>2–4 business days with end-to-end tracking.</p>
              </div>
              <div style={{ padding: 16, backgroundColor: 'var(--paper)', borderRadius: 'var(--radius-md)' }}>
                <b>Bulk Freight</b>
                <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 4 }}>Scheduled pallet delivery with lift-gate assistance.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'api' && (
          <div style={{ padding: 28, backgroundColor: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)' }}>
            <h2 style={{ fontSize: 24, marginBottom: 12 }}>Architecture &amp; Quality Gates</h2>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 16 }}>
              The backend prototype strictly separates computation from display to ensure enterprise auditability.
            </p>
            <ul style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.8, paddingLeft: 18 }}>
              <li><b>Zero Client-Side Math:</b> All money amounts are calculated strictly in integer minor units (paise).</li>
              <li><b>Single-Pass Rounding:</b> Exactly one <code>Math.round</code> applied once per line item calculation.</li>
              <li><b>54 Passing Tests:</b> 100% test coverage across pricing engine, state machine, idempotency, and upload stubs.</li>
              <li><b>Cryptographic Expiry:</b> Quotes expire deterministically after 30 minutes, preventing stale price locks.</li>
            </ul>
          </div>
        )}
      </main>

      <Footer onNavigate={onNavigate} />
    </>
  )
}

/* ==========================================================================
   Main Application Shell
   ========================================================================== */

export default function Page() {
  const [page, setPage] = useState<'home' | 'catalogue' | 'configurator' | 'upload' | 'proof' | 'checkout' | 'confirmation' | 'tracking' | 'bulk' | 'help'>('home')
  const [backendHealth, setBackendHealth] = useState<{ connected: boolean; version?: string }>({ connected: false })
  const [products, setProducts] = useState<Product[]>(fallbackProducts)
  const [selectedProductId, setSelectedProductId] = useState<string>('books')

  // Workflow state
  const [activeQuote, setActiveQuote] = useState<QuoteResponse | null>(null)
  const [activeOptions, setActiveOptions] = useState<Record<string, string>>({})
  const [activeQuantity, setActiveQuantity] = useState<number>(10)

  // Independent Interior File State
  const [interiorFile, setInteriorFile] = useState<File | null>(null)
  const [interiorUpload, setInteriorUpload] = useState<UploadMetadataResponse | null>(null)
  const [interiorPageCount, setInteriorPageCount] = useState<number>(12)
  const [interiorCurrentPage, setInteriorCurrentPage] = useState<number>(1)

  // Independent Cover Artwork State
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverUpload, setCoverUpload] = useState<UploadMetadataResponse | null>(null)
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null)
  const [isCoverObjectUrl, setIsCoverObjectUrl] = useState<boolean>(false)
  const [coverMetadata, setCoverMetadata] = useState<{
    width?: number
    height?: number
    aspectRatio?: number
    detectedLayout?: ArtworkLayoutType
    numPages?: number
  } | null>(null)

  // Proof Approval State
  const [proofApproved, setProofApproved] = useState<boolean>(false)

  const [lastOrderId, setLastOrderId] = useState<string>('')
  const [lastCheckout, setLastCheckout] = useState<DemoCheckoutResponse | null>(null)

  // Handlers maintaining separate file states
  const handleInteriorChange = (file: File, uploadData: UploadMetadataResponse | null, pageCount?: number) => {
    setInteriorFile(file)
    setInteriorUpload(uploadData)
    if (pageCount && pageCount > 0) {
      setInteriorPageCount(pageCount)
    }
    // Changing interior file resets proof approval
    setProofApproved(false)
  }

  const handleInteriorRemove = () => {
    setInteriorFile(null)
    setInteriorUpload(null)
    setInteriorCurrentPage(1)
    setInteriorPageCount(12)
    // Changing interior file resets proof approval
    setProofApproved(false)
  }

  const handleCoverChange = (
    file: File,
    previewUrl: string,
    isObjUrl: boolean,
    uploadData: UploadMetadataResponse | null,
    metadata?: {
      width?: number
      height?: number
      aspectRatio?: number
      detectedLayout?: ArtworkLayoutType
      numPages?: number
    }
  ) => {
    // Revoke previous object URL if any to prevent memory leaks
    if (isCoverObjectUrl && coverPreviewUrl) {
      try {
        URL.revokeObjectURL(coverPreviewUrl)
      } catch (err) {
        console.warn('Revoke object URL warning:', err)
      }
    }
    setCoverFile(file)
    setCoverPreviewUrl(previewUrl)
    setIsCoverObjectUrl(isObjUrl)
    setCoverUpload(uploadData)
    setCoverMetadata(metadata || null)
    // Changing cover resets proof approval
    setProofApproved(false)
  }

  const handleCoverRemove = () => {
    if (isCoverObjectUrl && coverPreviewUrl) {
      try {
        URL.revokeObjectURL(coverPreviewUrl)
      } catch (err) {
        console.warn('Revoke object URL warning:', err)
      }
    }
    setCoverFile(null)
    setCoverPreviewUrl(null)
    setIsCoverObjectUrl(false)
    setCoverUpload(null)
    setCoverMetadata(null)
    // Reset proof approval
    setProofApproved(false)
  }

  // Revoke object URL on unmount
  useEffect(() => {
    return () => {
      if (isCoverObjectUrl && coverPreviewUrl) {
        try {
          URL.revokeObjectURL(coverPreviewUrl)
        } catch (e) {}
      }
    }
  }, [isCoverObjectUrl, coverPreviewUrl])

  // Auth & Modal States
  const [currentUser, setCurrentUser] = useState<string | null>('demo-token')
  const [isSignInOpen, setIsSignInOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Probe backend on mount & load products
  useEffect(() => {
    checkBackendHealth()
      .then((h) => {
        setBackendHealth({ connected: true, version: h.pricingConfigVersion })
      })
      .catch((err) => {
        console.warn('Backend probe:', err)
        setBackendHealth({ connected: false })
      })

    fetchProducts()
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setProducts(res.data)
        }
      })
      .catch((err) => {
        console.warn('Using fallback initial products:', err)
      })
  }, [])

  const navigate = (next: any) => {
    setPage(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="app-shell">
      <Notice backendHealth={backendHealth} />
      <Header
        currentPage={page}
        onNavigate={navigate}
        backendHealth={backendHealth}
        currentUser={currentUser}
        onOpenSignIn={() => setIsSignInOpen(true)}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      {page === 'home' && (
        <Home
          products={products}
          onNavigate={navigate}
          onSelectProduct={(id) => setSelectedProductId(id)}
        />
      )}

      {page === 'catalogue' && (
        <Catalogue
          products={products}
          onNavigate={navigate}
          onSelectProduct={(id) => setSelectedProductId(id)}
        />
      )}

      {page === 'configurator' && (
        <Configurator
          products={products}
          selectedProductId={selectedProductId}
          onSelectProduct={(id) => setSelectedProductId(id)}
          onQuoteReady={(q, p, opts, qty) => {
            setActiveQuote(q)
            setActiveOptions(opts)
            setActiveQuantity(qty)
          }}
          onNavigate={navigate}
        />
      )}

      {page === 'upload' && (
        <Upload
          quote={activeQuote}
          product={products.find((p) => p.id === selectedProductId) || null}
          interiorFile={interiorFile}
          interiorUpload={interiorUpload}
          onInteriorChange={handleInteriorChange}
          onInteriorRemove={handleInteriorRemove}
          coverFile={coverFile}
          coverPreviewUrl={coverPreviewUrl}
          coverUpload={coverUpload}
          onCoverChange={handleCoverChange}
          onCoverRemove={handleCoverRemove}
          onNavigate={navigate}
        />
      )}

      {page === 'proof' && (
        <Proof
          quote={activeQuote}
          product={products.find((p) => p.id === selectedProductId) || null}
          options={activeOptions}
          quantity={activeQuantity}
          interiorFile={interiorFile}
          coverFile={coverFile}
          coverPreviewUrl={coverPreviewUrl}
          coverMetadata={coverMetadata}
          interiorPageCount={interiorPageCount}
          currentManuscriptPage={interiorCurrentPage}
          onManuscriptPageChange={setInteriorCurrentPage}
          onManuscriptPageCountSync={(count) => setInteriorPageCount(count)}
          proofApproved={proofApproved}
          onSetProofApproved={setProofApproved}
          onNavigate={navigate}
        />
      )}

      {page === 'checkout' && (
        <Checkout
          quote={activeQuote}
          product={products.find((p) => p.id === selectedProductId) || null}
          quantity={activeQuantity}
          interiorFile={interiorFile}
          coverFile={coverFile}
          currentUser={currentUser}
          onNavigate={navigate}
          onOrderSuccess={(orderId, checkout) => {
            setLastOrderId(orderId)
            setLastCheckout(checkout)
          }}
        />
      )}

      {page === 'confirmation' && (
        <OrderConfirmation
          orderId={lastOrderId}
          checkoutData={lastCheckout}
          interiorFile={interiorFile}
          coverFile={coverFile}
          onNavigate={navigate}
          onTrack={(id) => {
            setLastOrderId(id)
            navigate('tracking')
          }}
        />
      )}

      {page === 'tracking' && (
        <Tracking
          initialOrderId={lastOrderId}
          currentUser={currentUser}
          onNavigate={navigate}
        />
      )}

      {page === 'bulk' && <BulkQuotesPage onNavigate={navigate} />}
      {page === 'help' && <HelpPage onNavigate={navigate} />}

      {/* Global Modals */}
      <SignInModal
        isOpen={isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
        currentUser={currentUser}
        onSelectUser={setCurrentUser}
      />

      <MobileNavDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onNavigate={navigate}
        backendHealth={backendHealth}
      />
    </div>
  )
}
