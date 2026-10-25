import { QuoteResponse } from '../../types/api.types';
import { getApiBase, handleResponse } from './client';

/** Generate a server-computed quote (paise integer calculations) */
export async function createQuote(payload: {
  productId: string;
  options: Record<string, string>;
  quantity: number;
  token?: string;
}): Promise<QuoteResponse> {
  const res = await fetch(`${getApiBase()}/api/quotes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(payload.token ? { Authorization: `Bearer ${payload.token}` } : {}),
    },
    body: JSON.stringify({
      productId: payload.productId,
      options: payload.options,
      quantity: payload.quantity,
    }),
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
