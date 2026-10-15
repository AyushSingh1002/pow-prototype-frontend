'use client';

import React, { useMemo, useState } from 'react';
import {
  QuoteResponse,
  Product,
  UploadMetadataResponse,
  StorefrontPage,
} from '../../../types';
import { useOrderFlow } from '../../../context/OrderFlowContext';
import { generateArtworkPreview } from '../../../lib/pdfPreview';
import { registerArtworkUpload } from '../../../lib/api';
import {
  getProductUploadConfig,
  UploadSlotConfig,
  UploadedSlotData,
} from '../../../lib/productUploadConfig';
import { FlowStepper } from '../../../components/layout/FlowStepper';
import { Footer } from '../../../components/layout/Footer';
import { UploadSlotCard } from './UploadSlotCard';
import { PreflightChecklist } from './PreflightChecklist';

interface UploadViewProps {
  quote?: QuoteResponse | null;
  product?: Product | null;
  options?: Record<string, string>;
  quantity?: number;
  slotsData?: Record<string, UploadedSlotData | undefined>;
  onSlotChange?: (slotId: string, data: UploadedSlotData) => void;
  onSlotRemove?: (slotId: string) => void;
  onNavigate?: (page: StorefrontPage) => void;
  interiorFile?: File | null;
  interiorUpload?: UploadMetadataResponse | null;
  onInteriorChange?: (
    file: File,
    uploadData: UploadMetadataResponse | null,
    pageCount?: number
  ) => void;
  onInteriorRemove?: () => void;
  coverFile?: File | null;
  coverPreviewUrl?: string | null;
  coverUpload?: UploadMetadataResponse | null;
  onCoverChange?: (
    file: File,
    previewUrl: string,
    isObjUrl: boolean,
    uploadData: UploadMetadataResponse | null,
    metadata?: any
  ) => void;
  onCoverRemove?: () => void;
}

export function UploadView({
  quote: propQuote,
  product: propProduct,
  options: propOptions,
  quantity: propQuantity,
  slotsData: propSlotsData,
  onSlotChange: propSlotChange,
  onSlotRemove: propSlotRemove,
  onNavigate: propNavigate,
  interiorFile: propInteriorFile,
  interiorUpload: propInteriorUpload,
  onInteriorChange: propInteriorChange,
  onInteriorRemove: propInteriorRemove,
  coverFile: propCoverFile,
  coverPreviewUrl: propCoverPreviewUrl,
  coverUpload: propCoverUpload,
  onCoverChange: propCoverChange,
  onCoverRemove: propCoverRemove,
}: UploadViewProps) {
  const context = useOrderFlow();

  const quote = propQuote !== undefined ? propQuote : context.activeQuote;
  const product = propProduct !== undefined ? propProduct : context.currentProduct;
  const options = propOptions !== undefined ? propOptions : context.activeOptions;
  const orderQuantity = propQuantity !== undefined ? propQuantity : context.activeQuantity;

  const slotsData = propSlotsData !== undefined ? propSlotsData : context.slotsData;
  const onSlotChange = propSlotChange || context.handleSlotChange;
  const onSlotRemove = propSlotRemove || context.handleSlotRemove;
  const onNavigate = propNavigate || context.navigate;

  const interiorFile = propInteriorFile !== undefined ? propInteriorFile : context.interiorFile;
  const interiorUpload =
    propInteriorUpload !== undefined ? propInteriorUpload : context.interiorUpload;
  const onInteriorChange = propInteriorChange || context.handleInteriorChange;
  const onInteriorRemove = propInteriorRemove || context.handleInteriorRemove;

  const coverFile = propCoverFile !== undefined ? propCoverFile : context.coverFile;
  const coverPreviewUrl =
    propCoverPreviewUrl !== undefined ? propCoverPreviewUrl : context.coverPreviewUrl;
  const coverUpload = propCoverUpload !== undefined ? propCoverUpload : context.coverUpload;
  const onCoverChange = propCoverChange || context.handleCoverChange;
  const onCoverRemove = propCoverRemove || context.handleCoverRemove;

  const config = useMemo(() => getProductUploadConfig(product?.id), [product?.id]);
  const [uploadingSlots, setUploadingSlots] = useState<Record<string, boolean>>({});
  const [slotErrors, setSlotErrors] = useState<Record<string, string | null>>({});
  const [dragOverSlots, setDragOverSlots] = useState<Record<string, boolean>>({});

  const MAX_FILE_SIZE = 250 * 1024 * 1024; // 250MB

  const currentSlotsData = useMemo(() => {
    const data: Record<string, UploadedSlotData | undefined> = { ...slotsData };
    if (interiorFile && !data.interior) {
      data.interior = {
        file: interiorFile,
        previewUrl: '',
        isObjectUrl: false,
        uploadResponse: interiorUpload,
      };
    }
    if (coverFile && !data.cover) {
      data.cover = {
        file: coverFile,
        previewUrl: coverPreviewUrl || '',
        isObjectUrl: false,
        uploadResponse: coverUpload,
      };
    }
    return data;
  }, [slotsData, interiorFile, interiorUpload, coverFile, coverPreviewUrl, coverUpload]);

  const activeSlots = useMemo(() => {
    return config.slots.filter((slot) => {
      if (!slot.condition) return true;
      return slot.condition(options);
    });
  }, [config, options]);

  const handleFileUpload = async (slot: UploadSlotConfig, file: File) => {
    setSlotErrors((prev) => ({ ...prev, [slot.id]: null }));

    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    const isExtensionAllowed = slot.acceptedExtensions.some(
      (allowed) => ext === allowed.toLowerCase()
    );
    const isMimeAllowed = slot.acceptedMimeTypes.some((mime) => {
      if (mime.endsWith('/*')) {
        return file.type.startsWith(mime.replace('/*', ''));
      }
      return file.type === mime;
    });

    if (!isExtensionAllowed && !isMimeAllowed) {
      setSlotErrors((prev) => ({
        ...prev,
        [slot.id]: `Unsupported file format (${ext}). Allowed formats: ${slot.acceptedExtensions
          .join(', ')
          .toUpperCase()}.`,
      }));
      return;
    }

    if (file.size > (slot.maxSizeBytes || MAX_FILE_SIZE)) {
      setSlotErrors((prev) => ({
        ...prev,
        [slot.id]: `File size exceeds ${(slot.maxSizeBytes || MAX_FILE_SIZE) / (1024 * 1024)}MB.`,
      }));
      return;
    }

    setUploadingSlots((prev) => ({ ...prev, [slot.id]: true }));
    try {
      let previewUrl = '';
      let isObjectUrl = false;
      let metadata: any = {};

      try {
        const preview = await generateArtworkPreview(file);
        previewUrl = preview.previewUrl;
        isObjectUrl = !!preview.isObjectUrl;
        metadata = {
          width: preview.width,
          height: preview.height,
          aspectRatio: preview.aspectRatio,
          numPages: preview.numPages,
        };
      } catch (err) {
        console.warn('Local preview generation skipped:', err);
      }

      let uploadRes: UploadMetadataResponse | null = null;
      try {
        uploadRes = await registerArtworkUpload({
          originalFilename: file.name,
          mimeType: file.type || 'application/pdf',
          sizeBytes: file.size,
          quoteId: quote?.id,
        });
      } catch (err) {
        console.warn('Server preflight bypassed in demo mode');
      }

      const slotResult: UploadedSlotData = {
        file,
        previewUrl,
        isObjectUrl,
        uploadResponse: uploadRes,
        metadata,
      };

      onSlotChange(slot.id, slotResult);

      if (slot.id === 'interior') {
        onInteriorChange(file, uploadRes, metadata.numPages);
      } else if (slot.id === 'cover') {
        onCoverChange(file, previewUrl, isObjectUrl, uploadRes, metadata);
      }
    } catch (err: any) {
      setSlotErrors((prev) => ({
        ...prev,
        [slot.id]: err.message || 'Artwork processing failed. Ensure file is unencrypted.',
      }));
    } finally {
      setUploadingSlots((prev) => ({ ...prev, [slot.id]: false }));
    }
  };

  const handleRemove = (slotId: string) => {
    onSlotRemove(slotId);
    if (slotId === 'interior') onInteriorRemove();
    if (slotId === 'cover') onCoverRemove();
  };

  const validationResults = useMemo(() => {
    return config.evaluateChecks({
      productId: product?.id || 'books',
      options: options || {},
      slotsData: currentSlotsData,
      quantity: orderQuantity,
    });
  }, [config, product?.id, options, currentSlotsData, orderQuantity]);

  const canProceed = useMemo(() => {
    const isAnyUploading = Object.values(uploadingSlots).some(Boolean);
    if (isAnyUploading) return false;

    return activeSlots.every((slot) => {
      const isRequired =
        typeof slot.required === 'function' ? slot.required(options) : slot.required;
      if (!isRequired) return true;
      return Boolean(currentSlotsData[slot.id]?.file);
    });
  }, [activeSlots, options, currentSlotsData, uploadingSlots]);

  return (
    <div className="w-full">
      <div className="proof-container py-6">
        <FlowStepper activeStep={2} onNavigate={onNavigate} />

        <div className="border-b border-[#0F1218] pb-4 mb-8">
          <div className="flex justify-between items-baseline flex-wrap gap-2">
            <h1>Upload Print Artwork</h1>
            <span className="sample-stamp">Preflight check</span>
          </div>
          <p className="reading-text-soft text-sm mt-1">
            Files undergo automatic preflight verification for trim geometry, bleed margins and ink gamut.
          </p>
        </div>

        <div className="crop-marked proof-sheet p-6 md:p-12 border border-[#0F1218] bg-[#FDFDFC]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left 7 Columns: Slots */}
            <div className="lg:col-span-7 space-y-6">
              {activeSlots.map((slot, index) => {
                const slotData = currentSlotsData[slot.id];
                const isUploading = !!uploadingSlots[slot.id];
                const isDragOver = !!dragOverSlots[slot.id];
                const error = slotErrors[slot.id];
                const isRequired =
                  typeof slot.required === 'function' ? slot.required(options) : slot.required;

                return (
                  <UploadSlotCard
                    key={slot.id}
                    slot={slot}
                    index={index}
                    slotData={slotData}
                    isRequired={isRequired}
                    isUploading={isUploading}
                    isDragOver={isDragOver}
                    error={error}
                    onUpload={handleFileUpload}
                    onRemove={handleRemove}
                    onDragOverChange={(id, over) =>
                      setDragOverSlots((prev) => ({ ...prev, [id]: over }))
                    }
                  />
                );
              })}

              <div className="pt-6">
                <button
                  className="btn-proof-primary py-3.5 px-8 text-sm"
                  disabled={!canProceed}
                  onClick={() => onNavigate('proof')}
                >
                  Continue to digital proof
                </button>
              </div>
            </div>

            {/* Right 5 Columns: Preflight Checklist Sheet */}
            <div className="lg:col-span-5 sticky top-24">
              <PreflightChecklist validationResults={validationResults} product={product} />
            </div>
          </div>

          <div className="crop-marks-bottom" />
        </div>
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}

export default UploadView;
