/**
 * PDF & Artwork Preview Utility
 * Renders the first page of a PDF file to a canvas and data URL,
 * or creates an object URL for image files. Also measures dimensions and
 * auto-detects cover layout (full-wrap vs front-only).
 */

import { detectArtworkLayout, ArtworkLayoutType } from './coverSpread';

export interface RenderResult {
  previewUrl: string;
  numPages: number;
  isObjectUrl?: boolean;
  width?: number;
  height?: number;
  aspectRatio?: number;
  detectedLayout?: ArtworkLayoutType;
}

export async function generateArtworkPreview(file: File, pageNumber = 1): Promise<RenderResult> {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();

  // If it's an image file (PNG, JPEG, WebP, etc.)
  if (
    fileType.startsWith('image/') ||
    fileName.endsWith('.png') ||
    fileName.endsWith('.jpg') ||
    fileName.endsWith('.jpeg') ||
    fileName.endsWith('.webp')
  ) {
    const objectUrl = URL.createObjectURL(file);
    let width = 0;
    let height = 0;

    if (typeof window !== 'undefined') {
      try {
        if ('createImageBitmap' in window) {
          const bitmap = await createImageBitmap(file);
          width = bitmap.width;
          height = bitmap.height;
          bitmap.close();
        } else {
          await new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => {
              width = img.naturalWidth;
              height = img.naturalHeight;
              resolve();
            };
            img.onerror = () => resolve();
            img.src = objectUrl;
          });
        }
      } catch (e) {
        console.warn('Image dimensions read warning:', e);
      }
    }

    const { layout, aspectRatio } = detectArtworkLayout(width, height, 1);

    return {
      previewUrl: objectUrl,
      numPages: 1,
      isObjectUrl: true,
      width,
      height,
      aspectRatio,
      detectedLayout: layout,
    };
  }

  // If it's a PDF file
  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    if (typeof window === 'undefined') {
      return { previewUrl: '', numPages: 1, width: 0, height: 0, aspectRatio: 1, detectedLayout: 'unknown' };
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
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

      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages || 1;
      const page = await pdf.getPage(Math.min(Math.max(pageNumber, 1), numPages));
      const nativeViewport = page.getViewport({ scale: 1.0 });
      const width = nativeViewport.width;
      const height = nativeViewport.height;

      // Render at 1.5x scale for preview
      const renderViewport = page.getViewport({ scale: 1.5 });

      const canvas = document.createElement('canvas');
      canvas.width = Math.floor(renderViewport.width);
      canvas.height = Math.floor(renderViewport.height);
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas 2D context unavailable');
      }

      await page.render({
        canvasContext: ctx as any,
        canvas: canvas as any,
        viewport: renderViewport,
      } as any).promise;

      const dataUrl = canvas.toDataURL('image/png');
      const { layout, aspectRatio } = detectArtworkLayout(width, height, numPages);

      return {
        previewUrl: dataUrl,
        numPages,
        isObjectUrl: false,
        width,
        height,
        aspectRatio,
        detectedLayout: layout,
      };
    } catch (err: any) {
      console.warn('PDF first-page rendering warning:', err);
      const fallbackUrl = URL.createObjectURL(file);
      return {
        previewUrl: fallbackUrl,
        numPages: 1,
        isObjectUrl: true,
        width: 0,
        height: 0,
        aspectRatio: 1,
        detectedLayout: 'unknown',
      };
    }
  }

  throw new Error(`Unsupported file type: ${file.type || 'unknown'}`);
}
