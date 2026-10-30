'use client';

import React, { useEffect, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { CoverSpreadCalculation, ArtworkLayoutType } from '../../../lib/coverSpread';
import { CoverMetadata } from '../../../types';
import { generateArtworkPreview } from '../../../lib/pdfPreview';

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
  effectiveLayout,
  interiorPageCount = 0,
  currentManuscriptPage = 1,
  onManuscriptPageChange,
  spreadCalc,
}: ProofViewerProps) {
  const [zoom, setZoom] = useState<number>(100);
  const [showTrimGuide, setShowTrimGuide] = useState<boolean>(true);
  const [showBleedGuide, setShowBleedGuide] = useState<boolean>(true);
  const [showSpineGuide, setShowSpineGuide] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'cover' | 'interior'>('cover');
  const [interiorPreviewUrl, setInteriorPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;
    let generatedObjectUrl: string | null = null;

    if (!interiorFile) {
      setInteriorPreviewUrl(null);
      return;
    }

    generateArtworkPreview(interiorFile, currentManuscriptPage)
      .then((preview) => {
        if (!isCurrent) {
          if (preview.isObjectUrl) URL.revokeObjectURL(preview.previewUrl);
          return;
        }
        if (preview.isObjectUrl) generatedObjectUrl = preview.previewUrl;
        setInteriorPreviewUrl(preview.previewUrl || null);
      })
      .catch((error) => {
        console.warn('Manuscript preview unavailable:', error);
        if (isCurrent) setInteriorPreviewUrl(null);
      });

    return () => {
      isCurrent = false;
      if (generatedObjectUrl) URL.revokeObjectURL(generatedObjectUrl);
    };
  }, [interiorFile, currentManuscriptPage]);

  return (
    <div className="proof-sheet p-3 sm:p-6 border border-[#0F1218] bg-white">
      {/* Light Table Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#0F1218] pb-4 mb-6">
        {/* View mode toggle */}
        <div className="inline-flex border border-[#0F1218] rounded-[var(--control-radius)] p-0.5 bg-[#E8EAEE]">
          <button
            type="button"
            onClick={() => setActiveTab('cover')}
            className="px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors"
            style={{
              backgroundColor: activeTab === 'cover' ? 'var(--key)' : 'transparent',
              color: activeTab === 'cover' ? 'var(--sheet)' : 'var(--key)',
            }}
          >
            Cover spread proof
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('interior')}
            className="px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors"
            style={{
              backgroundColor: activeTab === 'interior' ? 'var(--key)' : 'transparent',
              color: activeTab === 'interior' ? 'var(--sheet)' : 'var(--key)',
            }}
          >
            Interior page proof
          </button>
        </div>

        {/* Guide toggles */}
        <div className="flex items-center gap-3 text-xs">
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showTrimGuide}
              onChange={(e) => setShowTrimGuide(e.target.checked)}
              className="accent-[#0A95D4]"
            />
            <span style={{ color: showTrimGuide ? '#00628F' : '#5A6070' }}>Trim guide</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showBleedGuide}
              onChange={(e) => setShowBleedGuide(e.target.checked)}
              className="accent-[#E4007C]"
            />
            <span style={{ color: showBleedGuide ? '#C70068' : '#5A6070' }}>3mm Bleed</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showSpineGuide}
              onChange={(e) => setShowSpineGuide(e.target.checked)}
              className="accent-[#0F1218]"
            />
            <span style={{ color: showSpineGuide ? '#0F1218' : '#5A6070' }}>Spine center</span>
          </label>
        </div>

        {/* Zoom Controls */}
        <div className="inline-flex items-center border border-[#0F1218] rounded-[var(--control-radius)] p-0.5 bg-white">
          <button
            type="button"
            onClick={() => setZoom(Math.max(75, zoom - 15))}
            className="p-1 cursor-pointer hover:bg-[#E8EAEE]"
            aria-label="Zoom out"
          >
            <Minus size={14} />
          </button>
          <span className="px-2 text-xs font-semibold tabular-nums text-[#0F1218]">{zoom}%</span>
          <button
            type="button"
            onClick={() => setZoom(Math.min(150, zoom + 15))}
            className="p-1 cursor-pointer hover:bg-[#E8EAEE]"
            aria-label="Zoom in"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Light Table Inspection Canvas */}
      <div
        className="relative bg-[#E8EAEE] p-2 sm:p-6 md:p-12 border border-[#CBD0DA] overflow-hidden flex flex-col items-center justify-center min-h-[260px] sm:min-h-[380px]"
        style={{
          transform: `scale(${zoom / 100})`,
          transformOrigin: 'center top',
          transition: 'transform 150ms var(--ease-print)',
        }}
      >
        {activeTab === 'cover' ? (
          /* COVER SPREAD LIGHT TABLE SHEET */
          <div
            className="relative w-full max-w-[480px] aspect-[8/5] bg-white border border-[#0F1218] shadow-md flex items-stretch"
          >
            {coverPreviewUrl && (
              <img
                src={coverPreviewUrl}
                alt={`Uploaded cover artwork: ${coverFile?.name || 'cover artwork'}`}
                className="pointer-events-none absolute top-0 bottom-0 z-10 object-contain"
                style={effectiveLayout === 'front-only'
                  ? { right: 0, width: '50%', height: '100%' }
                  : { inset: 0, width: '100%', height: '100%' }}
              />
            )}

            {/* 3mm Bleed Guideline (Magenta) */}
            {showBleedGuide && (
              <div
                className="absolute -inset-2 border border-dashed pointer-events-none z-30"
                style={{ borderColor: 'var(--magenta)' }}
                title="3mm Outer Bleed Margin"
              />
            )}

            {/* Trim Box (Cyan) */}
            {showTrimGuide && (
              <div
                className="absolute inset-2 border pointer-events-none z-30"
                style={{ borderColor: 'var(--cyan)' }}
                title="Trim Safe Margin"
              />
            )}

            {/* Spine Guideline (Key) */}
            {showSpineGuide && (
              <div
                className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-8 border-x border-[#0F1218] bg-[#F7F9FC] pointer-events-none z-20 flex items-center justify-center text-[8px] font-mono"
                title={`Spine width: ${spreadCalc?.spineWidthMm || 8.4}mm`}
              >
                <span className="rotate-90 whitespace-nowrap">SPINE</span>
              </div>
            )}

            {/* Back Cover (Left) */}
            {!coverPreviewUrl && <div className="flex-1 p-4 flex flex-col justify-between border-r border-[#CBD0DA]">
              <div className="text-[9px] font-mono text-[#5A6070]">BACK COVER</div>
              <div className="text-center my-auto">
                <div className="w-16 h-10 border border-[#0F1218] bg-white mx-auto flex items-center justify-center text-[7px] font-mono">
                  BARCODE
                </div>
              </div>
              <div className="text-[8px] font-mono text-[#5A6070]">ISBN SAMPLE</div>
            </div>}

            {/* Front Cover (Right) */}
            {!coverPreviewUrl && <div className="flex-1 p-4 flex flex-col justify-between">
              <div className="text-[9px] font-mono text-[#5A6070]">FRONT COVER</div>
              <div className="space-y-2 my-auto text-center">
                <div className="text-base font-bold text-[#0F1218]" style={{ fontFamily: 'var(--font-headline)' }}>
                  PRESS &amp; PROOF
                </div>
                <div className="w-24 h-16 border border-[#0F1218] bg-[#F0F4F8] mx-auto flex items-center justify-center text-[8px] text-[#5A6070]">
                  COVER ARTWORK
                </div>
              </div>
              <div className="text-[8px] font-mono text-[#5A6070]">A5 TRIM SPEC</div>
            </div>}

            {/* Preflight Finding with Magenta Margin Note & Caret */}
            <div
              className="absolute -right-4 top-10 transform translate-x-full z-40 bg-white border border-[#C70068] p-2.5 max-w-[200px] text-left shadow-sm"
              style={{ color: 'var(--magenta-text)' }}
            >
              <div className="text-xs font-bold flex items-center gap-1 text-[#C70068]">
                <span>^</span> Preflight Note
              </div>
              <p className="text-[11px] leading-tight mt-1 text-[#C70068]">
                Cover spine text is within 1.2mm of the hinge crease. Ensure 2mm safety margin (sample check).
              </p>
            </div>
          </div>
        ) : (
          /* INTERIOR PAGE LIGHT TABLE SHEET */
          <div
            className="relative w-full max-w-[320px] aspect-[16/21] bg-white border border-[#0F1218] shadow-md p-4 sm:p-6 flex flex-col justify-between"
          >
            {/* Trim Safe Box (Cyan) */}
            {showTrimGuide && (
              <div
                className="absolute inset-3 border pointer-events-none z-30"
                style={{ borderColor: 'var(--cyan)' }}
              />
            )}

            <div className="relative z-20 flex justify-between text-[9px] font-mono text-[#5A6070]">
              <span>Interior Proof</span>
              <span>Page {currentManuscriptPage} of {interiorPageCount}</span>
            </div>

            {interiorPreviewUrl ? (
              <img
                src={interiorPreviewUrl}
                alt={`Uploaded manuscript page ${currentManuscriptPage}: ${interiorFile?.name || 'interior artwork'}`}
                className="pointer-events-none absolute inset-8 z-10 h-[calc(100%-4rem)] w-[calc(100%-4rem)] object-contain"
              />
            ) : (
              <div className="relative z-20 space-y-3 my-auto px-4">
                <div className="h-1.5 bg-[#0F1218] w-2/3" />
                <div className="h-1 bg-[#5A6070] w-full" />
                <div className="h-1 bg-[#5A6070] w-full" />
                <div className="h-1 bg-[#5A6070] w-4/5" />
                <div className="w-full h-24 border border-[#0F1218] bg-[#F7F9FC] flex items-center justify-center text-[9px] text-[#5A6070] relative">
                  <span>HALFTONE FIGURE</span>
                  <span className="absolute bottom-1 right-1 text-[#E4007C] font-bold text-sm">^</span>
                </div>
                <div className="h-1 bg-[#5A6070] w-full" />
                <div className="h-1 bg-[#5A6070] w-3/4" />
              </div>
            )}

            {/* Preflight Finding Margin Note (Change 4: Darker magenta #C70068) */}
            <div
              className="absolute -right-4 top-36 transform translate-x-full z-40 bg-white border border-[#C70068] p-2.5 max-w-[210px] text-left shadow-sm"
              style={{ color: 'var(--magenta-text)' }}
            >
              <div className="text-xs font-bold flex items-center gap-1 text-[#C70068]">
                <span>^</span> Preflight Note
              </div>
              <p className="text-[11px] leading-tight mt-1 text-[#C70068]">
                Page {currentManuscriptPage} image is below 150 dpi (sample check). 300 dpi recommended.
              </p>
            </div>

            <div className="relative z-20 text-[9px] font-mono text-[#5A6070] text-center">
              148 × 210 mm
            </div>
          </div>
        )}
      </div>

      {/* Page Navigation for Interior Proof */}
      {activeTab === 'interior' && (
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-[#0F1218]">
          <button
            type="button"
            disabled={currentManuscriptPage <= 1}
            onClick={() => onManuscriptPageChange(Math.max(1, currentManuscriptPage - 1))}
            className="btn-proof-secondary text-xs py-1.5 px-3 disabled:opacity-40"
          >
            Previous page
          </button>
          <span className="text-xs font-semibold tabular-nums text-[#0F1218]">
            Page {currentManuscriptPage} of {interiorPageCount}
          </span>
          <button
            type="button"
            disabled={currentManuscriptPage >= interiorPageCount}
            onClick={() => onManuscriptPageChange(Math.min(interiorPageCount, currentManuscriptPage + 1))}
            className="btn-proof-secondary text-xs py-1.5 px-3 disabled:opacity-40"
          >
            Next page
          </button>
        </div>
      )}
    </div>
  );
}

export default ProofViewer;
