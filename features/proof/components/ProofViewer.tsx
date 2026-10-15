'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock,
  FileText,
  Minus,
  Plus,
} from 'lucide-react';
import { CoverSpreadCalculation, ArtworkLayoutType } from '../../../lib/coverSpread';
import { CoverMetadata } from '../../../types';

interface ProofViewerProps {
  options: Record<string, string>;
  interiorFile: File | null;
  coverFile: File | null;
  coverPreviewUrl: string | null;
  coverMetadata?: CoverMetadata | null;
  interiorPageCount: number;
  currentManuscriptPage: number;
  onManuscriptPageChange: (page: number) => void;
  onManuscriptPageCountSync?: (count: number) => void;
  effectiveLayout: ArtworkLayoutType;
  userLayoutConfirmed: ArtworkLayoutType | null;
  setUserLayoutConfirmed: (layout: ArtworkLayoutType | null) => void;
  onCoverImageLoad: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  spreadCalc: CoverSpreadCalculation;
}

export function ProofViewer({
  options,
  interiorFile,
  coverFile,
  coverPreviewUrl,
  coverMetadata,
  interiorPageCount,
  currentManuscriptPage,
  onManuscriptPageChange,
  onManuscriptPageCountSync,
  effectiveLayout,
  userLayoutConfirmed,
  setUserLayoutConfirmed,
  onCoverImageLoad,
  spreadCalc,
}: ProofViewerProps) {
  const [activePreview, setActivePreview] = useState<'cover' | 'manuscript'>('cover');
  const [coverDisplayMode, setCoverDisplayMode] = useState<'full-wrap' | 'front-only' | 'mockup'>(
    'full-wrap'
  );
  const [showGuides, setShowGuides] = useState<boolean>(true);
  const [coverZoom, setCoverZoom] = useState<number>(1.0);

  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [isDocLoading, setIsDocLoading] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);
  const [isPageRendering, setIsPageRendering] = useState(false);
  const [pageRenderError, setPageRenderError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeRenderTaskRef = useRef<any>(null);
  const renderSeqRef = useRef<number>(0);
  const pdfDocRef = useRef<any>(null);

  // Load interior PDF document
  useEffect(() => {
    let isCancelled = false;

    if (!interiorFile) {
      if (pdfDocRef.current) {
        try {
          (pdfDocRef.current as any)?.destroy?.();
        } catch {}
        pdfDocRef.current = null;
      }
      setPdfDoc(null);
      return;
    }

    const loadDoc = async () => {
      setIsDocLoading(true);
      setDocError(null);

      try {
        const arrayBuffer = await interiorFile.arrayBuffer();
        if (isCancelled) return;

        const pdfjs = await import('pdfjs-dist');
        if (!pdfjs.GlobalWorkerOptions.workerSrc) {
          pdfjs.GlobalWorkerOptions.workerSrc =
            typeof window !== 'undefined'
              ? '/pdf.worker.min.mjs'
              : `https://unpkg.com/pdfjs-dist@${pdfjs.version || '6.4.299'}/build/pdf.worker.min.mjs`;
        }

        const loadingTask = pdfjs.getDocument({
          data: new Uint8Array(arrayBuffer),
        });

        const doc = await loadingTask.promise;
        if (isCancelled) {
          try {
            (doc as any)?.destroy?.();
          } catch {}
          return;
        }

        if (pdfDocRef.current && pdfDocRef.current !== doc) {
          try {
            (pdfDocRef.current as any)?.destroy?.();
          } catch {}
        }
        pdfDocRef.current = doc;
        setPdfDoc(doc);

        if (doc.numPages && doc.numPages !== interiorPageCount && onManuscriptPageCountSync) {
          onManuscriptPageCountSync(doc.numPages);
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.error('Failed to load interior PDF:', err);
          setDocError(err.message || 'Failed to load interior PDF document');
          setPdfDoc(null);
        }
      } finally {
        if (!isCancelled) {
          setIsDocLoading(false);
        }
      }
    };

    loadDoc();

    return () => {
      isCancelled = true;
      if (activeRenderTaskRef.current) {
        try {
          activeRenderTaskRef.current.cancel();
        } catch {}
        activeRenderTaskRef.current = null;
      }
    };
  }, [interiorFile]);

  // Render selected manuscript page to canvas
  useEffect(() => {
    if (activePreview !== 'manuscript') {
      return;
    }

    if (!pdfDoc) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    // Cancel any previous in-flight render task
    if (activeRenderTaskRef.current) {
      try {
        activeRenderTaskRef.current.cancel();
      } catch {}
      activeRenderTaskRef.current = null;
    }

    const currentSeq = ++renderSeqRef.current;
    setIsPageRendering(true);
    setPageRenderError(null);

    const renderPage = async () => {
      try {
        const pageNum = Math.max(1, Math.min(currentManuscriptPage, pdfDoc.numPages));
        const page = await pdfDoc.getPage(pageNum);
        if (currentSeq !== renderSeqRef.current) {
          return;
        }

        // Calculate viewport to fit inside standard preview container without distortion
        const unscaledViewport = page.getViewport({ scale: 1.0 });
        const targetWidth = 340;
        const targetHeight = 460;
        const scale = Math.min(
          targetWidth / unscaledViewport.width,
          targetHeight / unscaledViewport.height
        );

        const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
        const viewport = page.getViewport({ scale: scale * dpr });

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        canvas.style.width = `${Math.floor(viewport.width / dpr)}px`;
        canvas.style.height = `${Math.floor(viewport.height / dpr)}px`;

        const renderContext = {
          canvasContext: ctx as any,
          canvas: canvas as any,
          viewport,
        };

        const task = page.render(renderContext as any);
        activeRenderTaskRef.current = task;

        await task.promise;

        if (currentSeq === renderSeqRef.current) {
          setIsPageRendering(false);
          activeRenderTaskRef.current = null;
        }
      } catch (err: any) {
        if (err?.name === 'RenderingCancelledException' || currentSeq !== renderSeqRef.current) {
          return;
        }
        console.error('Error rendering manuscript page:', err);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setPageRenderError(err.message || 'Error rendering manuscript page');
        setIsPageRendering(false);
        activeRenderTaskRef.current = null;
      }
    };

    renderPage();

    return () => {
      if (activeRenderTaskRef.current) {
        try {
          activeRenderTaskRef.current.cancel();
        } catch {}
        activeRenderTaskRef.current = null;
      }
    };
  }, [pdfDoc, currentManuscriptPage, activePreview]);

  const totalPages = pdfDoc?.numPages || interiorPageCount || 1;

  const handlePrevPage = () => {
    if (currentManuscriptPage > 1) {
      onManuscriptPageChange(currentManuscriptPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentManuscriptPage < totalPages) {
      onManuscriptPageChange(currentManuscriptPage + 1);
    }
  };

  return (
    <div className="proof-viewer">
      {/* Top Bar: Audited Label on left, Mode Toggle on right */}
      <div className="mockup-label">
        {activePreview === 'cover' ? (
          coverDisplayMode === 'full-wrap' ? (
            <>
              FULL COVER WRAP SPREAD · {options.binding?.toUpperCase() || 'PAPERBACK'} · SPINE ~
              {spreadCalc.spineWidthMm}MM
            </>
          ) : coverDisplayMode === 'front-only' ? (
            <>FRONT COVER TRIM PREVIEW · {spreadCalc.trimDescription.toUpperCase()}</>
          ) : (
            <>BOOK COVER 3D MOCKUP</>
          )
        ) : (
          <>
            MANUSCRIPT INTERIOR · PAGE {currentManuscriptPage} OF {totalPages}
          </>
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
          {/* Format & Panel Arrangement Warnings / Confirmations */}
          {coverFile && effectiveLayout === 'front-only' && (
            <div className="front-only-warning">
              <CircleHelp size={13} style={{ color: 'var(--rust)', flexShrink: 0 }} />
              <span>Front-cover-only artwork detected. Back cover and spine are unprinted.</span>
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

          {coverFile &&
            (effectiveLayout === 'multi-page' || effectiveLayout === 'unknown') &&
            !userLayoutConfirmed && (
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
                    onClick={() =>
                      setCoverZoom((z) => Math.max(0.8, Number((z - 0.1).toFixed(1))))
                    }
                    disabled={coverZoom <= 0.8}
                    aria-label="Zoom out cover"
                  >
                    <Minus size={11} />
                  </button>
                  <span style={{ minWidth: 28, textAlign: 'center' }}>
                    {Math.round(coverZoom * 100)}%
                  </span>
                  <button
                    type="button"
                    className="cover-zoom-btn"
                    onClick={() =>
                      setCoverZoom((z) => Math.min(1.5, Number((z + 0.1).toFixed(1))))
                    }
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
                {/* Render uploaded full-wrap artwork */}
                {coverPreviewUrl && effectiveLayout !== 'front-only' && (
                  <img
                    src={coverPreviewUrl}
                    onLoad={onCoverImageLoad}
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
                        onLoad={onCoverImageLoad}
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

                {/* Bleed and Trim Guides Overlay */}
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
                  onLoad={onCoverImageLoad}
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
                {spreadCalc.totalSpreadWithBleedWidthMm} × {spreadCalc.totalSpreadWithBleedHeightMm}{' '}
                mm
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

      {/* Quick Page Jump Chips */}
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
            <span className="quick-page-chip active">p.{currentManuscriptPage}</span>
          )}
          {totalPages > 10 && (
            <span
              style={{
                fontSize: 9,
                color: 'var(--muted)',
                padding: '0 4px',
                font: 'var(--font-mono)',
              }}
            >
              (1–{totalPages})
            </span>
          )}
        </div>
      )}

      {/* Bottom Viewer Controls */}
      <div className="viewer-controls">
        <button
          onClick={() => {
            if (activePreview !== 'manuscript') setActivePreview('manuscript');
            handlePrevPage();
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
          Page {interiorFile ? currentManuscriptPage : 0} <i>of</i>{' '}
          {interiorFile ? totalPages : 0}
        </span>
        <button
          onClick={() => {
            if (activePreview !== 'manuscript') setActivePreview('manuscript');
            handleNextPage();
          }}
          disabled={currentManuscriptPage >= totalPages || !interiorFile}
          aria-label="Next page"
          id="btn-next-manuscript-page"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
