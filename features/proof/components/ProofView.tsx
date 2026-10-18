'use client';

import React, { useMemo, useState, useEffect } from 'react';
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
  const onManuscriptPageChange =
    propManuscriptPageChange || context.setInteriorCurrentPage;
  const onManuscriptPageCountSync =
    propManuscriptPageCountSync || context.setInteriorPageCount;
  const proofApproved =
    propProofApproved !== undefined ? propProofApproved : context.proofApproved;
  const onSetProofApproved = propSetProofApproved || context.setProofApproved;
  const onNavigate = propNavigate || context.navigate;

  const [detectedLayout, setDetectedLayout] = useState<ArtworkLayoutType>('full-wrap');
  const [userLayoutConfirmed, setUserLayoutConfirmed] = useState<ArtworkLayoutType | null>(null);

  const format = options['format'] || options['size'] || 'A5';
  const paper = options['paper'] || '80 GSM Natural White';
  const binding = options['binding'] || 'perfect_bound';

  const spreadCalc = useMemo(() => {
    return calculateCoverSpreadDimensions({
      size: format,
      pageCount: interiorPageCount || 120,
      paper,
      binding,
    });
  }, [format, interiorPageCount, paper, binding]);

  useEffect(() => {
    if (coverMetadata?.detectedLayout) {
      setDetectedLayout(coverMetadata.detectedLayout);
    }
  }, [coverMetadata]);

  const handleCoverImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth && img.naturalHeight && (!detectedLayout || detectedLayout === 'unknown')) {
      const detected = detectArtworkLayout(img.naturalWidth, img.naturalHeight, 1);
      setDetectedLayout(detected.layout);
    }
  };

  const effectiveLayout = userLayoutConfirmed || detectedLayout;

  return (
    <div className="w-full">
      <div className="proof-container py-6">
        <FlowStepper activeStep={3} onNavigate={onNavigate} />

        <div className="border-b border-[#0F1218] pb-4 mb-8">
          <div className="flex justify-between items-baseline flex-wrap gap-2">
            <h1>Digital Proof Inspection</h1>
            <span className="sample-stamp">Light table proof</span>
          </div>
          <p className="reading-text-soft text-sm mt-1">
            Check trim allowances, 3mm bleed margins and spine alignment. Preflight notes identify potential print discrepancies.
          </p>
        </div>

        <div className="crop-marked proof-sheet p-3 sm:p-6 md:p-12 border border-[#0F1218] bg-[#FDFDFC]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-8">
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
            </div>

            <div className="lg:col-span-4">
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
            </div>
          </div>

          <div className="crop-marks-bottom" />
        </div>
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}

export default ProofView;
