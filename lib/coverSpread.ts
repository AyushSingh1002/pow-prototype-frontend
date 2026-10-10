/**
 * Cover Spread Geometry and Spine Calculation Engine
 * Calculates full-wrap spread dimensions (Back, Spine, Front + Bleed)
 * based on author's configured book specifications.
 */

export interface CoverSpreadCalculation {
  trimWidthMm: number;
  trimHeightMm: number;
  spineWidthMm: number;
  bleedMm: number;
  totalSpreadWidthMm: number;
  totalSpreadHeightMm: number;
  totalSpreadWithBleedWidthMm: number;
  totalSpreadWithBleedHeightMm: number;
  backWidthPercent: number;
  spineWidthPercent: number;
  frontWidthPercent: number;
  paperStockDescription: string;
  bindingDescription: string;
  trimDescription: string;
  isSpineCalculated: boolean;
  spreadAspectRatio: number;
}

export interface BookSpecInput {
  pageCount: number;
  size?: string;
  paper?: string;
  binding?: string;
}

export function calculateCoverSpreadDimensions(input: BookSpecInput): CoverSpreadCalculation {
  const pageCount = Math.max(1, input.pageCount || 120);
  const size = (input.size || 'a5-portrait').toLowerCase();
  const paper = (input.paper || 'natural-white').toLowerCase();
  const binding = (input.binding || 'paperback').toLowerCase();

  // 1. Determine Trim Size in mm
  let trimWidthMm = 148;
  let trimHeightMm = 210;
  let trimDescription = 'A5 Portrait (148 × 210 mm)';

  if (size.includes('a4') || size === 'a4-portrait') {
    trimWidthMm = 210;
    trimHeightMm = 297;
    trimDescription = 'A4 Portrait (210 × 297 mm)';
  } else if (size.includes('custom') || size.includes('digest')) {
    trimWidthMm = 135;
    trimHeightMm = 216;
    trimDescription = 'Custom Digest (135 × 216 mm)';
  }

  // 2. Paper Caliper per page (in mm)
  let caliper = 0.048; // 80 GSM Natural White
  let paperStockDescription = '80 GSM Natural White (~0.048mm/page)';

  if (paper.includes('art') || paper.includes('matte') || paper.includes('130')) {
    caliper = 0.065;
    paperStockDescription = '130 GSM Art Matte (~0.065mm/page)';
  } else if (paper.includes('bright') || paper.includes('100')) {
    caliper = 0.055;
    paperStockDescription = '100 GSM Bright White (~0.055mm/page)';
  }

  // 3. Binding Cover Bulk & Spine Formula
  let coverAllowance = 0.5; // Paperback cover card
  let minSpine = 2.5;
  let bindingDescription = 'Paperback (Perfect Bound)';
  let isSpineCalculated = true;

  if (binding.includes('hardcover')) {
    coverAllowance = 3.5; // 2x 1.8mm binder boards + hinge
    minSpine = 5.0;
    bindingDescription = 'Hardcover (Casebound, 3.5mm board allowance)';
  } else if (binding.includes('saddle')) {
    coverAllowance = 0.4;
    minSpine = 0.8;
    bindingDescription = 'Saddle Stitch (Folded Wire Spine)';
  } else if (binding.includes('spiral')) {
    coverAllowance = 0;
    minSpine = 0;
    isSpineCalculated = false;
    bindingDescription = 'Spiral / Wiro Bound (Separate Panels)';
  }

  // 4. Calculate Spine Width
  let spineWidthMm = 0;
  if (isSpineCalculated) {
    const rawSpine = pageCount * caliper + coverAllowance;
    spineWidthMm = Math.max(minSpine, Math.round(rawSpine * 10) / 10);
  }

  // 5. Spread Dimensions
  const bleedMm = 3.0; // Standard 3mm commercial outer bleed
  const totalSpreadWidthMm = 2 * trimWidthMm + spineWidthMm;
  const totalSpreadHeightMm = trimHeightMm;

  const totalSpreadWithBleedWidthMm = Math.round((totalSpreadWidthMm + 2 * bleedMm) * 10) / 10;
  const totalSpreadWithBleedHeightMm = Math.round((totalSpreadHeightMm + 2 * bleedMm) * 10) / 10;

  // 6. Proportions across trimmed spread
  const backWidthPercent = (trimWidthMm / totalSpreadWidthMm) * 100;
  const spineWidthPercent = (spineWidthMm / totalSpreadWidthMm) * 100;
  const frontWidthPercent = (trimWidthMm / totalSpreadWidthMm) * 100;

  const spreadAspectRatio = totalSpreadWithBleedWidthMm / totalSpreadWithBleedHeightMm;

  return {
    trimWidthMm,
    trimHeightMm,
    spineWidthMm,
    bleedMm,
    totalSpreadWidthMm,
    totalSpreadHeightMm,
    totalSpreadWithBleedWidthMm,
    totalSpreadWithBleedHeightMm,
    backWidthPercent,
    spineWidthPercent,
    frontWidthPercent,
    paperStockDescription,
    bindingDescription,
    trimDescription,
    isSpineCalculated,
    spreadAspectRatio,
  };
}

export type ArtworkLayoutType = 'full-wrap' | 'front-only' | 'multi-page' | 'unknown';

export function detectArtworkLayout(
  width: number,
  height: number,
  numPages = 1
): {
  layout: ArtworkLayoutType;
  aspectRatio: number;
  label: string;
  explanation: string;
} {
  if (numPages > 1) {
    return {
      layout: 'multi-page',
      aspectRatio: width / (height || 1),
      label: `Multi-page PDF (${numPages} pages)`,
      explanation: 'PDF contains multiple pages or separate cover panels.',
    };
  }

  if (!width || !height) {
    return {
      layout: 'unknown',
      aspectRatio: 1,
      label: 'Unknown dimensions',
      explanation: 'Artwork dimensions could not be read.',
    };
  }

  const aspectRatio = width / height;

  // Standard book spreads have aspect ratio ~1.3 to 2.2
  // Standard front covers have aspect ratio ~0.6 to 0.85
  if (aspectRatio >= 1.25) {
    return {
      layout: 'full-wrap',
      aspectRatio,
      label: 'Full Wraparound Spread',
      explanation: `Wide spread format detected (${Math.round(width)} × ${Math.round(height)}px, aspect ratio ${aspectRatio.toFixed(2)}:1).`,
    };
  }

  if (aspectRatio <= 1.05) {
    return {
      layout: 'front-only',
      aspectRatio,
      label: 'Front Cover Only',
      explanation: `Single page portrait format detected (${Math.round(width)} × ${Math.round(height)}px, aspect ratio ${aspectRatio.toFixed(2)}:1). Back cover and spine are not included in this file.`,
    };
  }

  return {
    layout: 'unknown',
    aspectRatio,
    label: 'Custom Aspect Ratio',
    explanation: `Square or non-standard format (${Math.round(width)} × ${Math.round(height)}px, aspect ratio ${aspectRatio.toFixed(2)}:1).`,
  };
}
