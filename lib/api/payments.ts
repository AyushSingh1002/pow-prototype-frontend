import { PaymentOrderResponse } from '../../types/api.types';
import { getApiBase, handleResponse } from './client';

export async function createPaymentOrder(
  orderId: string,
  token: string,
): Promise<PaymentOrderResponse> {
  const response = await fetch(`${getApiBase()}/api/payments/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ orderId }),
  });
  return handleResponse<PaymentOrderResponse>(response);
}
