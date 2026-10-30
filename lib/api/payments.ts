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

export async function verifyRazorpayCheckout(
  orderId: string,
  paymentOrderId: string,
  paymentId: string,
  signature: string,
  token: string,
): Promise<{ status: 'verified' }> {
  const response = await fetch(`${getApiBase()}/api/payments/verify`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      orderId,
      paymentOrderId,
      paymentId,
      signature,
    }),
  });
  return handleResponse<{ status: 'verified' }>(response);
}
