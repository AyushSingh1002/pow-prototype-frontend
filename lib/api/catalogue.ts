import { Product, PrintOption } from '../../types/api.types';
import { getApiBase, handleResponse } from './client';

/** Fetch catalogue products */
export async function fetchProducts(
  category?: string
): Promise<{ data: Product[]; total: number }> {
  const url = new URL(
    `${getApiBase()}/api/products`,
    typeof window !== 'undefined' ? window.location.origin : 'http://127.0.0.1:5000'
  );
  if (category && category !== 'All') {
    url.searchParams.set('category', category.toLowerCase());
  }
  url.searchParams.set('pageSize', '50');

  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
  });
  return handleResponse<{ data: Product[]; total: number }>(res);
}

/** Fetch print options for a specific product */
export async function fetchPrintOptions(productId: string): Promise<PrintOption[]> {
  const url = new URL(
    `${getApiBase()}/api/print-options`,
    typeof window !== 'undefined' ? window.location.origin : 'http://127.0.0.1:5000'
  );
  url.searchParams.set('productId', productId);

  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
  });
  const data = await handleResponse<{ data: PrintOption[] }>(res);
  return data.data;
}
