import { DemoCheckoutResponse } from '../../types/api.types';
import { getApiBase, handleResponse } from './client';

/** Process demo checkout ($0 charged, instant simulated confirmation) */
export async function processDemoCheckout(payload: {
  orderId: string;
  paymentMethod: 'demo_card' | 'demo_upi' | 'demo_netbanking';
}): Promise<DemoCheckoutResponse> {
  const res = await fetch(`${getApiBase()}/api/demo/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return handleResponse<DemoCheckoutResponse>(res);
}
