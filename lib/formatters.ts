import { Product } from '../types/api.types';

const invalidStartingPriceWarnings = new Set<string>();

export function getProductStartingPrice(product: Product): number | null {
  if (Number.isSafeInteger(product.sampleStartingPrice) && product.sampleStartingPrice >= 0) {
    return product.sampleStartingPrice;
  }
  if (!invalidStartingPriceWarnings.has(product.id)) {
    console.error(`Catalogue data error: product "${product.id}" has no valid server starting price.`);
    invalidStartingPriceWarnings.add(product.id);
  }
  return null;
}

export function formatPriceFromPaise(amountPaise: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amountPaise / 100);
}

/**
 * Format date string into human readable localized format
 */
export function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}
