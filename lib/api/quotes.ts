import { QuoteResponse } from '../../types/api.types';
import { getApiBase, handleResponse } from './client';

/** Generate a server-computed quote (paise integer calculations) */
export async function createQuote(payload: {
  productId: string;
  options: Record<string, string>;
  quantity: number;
}): Promise<QuoteResponse> {
  const res = await fetch(`${getApiBase()}/api/quotes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return handleResponse<QuoteResponse>(res);
}

/** Lookup a quote by UUID */
export async function getQuote(quoteId: string): Promise<QuoteResponse> {
  const res = await fetch(`${getApiBase()}/api/quotes/${encodeURIComponent(quoteId)}`, {
    headers: { Accept: 'application/json' },
  });
  return handleResponse<QuoteResponse>(res);
}
