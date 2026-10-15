'use client';

import React, { useMemo, useState } from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';
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
  const quantity = propQuantity !== undefined ? propQuantity : context.activeQuantity;
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

  // Only display upload fields applicable to the selected product and its configuration
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
        [slot.id]: `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds limit (${Math.round(
          (slot.maxSizeBytes || MAX_FILE_SIZE) / (1024 * 1024)
        )}MB).`,
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
          detectedLayout: preview.detectedLayout,
          numPages: preview.numPages,
        };
      } catch (previewErr) {
        console.warn('Artwork preview generation note:', previewErr);
        previewUrl = '';
      }

      let uploadResult: UploadMetadataResponse | null = null;
      try {
        uploadResult = await registerArtworkUpload({
          originalFilename: file.name,
          mimeType: file.type || 'application/octet-stream',
          sizeBytes: file.size,
          quoteId: quote?.id,
        });
      } catch (regErr) {
        console.warn('Upload registration warning:', regErr);
      }

      onSlotChange?.(slot.id, {
        file,
        previewUrl,
        isObjectUrl,
        metadata,
        uploadResponse: uploadResult,
      });

      if (slot.id === 'interior' || slot.role === 'manuscript') {
        onInteriorChange?.(file, uploadResult, metadata.numPages);
      } else if (slot.id === 'cover' || slot.role === 'cover') {
        onCoverChange?.(file, previewUrl, isObjectUrl, uploadResult, metadata);
      }
    } catch (err: any) {
      setSlotErrors((prev) => ({
        ...prev,
        [slot.id]: err.message || 'File processing failed.',
      }));
    } finally {
      setUploadingSlots((prev) => ({ ...prev, [slot.id]: false }));
    }
  };

  const handleRemove = (slotId: string) => {
    onSlotRemove?.(slotId);
    if (slotId === 'interior' || slotId === 'manuscript') {
      onInteriorRemove?.();
    } else if (slotId === 'cover') {
      onCoverRemove?.();
    }
    setSlotErrors((prev) => ({ ...prev, [slotId]: null }));
  };

  // Preflight validation checks from the central product configuration
  const orderQuantity = quantity ?? quote?.lineItems?.[0]?.quantity ?? 10;
  const validationResults = useMemo(() => {
    return config.evaluateChecks({
      productId: config.productId,
      options,
      slotsData: currentSlotsData,
      quantity: orderQuantity,
    });
  }, [config, options, currentSlotsData, orderQuantity]);

  // Can proceed if all required active slots are uploaded and none are currently uploading
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

          <button
            className="btn btn-primary"
            style={{ padding: '14px 24px', fontSize: 11, marginTop: 28 }}
            disabled={!canProceed}
            onClick={() => onNavigate('proof')}
          >
            Continue to visual proof <ArrowRight size={14} />
          </button>
        </div>

        <PreflightChecklist validationResults={validationResults} product={product} />
      </main>

      <Footer onNavigate={onNavigate} />
    </>
  );
}
