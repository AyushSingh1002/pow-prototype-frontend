'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { QuoteResponse, Product, StorefrontPage, CoverMetadata } from '../../../types';
import { useOrderFlow } from '../../../context/OrderFlowContext';
import {
  calculateCoverSpreadDimensions,
  detectArtworkLayout,
  ArtworkLayoutType,
} from '../../../lib/coverSpread';
import { FlowStepper } from '../../../components/layout/FlowStepper';
import { Footer } from '../../../components/layout/Footer';
import { ProofViewer } from './ProofViewer';
import { ProofSidebar } from './ProofSidebar';

interface ProofViewProps {
  quote?: QuoteResponse | null;
  product?: Product | null;
  options?: Record<string, string>;
  quantity?: number;
  interiorFile?: File | null;
  coverFile?: File | null;
  coverPreviewUrl?: string | null;
  coverMetadata?: CoverMetadata | null;
  interiorPageCount?: number;
  currentManuscriptPage?: number;
  onManuscriptPageChange?: (page: number) => void;
  onManuscriptPageCountSync?: (count: number) => void;
  proofApproved?: boolean;
  onSetProofApproved?: (approved: boolean) => void;
  onNavigate?: (page: StorefrontPage) => void;
}

export function ProofView({
  quote: propQuote,
  product: propProduct,
  options: propOptions,
  quantity: propQuantity,
  interiorFile: propInteriorFile,
  coverFile: propCoverFile,
  coverPreviewUrl: propCoverPreviewUrl,
  coverMetadata: propCoverMetadata,
  interiorPageCount: propInteriorPageCount,
  currentManuscriptPage: propCurrentManuscriptPage,
  onManuscriptPageChange: propManuscriptPageChange,
  onManuscriptPageCountSync: propManuscriptPageCountSync,
  proofApproved: propProofApproved,
  onSetProofApproved: propSetProofApproved,
  onNavigate: propNavigate,
}: ProofViewProps) {
  const context = useOrderFlow();

  const quote = propQuote !== undefined ? propQuote : context.activeQuote;
  const product = propProduct !== undefined ? propProduct : context.currentProduct;
  const options = propOptions !== undefined ? propOptions : context.activeOptions;
  const quantity = propQuantity !== undefined ? propQuantity : context.activeQuantity;
  const interiorFile = propInteriorFile !== undefined ? propInteriorFile : context.interiorFile;
  const coverFile = propCoverFile !== undefined ? propCoverFile : context.coverFile;
  const coverPreviewUrl =
    propCoverPreviewUrl !== undefined ? propCoverPreviewUrl : context.coverPreviewUrl;
  const coverMetadata =
    propCoverMetadata !== undefined ? propCoverMetadata : context.coverMetadata;
  const interiorPageCount =
    propInteriorPageCount !== undefined ? propInteriorPageCount : context.interiorPageCount;
  const currentManuscriptPage =
    propCurrentManuscriptPage !== undefined
      ? propCurrentManuscriptPage
      : context.interiorCurrentPage;
  const onManuscriptPageChange = propManuscriptPageChange || context.setInteriorCurrentPage;
  const onManuscriptPageCountSync =
    propManuscriptPageCountSync || context.setInteriorPageCount;
  const proofApproved =
    propProofApproved !== undefined ? propProofApproved : context.proofApproved;
  const onSetProofApproved = propSetProofApproved || context.setProofApproved;
  const onNavigate = propNavigate || context.navigate;

  const [detectedLayout, setDetectedLayout] = useState<ArtworkLayoutType>(
    coverMetadata?.detectedLayout || 'unknown'
  );
  const [userLayoutConfirmed, setUserLayoutConfirmed] = useState<ArtworkLayoutType | null>(null);

  // Dynamic spread geometry based on configured page count, paper stock, and binding
  const spreadCalc = useMemo(() => {
    return calculateCoverSpreadDimensions({
      pageCount: interiorPageCount,
      size: options.size,
      paper: options.paper,
      binding: options.binding,
    });
  }, [interiorPageCount, options.size, options.paper, options.binding]);

  // Sync detected layout when metadata changes
  useEffect(() => {
    if (coverMetadata?.detectedLayout) {
      setDetectedLayout(coverMetadata.detectedLayout);
    } else if (!coverFile) {
      setDetectedLayout('unknown');
      setUserLayoutConfirmed(null);
    }
  }, [coverMetadata, coverFile]);

  // Fallback image dimension detection on load
  const handleCoverImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth && img.naturalHeight && (!detectedLayout || detectedLayout === 'unknown')) {
      const detected = detectArtworkLayout(img.naturalWidth, img.naturalHeight, 1);
      setDetectedLayout(detected.layout);
    }
  };

  const effectiveLayout = userLayoutConfirmed || detectedLayout;

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
        <ProofViewer
          options={options}
          interiorFile={interiorFile}
          coverFile={coverFile}
          coverPreviewUrl={coverPreviewUrl}
          coverMetadata={coverMetadata}
          interiorPageCount={interiorPageCount}
          currentManuscriptPage={currentManuscriptPage}
          onManuscriptPageChange={onManuscriptPageChange}
          onManuscriptPageCountSync={onManuscriptPageCountSync}
          effectiveLayout={effectiveLayout}
          userLayoutConfirmed={userLayoutConfirmed}
          setUserLayoutConfirmed={setUserLayoutConfirmed}
          onCoverImageLoad={handleCoverImageLoad}
          spreadCalc={spreadCalc}
        />

        <ProofSidebar
          quote={quote}
          product={product}
          options={options}
          quantity={quantity}
          interiorFile={interiorFile}
          coverFile={coverFile}
          effectiveLayout={effectiveLayout}
          spreadCalc={spreadCalc}
          interiorPageCount={interiorPageCount}
          proofApproved={proofApproved}
          onSetProofApproved={onSetProofApproved}
          onNavigate={onNavigate}
        />
      </main>

      <Footer onNavigate={onNavigate} />
    </>
  );
}
