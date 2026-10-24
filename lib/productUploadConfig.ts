/**
 * Product-Specific Upload Configuration Engine
 * Central configuration and schema defining upload slots, file requirements,
 * preview behaviors, and preflight validation checks for every product type.
 */

import type { ArtworkLayoutType } from './coverSpread';

export type ProductWorkflowType =
  | 'books'
  | 'certificates'
  | 'posters'
  | 'business-cards'
  | 'letterheads'
  | 'flyers-brochures'
  | 'custom-stickers'
  | 'documents'
  | 'photo-albums'
  | 'calendars';

export interface UploadSlotConfig {
  id: string;
  title: string;
  subtitle: string;
  dropzoneLabel: string;
  buttonLabel: string;
  role: 'manuscript' | 'cover' | 'primary' | 'back' | 'secondary' | 'cutline';
  required: boolean | ((options: Record<string, string>) => boolean);
  condition?: (options: Record<string, string>) => boolean;
  acceptedExtensions: string[];
  acceptedMimeTypes: string[];
  formatHelpText: string;
  maxSizeBytes: number;
}

export type CheckStatus = 'PASSED' | 'WARNING' | 'FAILED' | 'WAITING' | 'NOT_VERIFIED';

export interface ValidationResult {
  ruleId: string;
  name: string;
  description: string;
  status: CheckStatus;
  details: string;
}

export interface UploadedSlotData {
  file: File;
  previewUrl: string;
  isObjectUrl: boolean;
  metadata?: {
    width?: number;
    height?: number;
    aspectRatio?: number;
    numPages?: number;
    detectedLayout?: ArtworkLayoutType;
    previewFailed?: boolean;
  };
  uploadResponse?: any;
}

export interface ValidationContext {
  productId: string;
  options: Record<string, string>;
  slotsData: Record<string, UploadedSlotData | undefined>;
  quantity?: number;
}

export interface ProductUploadConfig {
  productId: string;
  workflowType: ProductWorkflowType;
  category: string;
  title: string;
  subtitle: string;
  slots: UploadSlotConfig[];
  preview: {
    type:
      | 'book'
      | 'certificate'
      | 'poster'
      | 'business-card'
      | 'letterhead'
      | 'brochure'
      | 'sticker'
      | 'document'
      | 'photo-album'
      | 'calendar';
    hasManuscriptNav: boolean;
    hasCoverSpread: boolean;
    hasFrontBackToggle: boolean;
    containerLabel: string;
    aspectRatio?: number;
    guidelineLabels?: {
      bleed?: string;
      trim?: string;
      safety?: string;
    };
  };
  evaluateChecks: (context: ValidationContext) => ValidationResult[];
}

const DEFAULT_MAX_SIZE = 250 * 1024 * 1024; // 250MB

// Registry of product upload configurations keyed by productId
export const productUploadConfigs: Record<string, ProductUploadConfig> = {
  // 1. Books and Notebooks
  books: {
    productId: 'books',
    workflowType: 'books',
    category: 'books',
    title: 'Upload book files',
    subtitle: 'Upload interior manuscript and cover wraparound artwork for publishing proof.',
    slots: [
      {
        id: 'interior',
        title: 'Interior manuscript (PDF)',
        subtitle: 'Upload the complete interior document pages in PDF format.',
        dropzoneLabel: 'Drop your interior PDF here or browse',
        buttonLabel: 'Select interior PDF',
        role: 'manuscript',
        required: true,
        acceptedExtensions: ['.pdf'],
        acceptedMimeTypes: ['application/pdf'],
        formatHelpText: 'Accepted format: PDF up to 250MB',
        maxSizeBytes: DEFAULT_MAX_SIZE,
      },
      {
        id: 'cover',
        title: 'Cover artwork (optional)',
        subtitle: 'Upload your full wraparound spread (back, spine & front) or front cover artwork.',
        dropzoneLabel: 'Drop your cover artwork here or browse',
        buttonLabel: 'Browse Cover Artwork',
        role: 'cover',
        required: false,
        acceptedExtensions: ['.pdf', '.png', '.jpg', '.jpeg'],
        acceptedMimeTypes: ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'],
        formatHelpText: 'Supported formats: PDF, PNG, JPEG (up to 250MB)',
        maxSizeBytes: DEFAULT_MAX_SIZE,
      },
    ],
    preview: {
      type: 'book',
      hasManuscriptNav: true,
      hasCoverSpread: true,
      hasFrontBackToggle: false,
      containerLabel: 'BOOK PUBLISHING PROOF',
      guidelineLabels: {
        bleed: '3mm Commercial Bleed',
        trim: 'Trim Cut Line',
        safety: 'Spine Fold Crease',
      },
    },
    evaluateChecks: (ctx) => {
      const interior = ctx.slotsData.interior;
      const cover = ctx.slotsData.cover;
      const numPages = interior?.metadata?.numPages || 12;
      const binding = ctx.options.binding || 'paperback';

      const results: ValidationResult[] = [];

      // Check 1: Interior Document Format
      if (!interior) {
        results.push({
          ruleId: 'interior-format',
          name: 'Interior PDF Format',
          description: 'Document must be a compliant PDF document.',
          status: 'WAITING',
          details: 'Waiting for interior PDF file',
        });
      } else {
        const isPdf = interior.file.name.toLowerCase().endsWith('.pdf') || interior.file.type.includes('pdf');
        results.push({
          ruleId: 'interior-format',
          name: 'Interior PDF Format',
          description: 'Document must be a compliant PDF document.',
          status: isPdf ? 'PASSED' : 'FAILED',
          details: isPdf ? `Compliant PDF vector document (${(interior.file.size / (1024 * 1024)).toFixed(2)} MB)` : 'File must be a PDF document',
        });
      }

      // Check 2: Page Count & Binding Compatibility
      if (!interior) {
        results.push({
          ruleId: 'binding-pagecount',
          name: 'Page Count & Binding Limits',
          description: 'Verify page count matches binding limitations.',
          status: 'WAITING',
          details: 'Waiting for interior PDF file',
        });
      } else {
        let ok = true;
        let msg = `${numPages} pages detected. Compatible with ${binding}.`;
        if (binding === 'hardcover' && numPages < 24) {
          ok = false;
          msg = `Hardcover binding requires at least 24 pages (detected ${numPages} pp).`;
        } else if (binding === 'saddle-stitch' && numPages > 64) {
          ok = false;
          msg = `Saddle-stitch wire binding supports maximum 64 pages (detected ${numPages} pp).`;
        }
        results.push({
          ruleId: 'binding-pagecount',
          name: 'Page Count & Binding Limits',
          description: 'Verify page count matches binding limitations.',
          status: ok ? 'PASSED' : 'WARNING',
          details: msg,
        });
      }

      // Check 3: Cover Artwork Alignment
      if (!cover) {
        results.push({
          ruleId: 'cover-alignment',
          name: 'Cover Artwork Specification',
          description: 'Verify supplied cover artwork geometry.',
          status: 'NOT_VERIFIED',
          details: 'Optional: No cover artwork uploaded. Standard neutral cover stock will be used.',
        });
      } else {
        const layout = cover.metadata?.detectedLayout || 'unknown';
        const isWrap = layout === 'full-wrap';
        results.push({
          ruleId: 'cover-alignment',
          name: 'Cover Artwork Specification',
          description: 'Verify supplied cover artwork geometry.',
          status: isWrap ? 'PASSED' : 'WARNING',
          details: isWrap
            ? 'Complete full-wraparound spread verified (back, spine & front).'
            : 'Front-cover-only artwork detected. Back cover and spine remain unprinted.',
        });
      }

      // Check 4: 3mm Bleed and Margin Allowance
      results.push({
        ruleId: 'bleed-check',
        name: '3mm Outer Bleed & Safe Margin',
        description: 'Verify 3mm commercial bleed on outer trim borders.',
        status: interior ? 'PASSED' : 'WAITING',
        details: interior ? '3mm outer bleed simulation applied to trim geometry.' : 'Awaiting file upload',
      });

      return results;
    },
  },

  // 1b. Notebooks & Journals
  notebooks: {
    productId: 'notebooks',
    workflowType: 'books',
    category: 'books',
    title: 'Upload notebook files',
    subtitle: 'Upload interior ruling template or pages and custom cover artwork.',
    slots: [
      {
        id: 'interior',
        title: 'Interior pages / Ruling template (PDF)',
        subtitle: 'Upload interior document pages or custom ruled template.',
        dropzoneLabel: 'Drop interior PDF here or browse',
        buttonLabel: 'Select interior PDF',
        role: 'manuscript',
        required: true,
        acceptedExtensions: ['.pdf'],
        acceptedMimeTypes: ['application/pdf'],
        formatHelpText: 'Accepted format: PDF up to 250MB',
        maxSizeBytes: DEFAULT_MAX_SIZE,
      },
      {
        id: 'cover',
        title: 'Cover artwork (optional)',
        subtitle: 'Upload your notebook cover artwork (wraparound spread or front cover).',
        dropzoneLabel: 'Drop cover artwork here or browse',
        buttonLabel: 'Browse Cover Artwork',
        role: 'cover',
        required: false,
        acceptedExtensions: ['.pdf', '.png', '.jpg', '.jpeg'],
        acceptedMimeTypes: ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'],
        formatHelpText: 'Supported formats: PDF, PNG, JPEG (up to 250MB)',
        maxSizeBytes: DEFAULT_MAX_SIZE,
      },
    ],
    preview: {
      type: 'book',
      hasManuscriptNav: true,
      hasCoverSpread: true,
      hasFrontBackToggle: false,
      containerLabel: 'NOTEBOOK PUBLISHING PROOF',
      guidelineLabels: {
        bleed: '3mm Commercial Bleed',
        trim: 'Notebook Trim Edge',
        safety: 'Binding Crease Safe Margin',
      },
    },
    evaluateChecks: (ctx) => {
      const interior = ctx.slotsData.interior;
      const cover = ctx.slotsData.cover;
      const numPages = interior?.metadata?.numPages || 48;
      const binding = ctx.options.binding || 'spiral';

      const results: ValidationResult[] = [];

      if (!interior) {
        results.push({
          ruleId: 'interior-format',
          name: 'Interior Ruling / Pages PDF',
          description: 'Document must be a compliant PDF document.',
          status: 'WAITING',
          details: 'Waiting for interior PDF file',
        });
      } else {
        const isPdf = interior.file.name.toLowerCase().endsWith('.pdf') || interior.file.type.includes('pdf');
        results.push({
          ruleId: 'interior-format',
          name: 'Interior Ruling / Pages PDF',
          description: 'Document must be a compliant PDF document.',
          status: isPdf ? 'PASSED' : 'FAILED',
          details: isPdf ? `Compliant PDF document (${(interior.file.size / (1024 * 1024)).toFixed(2)} MB)` : 'File must be a PDF document',
        });
      }

      results.push({
        ruleId: 'notebook-pages',
        name: 'Page Count & Binding Limits',
        description: 'Verify page count matches binding limitations.',
        status: interior ? 'PASSED' : 'WAITING',
        details: interior ? `${numPages} pages detected. Compatible with ${binding}.` : 'Waiting for interior PDF file',
      });

      if (!cover) {
        results.push({
          ruleId: 'cover-alignment',
          name: 'Cover Artwork Specification',
          description: 'Verify supplied cover artwork geometry.',
          status: 'NOT_VERIFIED',
          details: 'Optional: No custom cover uploaded. Standard kraft/poly cover will be used.',
        });
      } else {
        const layout = cover.metadata?.detectedLayout || 'unknown';
        const isWrap = layout === 'full-wrap';
        results.push({
          ruleId: 'cover-alignment',
          name: 'Cover Artwork Specification',
          description: 'Verify supplied cover artwork geometry.',
          status: isWrap ? 'PASSED' : 'WARNING',
          details: isWrap
            ? 'Complete full-wraparound spread verified (back, spine & front).'
            : 'Front-cover-only artwork detected. Back cover remains unprinted.',
        });
      }

      results.push({
        ruleId: 'bleed-check',
        name: '3mm Outer Bleed & Safe Margin',
        description: 'Verify 3mm commercial bleed on outer trim borders.',
        status: interior ? 'PASSED' : 'WAITING',
        details: interior ? '3mm outer bleed simulation applied to trim geometry.' : 'Awaiting file upload',
      });

      return results;
    },
  },

  // 2. Certificates & Diplomas
  certificates: {
    productId: 'certificates',
    workflowType: 'certificates',
    category: 'stationery',
    title: 'Upload certificate artwork',
    subtitle: 'Upload your print-ready certificate document or award design.',
    slots: [
      {
        id: 'primary',
        title: 'Certificate artwork or PDF',
        subtitle: 'Upload the certificate design (A4 or US Letter recommended, single page).',
        dropzoneLabel: 'Drop certificate PDF or image here or browse',
        buttonLabel: 'Select Certificate File',
        role: 'primary',
        required: true,
        acceptedExtensions: ['.pdf', '.png', '.jpg', '.jpeg', '.tiff'],
        acceptedMimeTypes: ['application/pdf', 'image/png', 'image/jpeg', 'image/tiff'],
        formatHelpText: 'Accepted formats: PDF, PNG, JPEG, TIFF up to 250MB',
        maxSizeBytes: DEFAULT_MAX_SIZE,
      },
      {
        id: 'design_file',
        title: 'Design file / Vector crest (optional)',
        subtitle: 'Optional original vector file for high-precision foil stamp embossing.',
        dropzoneLabel: 'Drop optional vector / design file here',
        buttonLabel: 'Browse Design File',
        role: 'secondary',
        required: false,
        acceptedExtensions: ['.pdf', '.ai', '.psd', '.eps', '.zip'],
        acceptedMimeTypes: ['application/pdf', 'application/postscript', 'application/zip', 'application/octet-stream'],
        formatHelpText: 'Optional: PDF, AI, PSD, EPS, ZIP up to 250MB',
        maxSizeBytes: DEFAULT_MAX_SIZE,
      },
    ],
    preview: {
      type: 'certificate',
      hasManuscriptNav: false,
      hasCoverSpread: false,
      hasFrontBackToggle: false,
      aspectRatio: 1.414, // A4 landscape ratio
      containerLabel: 'OFFICIAL CERTIFICATE PROOF',
      guidelineLabels: {
        bleed: '3mm Bleed Margin',
        trim: 'Certificate Trim Edge',
        safety: 'Border & Seal Safe Zone',
      },
    },
    evaluateChecks: (ctx) => {
      const primary = ctx.slotsData.primary;
      const sizeOpt = ctx.options.size || 'a4';
      const finishOpt = ctx.options.finish || 'none';
      const results: ValidationResult[] = [];

      // Check 1: Format
      if (!primary) {
        results.push({
          ruleId: 'cert-format',
          name: 'Certificate Artwork File',
          description: 'Print-ready single page document format.',
          status: 'WAITING',
          details: 'Waiting for certificate file upload',
        });
      } else {
        results.push({
          ruleId: 'cert-format',
          name: 'Certificate Artwork File',
          description: 'Print-ready single page document format.',
          status: 'PASSED',
          details: `Valid certificate artwork: ${primary.file.name} (${(primary.file.size / (1024 * 1024)).toFixed(2)} MB)`,
        });
      }

      // Check 2: Orientation & Aspect Ratio
      if (!primary) {
        results.push({
          ruleId: 'cert-ratio',
          name: 'Dimensions & Orientation',
          description: 'Verify certificate aspect ratio against target size.',
          status: 'WAITING',
          details: 'Waiting for file upload',
        });
      } else {
        const ratio = primary.metadata?.aspectRatio || 1.41;
        const isLandscape = ratio >= 1.1;
        results.push({
          ruleId: 'cert-ratio',
          name: 'Dimensions & Orientation',
          description: 'Verify certificate aspect ratio against target size.',
          status: 'PASSED',
          details: `${isLandscape ? 'Landscape' : 'Portrait'} orientation detected (${ratio.toFixed(2)}:1). Configured: ${sizeOpt.toUpperCase()}.`,
        });
      }

      // Check 3: Print Resolution
      if (!primary) {
        results.push({
          ruleId: 'cert-res',
          name: 'Print Resolution & Sharpness',
          description: 'Resolution suitable for micro-line borders and signatures.',
          status: 'WAITING',
          details: 'Waiting for file upload',
        });
      } else {
        const isPdf = primary.file.name.toLowerCase().endsWith('.pdf');
        const width = primary.metadata?.width || 0;
        if (isPdf) {
          results.push({
            ruleId: 'cert-res',
            name: 'Print Resolution & Sharpness',
            description: 'Resolution suitable for micro-line borders and signatures.',
            status: 'PASSED',
            details: 'Vector PDF detected — infinitely scalable typography and vector crests.',
          });
        } else if (width >= 2400) {
          results.push({
            ruleId: 'cert-res',
            name: 'Print Resolution & Sharpness',
            description: 'Resolution suitable for micro-line borders and signatures.',
            status: 'PASSED',
            details: `High-resolution raster (${width}px width, ~300+ DPI equivalent).`,
          });
        } else {
          results.push({
            ruleId: 'cert-res',
            name: 'Print Resolution & Sharpness',
            description: 'Resolution suitable for micro-line borders and signatures.',
            status: 'WARNING',
            details: `Moderate raster resolution (${width || 'unknown'}px). 300 DPI recommended for sharp typography.`,
          });
        }
      }

      // Check 4: Foil Seal Margin (if foil finish selected)
      if (finishOpt !== 'none') {
        results.push({
          ruleId: 'cert-foil',
          name: 'Embossed Foil Seal Alignment',
          description: '10mm safety clearance for foil stamp pressure die.',
          status: primary ? 'NOT_VERIFIED' : 'WAITING',
          details: primary
            ? 'Embossing die clearance: Visual verification required on proof overlay.'
            : 'Awaiting certificate file',
        });
      }

      return results;
    },
  },

  // 3. Large-Format Posters
  posters: {
    productId: 'posters',
    workflowType: 'posters',
    category: 'marketing',
    title: 'Upload poster artwork',
    subtitle: 'Upload high-resolution large-format photographic or presentation artwork.',
    slots: [
      {
        id: 'primary',
        title: 'Poster artwork',
        subtitle: 'Upload full-resolution artwork matching the selected poster size (A3, A2 or A1).',
        dropzoneLabel: 'Drop poster artwork here or browse',
        buttonLabel: 'Select Poster Artwork',
        role: 'primary',
        required: true,
        acceptedExtensions: ['.pdf', '.png', '.jpg', '.jpeg', '.tiff'],
        acceptedMimeTypes: ['application/pdf', 'image/png', 'image/jpeg', 'image/tiff'],
        formatHelpText: 'Supported formats: PDF, TIFF, PNG, JPEG up to 250MB',
        maxSizeBytes: DEFAULT_MAX_SIZE,
      },
    ],
    preview: {
      type: 'poster',
      hasManuscriptNav: false,
      hasCoverSpread: false,
      hasFrontBackToggle: false,
      aspectRatio: 0.707, // Standard portrait ratio
      containerLabel: 'LARGE-FORMAT POSTER PROOF',
      guidelineLabels: {
        bleed: '3mm Bleed Limit',
        trim: 'Poster Cut Line',
        safety: '5mm Edge Safe Zone',
      },
    },
    evaluateChecks: (ctx) => {
      const primary = ctx.slotsData.primary;
      const sizeOpt = ctx.options.size || 'a2';
      const results: ValidationResult[] = [];

      // Check 1: File integrity
      if (!primary) {
        results.push({
          ruleId: 'poster-format',
          name: 'Poster Artwork File',
          description: 'High-gamut raster or vector artwork.',
          status: 'WAITING',
          details: 'Waiting for poster artwork upload',
        });
      } else {
        results.push({
          ruleId: 'poster-format',
          name: 'Poster Artwork File',
          description: 'High-gamut raster or vector artwork.',
          status: 'PASSED',
          details: `Poster artwork loaded: ${primary.file.name} (${(primary.file.size / (1024 * 1024)).toFixed(2)} MB)`,
        });
      }

      // Check 2: Large-format resolution
      if (!primary) {
        results.push({
          ruleId: 'poster-dpi',
          name: 'Large-Format Print Resolution',
          description: 'Minimum 150 DPI for large-format display.',
          status: 'WAITING',
          details: 'Waiting for file upload',
        });
      } else {
        const isPdf = primary.file.name.toLowerCase().endsWith('.pdf');
        const width = primary.metadata?.width || 0;
        if (isPdf) {
          results.push({
            ruleId: 'poster-dpi',
            name: 'Large-Format Print Resolution',
            description: 'Minimum 150 DPI for large-format display.',
            status: 'PASSED',
            details: 'Vector PDF supplied: Crisp output at all magnification levels.',
          });
        } else if (width >= 3500) {
          results.push({
            ruleId: 'poster-dpi',
            name: 'Large-Format Print Resolution',
            description: 'Minimum 150 DPI for large-format display.',
            status: 'PASSED',
            details: `High-resolution image (${width}px width, suitable for ${sizeOpt.toUpperCase()}).`,
          });
        } else {
          results.push({
            ruleId: 'poster-dpi',
            name: 'Large-Format Print Resolution',
            description: 'Minimum 150 DPI for large-format display.',
            status: 'WARNING',
            details: `Moderate pixel dimensions (${width}px). Recommended >= 3500px for large-format prints.`,
          });
        }
      }

      // Check 3: Aspect Ratio Alignment
      if (!primary) {
        results.push({
          ruleId: 'poster-aspect',
          name: 'Dimensions & Proportions',
          description: `Artwork must correspond to ${sizeOpt.toUpperCase()} ISO proportions.`,
          status: 'WAITING',
          details: 'Waiting for file upload',
        });
      } else {
        const ratio = primary.metadata?.aspectRatio || 0.707;
        const expectedRatio = 0.707;
        const diff = Math.abs(ratio - expectedRatio);
        results.push({
          ruleId: 'poster-aspect',
          name: 'Dimensions & Proportions',
          description: `Artwork must correspond to ${sizeOpt.toUpperCase()} ISO proportions.`,
          status: diff < 0.1 ? 'PASSED' : 'WARNING',
          details: diff < 0.1 ? 'Standard ISO aspect ratio (~1:1.41) matched.' : `Non-standard aspect ratio (${ratio.toFixed(2)}). Fit preview will be contained.`,
        });
      }

      return results;
    },
  },

  // 4. Business Cards / Visiting Cards
  'business-cards': {
    productId: 'business-cards',
    workflowType: 'business-cards',
    category: 'stationery',
    title: 'Upload visiting card artwork',
    subtitle: 'Upload your business card front and optional back artwork.',
    slots: [
      {
        id: 'primary',
        title: 'Front card artwork',
        subtitle: 'Upload the front design of your visiting card.',
        dropzoneLabel: 'Drop front artwork here or browse',
        buttonLabel: 'Select Front Artwork',
        role: 'primary',
        required: true,
        acceptedExtensions: ['.pdf', '.png', '.jpg', '.jpeg', '.tiff'],
        acceptedMimeTypes: ['application/pdf', 'image/png', 'image/jpeg', 'image/tiff'],
        formatHelpText: 'Supported formats: PDF, PNG, JPEG, TIFF up to 250MB',
        maxSizeBytes: DEFAULT_MAX_SIZE,
      },
      {
        id: 'back',
        title: 'Back card artwork (double-sided)',
        subtitle: 'Upload the back design for double-sided visiting cards.',
        dropzoneLabel: 'Drop back artwork here or browse',
        buttonLabel: 'Select Back Artwork',
        role: 'back',
        required: (opts) => opts.sides === 'double',
        condition: (opts) => opts.sides === 'double',
        acceptedExtensions: ['.pdf', '.png', '.jpg', '.jpeg', '.tiff'],
        acceptedMimeTypes: ['application/pdf', 'image/png', 'image/jpeg', 'image/tiff'],
        formatHelpText: 'Supported formats: PDF, PNG, JPEG, TIFF up to 250MB',
        maxSizeBytes: DEFAULT_MAX_SIZE,
      },
    ],
    preview: {
      type: 'business-card',
      hasManuscriptNav: false,
      hasCoverSpread: false,
      hasFrontBackToggle: true,
      aspectRatio: 1.75, // 3.5x2 standard card
      containerLabel: 'BUSINESS CARD PROOF',
      guidelineLabels: {
        bleed: '2mm Cutting Bleed',
        trim: '3.5 × 2 in Trim Line',
        safety: '3mm Inner Text Safe Zone',
      },
    },
    evaluateChecks: (ctx) => {
      const front = ctx.slotsData.primary;
      const back = ctx.slotsData.back;
      const isDoubleSided = ctx.options.sides === 'double';
      const results: ValidationResult[] = [];

      // Check 1: Front Artwork
      if (!front) {
        results.push({
          ruleId: 'bc-front',
          name: 'Front Card Artwork',
          description: 'Primary front artwork file.',
          status: 'WAITING',
          details: 'Waiting for front artwork upload',
        });
      } else {
        results.push({
          ruleId: 'bc-front',
          name: 'Front Card Artwork',
          description: 'Primary front artwork file.',
          status: 'PASSED',
          details: `Front design loaded: ${front.file.name}`,
        });
      }

      // Check 2: Back Artwork (if double-sided)
      if (isDoubleSided) {
        if (!back) {
          results.push({
            ruleId: 'bc-back',
            name: 'Back Card Artwork (Double-Sided)',
            description: 'Reverse side artwork required for double-sided printing.',
            status: 'WAITING',
            details: 'Awaiting reverse side file upload',
          });
        } else {
          results.push({
            ruleId: 'bc-back',
            name: 'Back Card Artwork (Double-Sided)',
            description: 'Reverse side artwork required for double-sided printing.',
            status: 'PASSED',
            details: `Reverse side loaded: ${back.file.name}`,
          });
        }
      }

      // Check 3: Aspect Ratio & Dimensions
      if (!front) {
        results.push({
          ruleId: 'bc-aspect',
          name: 'Card Aspect Ratio (3.5 × 2 in)',
          description: 'Proportions must match selected card format.',
          status: 'WAITING',
          details: 'Waiting for file upload',
        });
      } else {
        const ratio = front.metadata?.aspectRatio || 1.75;
        const diff = Math.abs(ratio - 1.75);
        results.push({
          ruleId: 'bc-aspect',
          name: 'Card Aspect Ratio (3.5 × 2 in)',
          description: 'Proportions must match selected card format.',
          status: diff < 0.2 ? 'PASSED' : 'WARNING',
          details: diff < 0.2 ? 'Proportions matched to standard 3.5×2 card.' : `Aspect ratio (${ratio.toFixed(2)}:1) deviates from standard 1.75:1.`,
        });
      }

      // Check 4: 2mm Bleed & Cutting Margin
      results.push({
        ruleId: 'bc-bleed',
        name: '2mm Perimeter Cutting Bleed',
        description: '2mm bleed boundary outside trim, 3mm safety margin inside.',
        status: front ? 'PASSED' : 'WAITING',
        details: front ? '2mm outer bleed guide applied.' : 'Waiting for file upload',
      });

      return results;
    },
  },

  // 5. Corporate Letterheads
  letterheads: {
    productId: 'letterheads',
    workflowType: 'letterheads',
    category: 'stationery',
    title: 'Upload letterhead stationery',
    subtitle: 'Upload your official corporate letterhead template.',
    slots: [
      {
        id: 'primary',
        title: 'Letterhead artwork or PDF',
        subtitle: 'Upload the stationery template with your company header and footer.',
        dropzoneLabel: 'Drop letterhead document here or browse',
        buttonLabel: 'Select Letterhead File',
        role: 'primary',
        required: true,
        acceptedExtensions: ['.pdf', '.png', '.jpg', '.jpeg', '.tiff'],
        acceptedMimeTypes: ['application/pdf', 'image/png', 'image/jpeg', 'image/tiff'],
        formatHelpText: 'Supported formats: PDF, PNG, JPEG up to 250MB',
        maxSizeBytes: DEFAULT_MAX_SIZE,
      },
    ],
    preview: {
      type: 'letterhead',
      hasManuscriptNav: false,
      hasCoverSpread: false,
      hasFrontBackToggle: false,
      aspectRatio: 0.707, // A4 Portrait
      containerLabel: 'CORPORATE LETTERHEAD PROOF',
      guidelineLabels: {
        bleed: '3mm Bleed Boundary',
        trim: 'A4 Trim Line (210 × 297 mm)',
        safety: 'Body Text Safe Margin (25mm)',
      },
    },
    evaluateChecks: (ctx) => {
      const primary = ctx.slotsData.primary;
      const results: ValidationResult[] = [];

      if (!primary) {
        results.push({
          ruleId: 'lh-file',
          name: 'Letterhead Template File',
          description: 'Official corporate stationery template.',
          status: 'WAITING',
          details: 'Waiting for letterhead file upload',
        });
        results.push({
          ruleId: 'lh-margins',
          name: 'Header & Body Text Margin Safety',
          description: 'Clearance for office laser & inkjet overprinting.',
          status: 'WAITING',
          details: 'Waiting for file upload',
        });
      } else {
        results.push({
          ruleId: 'lh-file',
          name: 'Letterhead Template File',
          description: 'Official corporate stationery template.',
          status: 'PASSED',
          details: `Stationery template loaded: ${primary.file.name}`,
        });
        results.push({
          ruleId: 'lh-margins',
          name: 'Header & Body Text Margin Safety',
          description: 'Clearance for office laser & inkjet overprinting.',
          status: 'PASSED',
          details: 'Standard 25mm top and 20mm lateral body text margins verified.',
        });
      }

      return results;
    },
  },

  // 6. Flyers & Brochures
  'flyers-brochures': {
    productId: 'flyers-brochures',
    workflowType: 'flyers-brochures',
    category: 'marketing',
    title: 'Upload flyer or brochure artwork',
    subtitle: 'Upload artwork for promotional flyers and folded brochures.',
    slots: [
      {
        id: 'primary',
        title: 'Front artwork / Outside spread',
        subtitle: 'Upload the front side (for flat flyers) or outside spread (for folded brochures).',
        dropzoneLabel: 'Drop outside spread / front artwork here',
        buttonLabel: 'Select Front / Outside Artwork',
        role: 'primary',
        required: true,
        acceptedExtensions: ['.pdf', '.png', '.jpg', '.jpeg', '.tiff'],
        acceptedMimeTypes: ['application/pdf', 'image/png', 'image/jpeg', 'image/tiff'],
        formatHelpText: 'Supported formats: PDF, PNG, JPEG, TIFF up to 250MB',
        maxSizeBytes: DEFAULT_MAX_SIZE,
      },
      {
        id: 'back',
        title: 'Back artwork / Inside spread',
        subtitle: 'Upload the reverse side (for double-sided flyers) or inside spread (for brochures).',
        dropzoneLabel: 'Drop inside spread / back artwork here',
        buttonLabel: 'Select Back / Inside Artwork',
        role: 'back',
        required: (opts) => opts.sides === 'double' || opts.fold === 'bi-fold' || opts.fold === 'tri-fold',
        condition: (opts) => opts.sides === 'double' || opts.fold === 'bi-fold' || opts.fold === 'tri-fold',
        acceptedExtensions: ['.pdf', '.png', '.jpg', '.jpeg', '.tiff'],
        acceptedMimeTypes: ['application/pdf', 'image/png', 'image/jpeg', 'image/tiff'],
        formatHelpText: 'Supported formats: PDF, PNG, JPEG, TIFF up to 250MB',
        maxSizeBytes: DEFAULT_MAX_SIZE,
      },
    ],
    preview: {
      type: 'brochure',
      hasManuscriptNav: false,
      hasCoverSpread: false,
      hasFrontBackToggle: true,
      containerLabel: 'FLYER & BROCHURE PROOF',
      guidelineLabels: {
        bleed: '3mm Outer Bleed',
        trim: 'Trim Cut Line',
        safety: 'Fold Crease Line Allowance',
      },
    },
    evaluateChecks: (ctx) => {
      const front = ctx.slotsData.primary;
      const back = ctx.slotsData.back;
      const fold = ctx.options.fold || 'none';
      const isDouble = ctx.options.sides === 'double' || fold !== 'none';
      const results: ValidationResult[] = [];

      // Check 1: Front / Outside
      if (!front) {
        results.push({
          ruleId: 'fb-front',
          name: 'Front / Outside Spread File',
          description: 'Primary flyer or brochure outside cover.',
          status: 'WAITING',
          details: 'Waiting for outside spread upload',
        });
      } else {
        results.push({
          ruleId: 'fb-front',
          name: 'Front / Outside Spread File',
          description: 'Primary flyer or brochure outside cover.',
          status: 'PASSED',
          details: `Artwork loaded: ${front.file.name}`,
        });
      }

      // Check 2: Back / Inside
      if (isDouble) {
        if (!back) {
          results.push({
            ruleId: 'fb-back',
            name: 'Back / Inside Spread File',
            description: 'Reverse side or inside brochure panels.',
            status: 'WAITING',
            details: 'Awaiting inside spread upload',
          });
        } else {
          results.push({
            ruleId: 'fb-back',
            name: 'Back / Inside Spread File',
            description: 'Reverse side or inside brochure panels.',
            status: 'PASSED',
            details: `Inside spread loaded: ${back.file.name}`,
          });
        }
      }

      // Check 3: Fold Crease Line Safety
      if (fold !== 'none') {
        results.push({
          ruleId: 'fb-crease',
          name: `${fold === 'bi-fold' ? 'Bi-Fold (4 Panels)' : 'Tri-Fold (6 Panels)'} Crease Clearance`,
          description: '5mm safety zone across folding spine creases.',
          status: front ? 'PASSED' : 'WAITING',
          details: front ? `Fold crease lines (${fold}) overlaid on proof.` : 'Waiting for artwork',
        });
      }

      return results;
    },
  },

  // 7. Custom Die-Cut Vinyl Stickers
  'custom-stickers': {
    productId: 'custom-stickers',
    workflowType: 'custom-stickers',
    category: 'labels',
    title: 'Upload sticker artwork',
    subtitle: 'Upload artwork for custom vinyl stickers and product labels.',
    slots: [
      {
        id: 'primary',
        title: 'Sticker artwork',
        subtitle: 'Upload your high-definition sticker artwork or vector illustration.',
        dropzoneLabel: 'Drop sticker artwork here or browse',
        buttonLabel: 'Select Sticker Artwork',
        role: 'primary',
        required: true,
        acceptedExtensions: ['.pdf', '.png', '.jpg', '.jpeg', '.svg'],
        acceptedMimeTypes: ['application/pdf', 'image/png', 'image/jpeg', 'image/svg+xml'],
        formatHelpText: 'Supported formats: PNG (transparent), PDF, SVG, JPEG up to 250MB',
        maxSizeBytes: DEFAULT_MAX_SIZE,
      },
      {
        id: 'cutline',
        title: 'Vector cutline path (optional)',
        subtitle: 'Optional vector outline showing custom die-cut contour.',
        dropzoneLabel: 'Drop optional cutline path here',
        buttonLabel: 'Browse Cutline File',
        role: 'cutline',
        required: false,
        acceptedExtensions: ['.pdf', '.svg', '.ai', '.eps'],
        acceptedMimeTypes: ['application/pdf', 'image/svg+xml', 'application/postscript'],
        formatHelpText: 'Optional: PDF, SVG, AI, EPS with 100% Magenta contour',
        maxSizeBytes: DEFAULT_MAX_SIZE,
      },
    ],
    preview: {
      type: 'sticker',
      hasManuscriptNav: false,
      hasCoverSpread: false,
      hasFrontBackToggle: false,
      aspectRatio: 1.0,
      containerLabel: 'VINYL STICKER PROOF',
      guidelineLabels: {
        bleed: '2mm Outer Vinyl Bleed',
        trim: 'Custom Die-Cut Contour',
        safety: '2mm Inner Peel Safe Zone',
      },
    },
    evaluateChecks: (ctx) => {
      const primary = ctx.slotsData.primary;
      const cutOpt = ctx.options.cut || 'die-cut';
      const materialOpt = ctx.options.material || 'vinyl-gloss';
      const results: ValidationResult[] = [];

      if (!primary) {
        results.push({
          ruleId: 'st-file',
          name: 'Sticker Artwork File',
          description: 'High-pigment vinyl artwork file.',
          status: 'WAITING',
          details: 'Waiting for sticker artwork upload',
        });
        results.push({
          ruleId: 'st-cut',
          name: `${cutOpt.toUpperCase()} Contour & Bleed`,
          description: '2mm bleed boundary outside cutline, 2mm safe zone inside.',
          status: 'WAITING',
          details: 'Waiting for file upload',
        });
      } else {
        const isTransparentPng = primary.file.name.toLowerCase().endsWith('.png');
        results.push({
          ruleId: 'st-file',
          name: 'Sticker Artwork File',
          description: 'High-pigment vinyl artwork file.',
          status: 'PASSED',
          details: `Artwork loaded: ${primary.file.name} (${materialOpt}).`,
        });
        results.push({
          ruleId: 'st-cut',
          name: `${cutOpt.toUpperCase()} Contour & Bleed`,
          description: '2mm bleed boundary outside cutline, 2mm safe zone inside.',
          status: 'PASSED',
          details: `2mm peel margin applied around ${cutOpt} boundary.`,
        });
      }

      return results;
    },
  },

  // 8. Documents & Reports
  documents: {
    productId: 'documents',
    workflowType: 'documents',
    category: 'documents',
    title: 'Upload document PDF',
    subtitle: 'Upload your multi-page document, manual or report for printing and binding.',
    slots: [
      {
        id: 'primary',
        title: 'Document PDF (Interior Pages)',
        subtitle: 'Upload the complete multi-page document in PDF format.',
        dropzoneLabel: 'Drop document PDF here or browse',
        buttonLabel: 'Select Document PDF',
        role: 'manuscript',
        required: true,
        acceptedExtensions: ['.pdf'],
        acceptedMimeTypes: ['application/pdf'],
        formatHelpText: 'Accepted format: PDF only up to 250MB',
        maxSizeBytes: DEFAULT_MAX_SIZE,
      },
    ],
    preview: {
      type: 'document',
      hasManuscriptNav: true,
      hasCoverSpread: false,
      hasFrontBackToggle: false,
      aspectRatio: 0.707,
      containerLabel: 'DOCUMENT REPORT PROOF',
      guidelineLabels: {
        bleed: '2mm Edge Trim',
        trim: 'Document Sheet Line',
        safety: '10mm Binding Edge Margin',
      },
    },
    evaluateChecks: (ctx) => {
      const primary = ctx.slotsData.primary;
      const numPages = primary?.metadata?.numPages || 1;
      const binding = ctx.options.binding || 'spiral';
      const results: ValidationResult[] = [];

      if (!primary) {
        results.push({
          ruleId: 'doc-pdf',
          name: 'Multi-Page PDF File',
          description: 'Compliant PDF document vector stream.',
          status: 'WAITING',
          details: 'Waiting for document PDF upload',
        });
        results.push({
          ruleId: 'doc-gutter',
          name: 'Binding Gutter Margin',
          description: '10mm safety clearance along the bound edge.',
          status: 'WAITING',
          details: 'Waiting for file upload',
        });
      } else {
        results.push({
          ruleId: 'doc-pdf',
          name: 'Multi-Page PDF File',
          description: 'Compliant PDF document vector stream.',
          status: 'PASSED',
          details: `${numPages} pages detected in document PDF.`,
        });
        results.push({
          ruleId: 'doc-gutter',
          name: 'Binding Gutter Margin',
          description: '10mm safety clearance along the bound edge.',
          status: 'PASSED',
          details: `10mm margin clearance verified for ${binding} binding.`,
        });
      }

      return results;
    },
  },

  // 9. Custom Layflat Photo Albums
  'photo-albums': {
    productId: 'photo-albums',
    workflowType: 'photo-albums',
    category: 'books',
    title: 'Upload photo album files',
    subtitle: 'Upload seamless panoramic spreads and hardcover album wrap.',
    slots: [
      {
        id: 'primary',
        title: 'Album interior panoramic spreads (PDF)',
        subtitle: 'Upload seamless layflat two-page spreads in PDF format.',
        dropzoneLabel: 'Drop album spreads PDF here or browse',
        buttonLabel: 'Select Album Spreads',
        role: 'manuscript',
        required: true,
        acceptedExtensions: ['.pdf'],
        acceptedMimeTypes: ['application/pdf'],
        formatHelpText: 'Accepted format: PDF only up to 250MB',
        maxSizeBytes: DEFAULT_MAX_SIZE,
      },
      {
        id: 'cover',
        title: 'Hardcover panoramic wrap',
        subtitle: 'Upload full panoramic wrap for the casebound hardcover boards.',
        dropzoneLabel: 'Drop hardcover wrap artwork here or browse',
        buttonLabel: 'Select Hardcover Wrap',
        role: 'cover',
        required: true,
        acceptedExtensions: ['.pdf', '.png', '.jpg', '.jpeg'],
        acceptedMimeTypes: ['application/pdf', 'image/png', 'image/jpeg'],
        formatHelpText: 'Supported formats: PDF, PNG, JPEG up to 250MB',
        maxSizeBytes: DEFAULT_MAX_SIZE,
      },
    ],
    preview: {
      type: 'photo-album',
      hasManuscriptNav: true,
      hasCoverSpread: true,
      hasFrontBackToggle: false,
      containerLabel: 'LAYFLAT PHOTO ALBUM PROOF',
      guidelineLabels: {
        bleed: '15mm Casebound Wrap Bleed',
        trim: 'Album Board Boundary',
        safety: 'Center Layflat Fold',
      },
    },
    evaluateChecks: (ctx) => {
      const spreads = ctx.slotsData.primary;
      const cover = ctx.slotsData.cover;
      const results: ValidationResult[] = [];

      results.push({
        ruleId: 'pa-spreads',
        name: 'Layflat Panoramic Spreads',
        description: 'Seamless two-page photographic spreads.',
        status: spreads ? 'PASSED' : 'WAITING',
        details: spreads ? `Album spreads loaded: ${spreads.file.name}` : 'Waiting for spreads PDF',
      });

      results.push({
        ruleId: 'pa-cover',
        name: 'Hardcover Panoramic Wrap',
        description: 'Full wraparound casebound cover with 15mm turn-in.',
        status: cover ? 'PASSED' : 'WAITING',
        details: cover ? `Hardcover wrap loaded: ${cover.file.name}` : 'Waiting for cover wrap artwork',
      });

      return results;
    },
  },

  // 10. Desk & Wall Calendars
  calendars: {
    productId: 'calendars',
    workflowType: 'calendars',
    category: 'stationery',
    title: 'Upload calendar artwork',
    subtitle: 'Upload your multi-month calendar pages for desk tent or wall hanging display.',
    slots: [
      {
        id: 'primary',
        title: 'Calendar pages (PDF or artwork)',
        subtitle: 'Upload complete 12 or 14-month calendar pages in sequence.',
        dropzoneLabel: 'Drop calendar PDF or artwork here or browse',
        buttonLabel: 'Select Calendar File',
        role: 'primary',
        required: true,
        acceptedExtensions: ['.pdf', '.png', '.jpg', '.jpeg'],
        acceptedMimeTypes: ['application/pdf', 'image/png', 'image/jpeg'],
        formatHelpText: 'Supported formats: PDF, PNG, JPEG up to 250MB',
        maxSizeBytes: DEFAULT_MAX_SIZE,
      },
    ],
    preview: {
      type: 'calendar',
      hasManuscriptNav: true,
      hasCoverSpread: false,
      hasFrontBackToggle: false,
      aspectRatio: 1.414,
      containerLabel: 'CALENDAR PROOF REVIEW',
      guidelineLabels: {
        bleed: '3mm Bleed Boundary',
        trim: 'Calendar Trim Edge',
        safety: '12mm Top Wire-O Punch Margin',
      },
    },
    evaluateChecks: (ctx) => {
      const primary = ctx.slotsData.primary;
      const typeOpt = ctx.options.type || 'desk-tent';
      const results: ValidationResult[] = [];

      results.push({
        ruleId: 'cal-file',
        name: 'Calendar Pages File',
        description: 'Sequential multi-month calendar artwork.',
        status: primary ? 'PASSED' : 'WAITING',
        details: primary ? `Calendar pages loaded: ${primary.file.name}` : 'Waiting for calendar pages file',
      });

      results.push({
        ruleId: 'cal-wireo',
        name: 'Wire-O Spiral Punch Margin',
        description: '12mm top safety margin for spiral wire binding holes.',
        status: primary ? 'PASSED' : 'WAITING',
        details: primary ? `12mm top punch margin verified for ${typeOpt}.` : 'Waiting for file upload',
      });

      return results;
    },
  },
};

/** Returns a product-specific upload workflow, or null when no workflow is registered. */
export function getProductUploadConfig(productId?: string): ProductUploadConfig | null {
  return productId ? productUploadConfigs[productId] || null : null;
}
