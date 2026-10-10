'use client'

import { useMemo, useState } from 'react'
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
} from 'lucide-react'

const products = [
  { group: 'Documents', name: 'Documents', description: 'Reports, assignments, manuals.', price: 49, tag: '3' },
  { group: 'Documents', name: 'Letterheads', description: 'Branded corporate stationery.', price: 199 },
  { group: 'Documents', name: 'Certificates', description: 'Awards, completion, diplomas.', price: 79 },
  { group: 'Books', name: 'Books', description: 'Paperback & hardcover.', price: 299, tag: '3' },
  { group: 'Books', name: 'Notebooks', description: 'Custom covers, ruled or blank.', price: 149 },
  { group: 'Books', name: 'Photo albums', description: 'Premium lay-flat prints.', price: 599 },
  { group: 'Marketing', name: 'Brochures', description: 'Flyers, tri-folds, booklets.', price: 99 },
  { group: 'Marketing', name: 'Posters', description: 'Large format, vivid colour.', price: 129 },
  { group: 'Marketing', name: 'Stickers', description: 'Die-cut, waterproof labels.', price: 199 },
  { group: 'Stationery', name: 'Business cards', description: 'Matte, gloss or textured.', price: 299 },
  { group: 'Stationery', name: 'Calendars', description: 'Wall and desk calendars.', price: 249 },
]

const bookOptions = {
  sizes: ['A5 Portrait', 'A4 Portrait', 'Custom Size'],
  interiors: ['Black & White', 'Full Colour'],
  papers: ['Natural White', 'Bright White', 'Art Matte'],
  bindings: ['Paperback (Perfect)', 'Hardcover (Casebound)', 'Spiral / Wiro', 'Saddle Stitch'],
}

function money(value: number) {
  return `₹${value.toLocaleString('en-IN')}`
}

function Header({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <header className="site-header">
      <button className="wordmark" onClick={() => onNavigate('home')} aria-label="Press and Proof home">
        <span>PRESS</span><b>&amp;</b><span>PROOF</span>
      </button>
      <nav className="desktop-nav" aria-label="Main navigation">
        <button onClick={() => onNavigate('catalogue')}>Products</button>
        <button onClick={() => onNavigate('tracking')}>Track order</button>
        <button onClick={() => onNavigate('bulk')}>Bulk quotes</button>
        <button onClick={() => onNavigate('help')}>Help</button>
        <button>Sign in</button>
      </nav>
      <button className="header-cta" onClick={() => onNavigate('configurator')}>Start printing <ArrowRight size={15} /></button>
      <button className="mobile-menu" aria-label="Open menu"><Menu size={20} /></button>
    </header>
  )
}

function Notice() {
  return <div className="notice">Concept prototype: all prices are illustrative samples and no orders are real.</div>
}

function Footer({ onNavigate }: { onNavigate: (page: string) => void }) {
  return <footer className="footer">
    <div className="footer-top"><div><div className="footer-mark">PRESS &amp; PROOF</div><p>Independent concept redesign.<br />Not affiliated with PrintOnWeb.</p></div><div className="footer-col"><b>Products</b><button onClick={() => onNavigate('catalogue')}>Documents</button><button onClick={() => onNavigate('catalogue')}>Books</button><button onClick={() => onNavigate('catalogue')}>Marketing</button><button>Stationery</button></div><div className="footer-col"><b>Company</b><button>About</button><button>Contact</button><button>Careers</button><button>Blog</button></div><div className="footer-col"><b>Support</b><button>Help centre</button><button>File guidelines</button><button>Shipping</button><button>Returns</button></div></div>
    <div className="footer-bottom"><span>© 2026 Press &amp; Proof. All rights reserved.</span><span>Demo only · Sample estimates</span></div>
  </footer>
}

function ProductVisual({ type = 'book' }: { type?: string }) {
  return <div className={`product-visual visual-${type}`} aria-hidden="true"><div className="paper-shadow" /><div className="paper-sheet"><span>{type === 'book' ? 'MY<br />MASTERPIECE' : type.toUpperCase()}</span></div>{type === 'book' && <div className="book-spine" />}</div>
}

function Home({ onNavigate }: { onNavigate: (page: string) => void }) {
  return <>
    <section className="hero"><div className="hero-copy"><p className="eyebrow">ONLINE PRINTING</p><h1>Print anything,<br /><em>see the price first.</em></h1><p className="hero-sub">Choose your product, set your options and watch a live sample estimate update.</p><div className="hero-actions"><button className="button button-dark" onClick={() => onNavigate('configurator')}>Start a print job <ArrowRight size={16} /></button><button className="button button-quiet" onClick={() => onNavigate('tracking')}>Track an order</button></div><p className="offer"><Sparkles size={14} /> <b>Sample offer:</b> first-order saving shown here as a placeholder. <u>See sample offer</u></p></div><div className="hero-art"><div className="sun" /><ProductVisual /><span className="art-note note-one">A5 / 120 pages</span><span className="art-note note-two">sample proof</span></div></section>
    <section className="audience section"><div className="section-heading"><p className="eyebrow">MADE FOR YOU</p><h2>Whoever you are, we&apos;ve got your print covered.</h2></div><div className="audience-grid"><article><span>01</span><h3>Students</h3><p>Thesis binding, project reports and presentation posters — affordable and fast.</p></article><article><span>02</span><h3>Businesses</h3><p>Letterheads, business cards and branded collateral that look sharp.</p></article><article><span>03</span><h3>Authors &amp; publishers</h3><p>Hardcover and paperback books printed to professional standards.</p></article></div></section>
    <section className="products section"><div className="section-heading row-heading"><div><p className="eyebrow">WHAT WE PRINT</p><h2>Everything you need, one place.</h2></div><button className="text-link" onClick={() => onNavigate('catalogue')}>See all products <ArrowRight size={15} /></button></div><div className="product-grid">{products.slice(0, 6).map((p, i) => <ProductCard key={p.name} product={p} index={i} onClick={() => onNavigate(p.name === 'Books' ? 'configurator' : 'catalogue')} />)}</div></section>
    <section className="steps section"><div className="section-heading"><p className="eyebrow">HOW IT WORKS</p><h2>Five simple steps to your print.</h2></div><div className="steps-grid">{[['01', 'Upload', 'your file', 'Drag & drop any document.'], ['02', 'Choose', 'options', 'Paper, finish, quantity.'], ['03', 'Review', 'your proof', 'Check before we print.'], ['04', 'We print &', 'bind', 'Professional quality.'], ['05', 'Delivered', 'to you', 'Fast across India.']].map(s => <div className="step" key={s[0]}><span>{s[0]}</span><strong>{s[1]}<br />{s[2]}</strong><p>{s[3]}</p></div>)}</div></section>
    <section className="pricing-banner"><div><p className="eyebrow">LIVE PRICING</p><h2>See your price before you sign in.</h2><p>Change paper, finish and quantity — the sample estimate updates instantly so there are never surprises.</p><button className="button button-light" onClick={() => onNavigate('configurator')}>Open the configurator <ArrowRight size={15} /></button></div><div className="estimate-mini"><span>LIVE SAMPLE ESTIMATE</span><strong>₹1,249</strong><small>500 brochures · A4 · full colour</small><i>Sample price</i></div></section>
    <section className="quotes section"><div className="section-heading"><p className="eyebrow">TRUSTED BY THOUSANDS</p><h2>What our customers say.</h2></div><div className="quote-grid">{['Clean process and the proof step saved me from a typo. Highly recommended.', 'Got my thesis bound in two days. The price was exactly what was quoted.', 'We order all our business cards and brochures here now. Consistent quality.'].map(q => <blockquote key={q}>“{q}”<cite>Sample review</cite></blockquote>)}</div></section>
    <Footer onNavigate={onNavigate} />
  </>
}

function ProductCard({ product, index, onClick }: { product: typeof products[number], index: number, onClick: () => void }) { return <article className="product-card"><div className={`card-image tone-${index % 4}`}><ProductVisual type={index % 2 ? 'paper' : 'book'} /></div><div className="card-meta"><span className="card-group">{product.group}{product.tag && <sup>({product.tag})</sup>}</span><h3>{product.name}</h3><p>{product.description}</p><div className="price-line"><b>From {money(product.price)}</b><small>Sample price</small></div><button onClick={onClick}>Configure &amp; see price <ArrowRight size={14} /></button></div></article> }

function Catalogue({ onNavigate }: { onNavigate: (page: string) => void }) { const [filter, setFilter] = useState('All'); const shown = filter === 'All' ? products : products.filter(p => p.group === filter); return <><div className="page-intro"><div className="breadcrumbs"><button onClick={() => onNavigate('home')}>Home</button><ChevronRight size={13} /><span>Products</span></div><p className="eyebrow">ALL PRINT PRODUCTS</p><h1>High-quality printing<br />for every need.</h1><p>From one copy to thousands.</p></div><main className="catalogue section"><aside className="filters"><b>PRODUCT GROUPS</b>{['All', 'Documents', 'Books', 'Marketing', 'Stationery'].map(x => <button className={filter === x ? 'active' : ''} onClick={() => setFilter(x)} key={x}>{x}<span>{x === 'All' ? '11' : products.filter(p => p.group === x).length}</span></button>)}<b className="filter-label">DELIVERY BY PIN CODE</b><p>Check availability and estimated dates.</p><div className="pin-input"><input placeholder="Enter PIN code" aria-label="Enter PIN code" /><button>CHECK</button></div></aside><div className="catalogue-content"><div className="catalogue-toolbar"><span>{shown.length} products</span><button>Sort by: Recommended <ChevronDown size={14} /></button></div><div className="catalogue-grid">{shown.map((p, i) => <ProductCard key={p.name} product={p} index={i} onClick={() => onNavigate(p.name === 'Books' ? 'configurator' : 'configurator')} />)}</div></div></main><Footer onNavigate={onNavigate} /></> }

function Configurator({ onNavigate }: { onNavigate: (page: string) => void }) { const [size, setSize] = useState('A5 Portrait'); const [interior, setInterior] = useState('Black & White'); const [paper, setPaper] = useState('Natural White'); const [binding, setBinding] = useState('Paperback (Perfect)'); const [quantity, setQuantity] = useState(10); const total = useMemo(() => 60345 + Math.max(0, quantity - 10) * 250, [quantity]); const choices = (label: string, values: string[], value: string, set: (x: string) => void) => <div className="option-block"><label>{label}</label><div className="option-grid">{values.map(x => <button className={value === x ? 'selected' : ''} onClick={() => set(x)} key={x}>{x}{x === 'A5 Portrait' && <small>148 × 210 mm</small>}{x === 'Black & White' && <small>Best for novels and manuals.</small>}{x === 'Natural White' && <small>80 gsm · Uncoated</small>}{x === 'Paperback (Perfect)' && <small>Glued spine with a wrap-around cover.</small>}</button>)}</div></div>; return <><div className="page-intro compact"><div className="breadcrumbs"><button onClick={() => onNavigate('home')}>Home</button><ChevronRight size={13} /><button onClick={() => onNavigate('catalogue')}>Products</button><ChevronRight size={13} /><span>Books</span></div><p className="eyebrow">BOOK PRINTING</p><h1>Professional binding<br />for your masterpiece.</h1></div><main className="configurator section"><div className="config-form"><div className="config-step"><span>1. CHOOSE SIZE</span>{choices('', bookOptions.sizes, size, setSize)}</div><div className="config-step"><span>2. INTERIOR COLOUR</span>{choices('', bookOptions.interiors, interior, setInterior)}</div><div className="config-step"><span>3. PAGE COUNT</span><div className="range-row"><b>120<span> Pages</span></b><input type="range" min="4" max="800" defaultValue="120" /></div><small>4 pages <i>800 pages max</i></small></div><div className="config-step"><span>4. PAPER TYPE</span>{choices('', bookOptions.papers, paper, setPaper)}</div><div className="config-step"><span>5. BINDING STYLE</span>{choices('', bookOptions.bindings, binding, setBinding)}</div><div className="config-step"><span>6. QUANTITY</span><div className="quantity"><button onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={15} /></button><b>{quantity}</b><button onClick={() => setQuantity(quantity + 1)}><Plus size={15} /></button><span>Copies</span></div><small>Automatic discounts for larger orders.</small></div><div className="config-step"><span>7. DELIVERY PIN CODE</span><div className="pin-input large"><input placeholder="Enter PIN code" aria-label="Delivery PIN code" /><button>CHECK</button></div><p className="delivery-note"><Truck size={15} /> Standard Delivery: Oct 18–20<br /><small>Estimated for Mumbai 400001</small></p></div></div><aside className="price-panel"><p className="eyebrow">LIVE SAMPLE ESTIMATE</p><b>{money(Math.round(total / quantity))}<small> per copy</small></b><div className="breakdown"><span>Printing (120 pages)<i>₹60,000</i></span><span>Paper ({paper.split(' ')[0]})<i>₹600</i></span><span>Binding ({binding.split(' ')[0]})<i>₹2,500</i></span><span>Quantity discount<i>-₹3,155</i></span><span>Delivery<i>₹400</i></span></div><div className="grand-total"><span>Grand Total</span><strong>{money(total)}</strong></div><button className="button button-dark full" onClick={() => onNavigate('upload')}>Continue to upload <ArrowRight size={15} /></button><p className="sample-note">Illustrative sample price. Taxes and delivery are shown as samples.</p></aside></main><Footer onNavigate={onNavigate} /></> }

function Upload({ onNavigate }: { onNavigate: (page: string) => void }) { const [file, setFile] = useState(false); return <><div className="page-intro compact"><div className="breadcrumbs"><button onClick={() => onNavigate('home')}>Home</button><ChevronRight size={13} /><span>Upload your files</span></div><p className="eyebrow">STEP 02 / 03</p><h1>Upload your files</h1><p>We&apos;ll check your files before anything goes to print.</p></div><main className="upload-layout section"><div className="upload-main"><div className="dropzone" onClick={() => setFile(true)} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && setFile(true)}><UploadCloud size={28} /><h3>Drop your PDF here or browse</h3><p>Accepted: PDF only, up to 500MB</p><button className="button button-outline">Select file</button></div>{file && <div className="uploaded-file"><div className="file-icon">PDF</div><div><b>my_masterpiece_v2.pdf</b><p>120 pages · 14.5 MB · Uploaded</p></div><Check size={18} /></div>}<div className="cover-upload"><div><p className="eyebrow">FOR HARDCOVER / PAPERBACK</p><h3>Cover artwork <span>(optional)</span></h3><p>Drop cover PDF or JPEG here</p></div><FileUp size={22} /></div><button className="button button-dark" disabled={!file} onClick={() => onNavigate('proof')}>Continue to proof <ArrowRight size={15} /></button></div><aside className="upload-side"><div className="side-title"><FileCheck2 size={18} /><b>PRINT-READINESS CHECKS</b></div>{[['File Format', 'PDF 1.7', 'PASSED'], ['Page Dimensions', '148×210mm', 'PASSED'], ['Image Resolution', '220 DPI', 'WARNING'], ['Font Embedding', 'VERIFIED', 'PASSED']].map(x => <div className="check-row" key={x[0]}><span>{x[0]}<b>{x[1]}</b></span><strong className={x[2] === 'WARNING' ? 'warning' : ''}>{x[2]}</strong></div>)}<p className="warning-copy">220 DPI detected. 300 DPI recommended for crisp images.</p></aside></main><Footer onNavigate={onNavigate} /></> }

function Proof({ onNavigate }: { onNavigate: (page: string) => void }) { return <><div className="page-intro compact"><div className="breadcrumbs"><button onClick={() => onNavigate('home')}>Home</button><ChevronRight size={13} /><button onClick={() => onNavigate('upload')}>Upload</button><ChevronRight size={13} /><span>Review proof</span></div><p className="eyebrow">STEP 03 / 03</p><h1>Visual preview &amp; proof</h1><p>Review every detail before we prepare your print.</p></div><main className="proof-layout section"><div className="proof-viewer"><div className="book-preview"><span>PRESS<br />&amp;<br />PROOF</span><b>My Masterpiece<br /><small>VOLUME II</small></b></div><div className="viewer-controls"><button><ChevronLeft size={15} /></button><span>Page 119 <i>of</i> 120</span><button><ChevronRight size={15} /></button></div><div className="mockup-label">3D MOCKUP SIMULATION</div></div><aside className="proof-side"><div className="proof-order"><p className="eyebrow">YOUR ORDER SAMPLE</p><h3>Book Printing</h3><p>Paperback · A5 · B&amp;W</p><dl><dt>Total copies</dt><dd>10</dd><dt>Pages detected</dt><dd>120</dd><dt>Paper</dt><dd>80gsm Natural</dd><dt>Bulk Discount</dt><dd>-₹450</dd></dl><div className="proof-total"><span>Total</span><b>₹12,450</b></div></div><label className="confirm-check"><input type="checkbox" defaultChecked /> <span>I have reviewed every page of the proof and confirm that the content, layout and formatting are correct.</span></label><div className="proof-actions"><button className="button button-dark" onClick={() => onNavigate('confirmation')}>Approve &amp; continue <ArrowRight size={15} /></button><button className="button button-outline" onClick={() => onNavigate('upload')}>Replace file</button></div><div className="help-box"><CircleHelp size={17} /><span><b>Need help?</b><br />File preparation guide · Message support</span></div></aside></main><Footer onNavigate={onNavigate} /></> }

function SimplePage({ type, onNavigate }: { type: string, onNavigate: (page: string) => void }) { const tracking = type === 'tracking'; return <main className="simple-page"><div className="simple-card"><div className="success-icon">{tracking ? <Truck size={24} /> : <Check size={24} />}</div><p className="eyebrow">{tracking ? 'ORDER TRACKING' : 'DEMO CHECKOUT'}</p><h1>{tracking ? 'Your sample order is on its way.' : 'Ready to place your sample order?'}</h1><p>{tracking ? 'Order PP-2026-0142 · Estimated delivery Oct 18–20' : 'No payment will be taken. This is a simulated checkout for the concept prototype.'}</p><div className="tracking-line"><span className="done"><Check size={14} /> Proof approved</span><span className="done"><Check size={14} /> In production</span><span>Out for delivery</span></div><button className="button button-dark" onClick={() => onNavigate('home')}>Back to home <ArrowRight size={15} /></button></div></main> }

export default function Page() { const [page, setPage] = useState('home'); const navigate = (next: string) => setPage(next); return <div className="app-shell"><Notice /><Header onNavigate={navigate} />{page === 'home' && <Home onNavigate={navigate} />}{page === 'catalogue' && <Catalogue onNavigate={navigate} />}{page === 'configurator' && <Configurator onNavigate={navigate} />}{page === 'upload' && <Upload onNavigate={navigate} />}{page === 'proof' && <Proof onNavigate={navigate} />}{page === 'confirmation' && <SimplePage type="confirmation" onNavigate={navigate} />}{page === 'tracking' && <SimplePage type="tracking" onNavigate={navigate} />}{page === 'bulk' && <SimplePage type="bulk" onNavigate={navigate} />}{page === 'help' && <SimplePage type="help" onNavigate={navigate} />}</div> }
