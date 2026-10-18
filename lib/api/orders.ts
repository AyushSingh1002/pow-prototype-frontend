import { OrderLookupResponse } from '../../types/api.types';
import { getApiBase, handleResponse } from './client';

/** Create a draft order from a validated quote */
export async function createDraftOrder(payload: {
  quoteId: string;
  idempotencyKey?: string;
  token: string;
}): Promise<{ id: string; status: string }> {
  const idempotencyKey =
    payload.idempotencyKey ||
    `idem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const res = await fetch(`${getApiBase()}/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${payload.token}`,
      'Idempotency-Key': idempotencyKey,
      Accept: 'application/json',
    },
    body: JSON.stringify({ quoteId: payload.quoteId }),
  });
  return handleResponse<{ id: string; status: string }>(res);
}

/** Lookup order details and audit status history */
export async function getOrder(
  orderId: string,
  token: string
): Promise<OrderLookupResponse> {
  const res = await fetch(`${getApiBase()}/api/orders/${encodeURIComponent(orderId)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });
  return handleResponse<OrderLookupResponse>(res);
}
