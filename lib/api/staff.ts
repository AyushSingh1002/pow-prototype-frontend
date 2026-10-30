import { QuoteLineItem } from '../../types';
import { getApiBase, handleResponse } from './client';

export type StaffOrderStatus = 'CONFIRMED' | 'IN_PRODUCTION' | 'COMPLETED';

export interface StaffQueueOrder {
  id: string;
  status: StaffOrderStatus;
  productId: string;
  productName: string;
  quantity: number;
  validatedOptions: Record<string, string>;
  deliveryMethod: 'SHIP' | 'PICKUP';
  confirmedAt: string;
  deadline?: string;
  assignedStaffId?: string;
  assignedStaffName?: string;
}

export interface StaffOrderDetails extends StaffQueueOrder {
  customerId: string;
  contact?: {
    name: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
  };
  artworkFiles: Array<{
    slotId: string;
    signedUrl: string;
    expiresInSeconds: number;
  }>;
  notes: Array<{
    id: string;
    staffName: string;
    note: string;
    customerVisible: boolean;
    createdAt: string;
  }>;
  lineItems: QuoteLineItem[];
  total: number;
}

export interface StaffAccount {
  id: string;
  displayName: string;
  role: 'staff' | 'admin';
}

export interface StaffCustomer {
  id: string;
  displayName: string;
  email: string;
  phone?: string;
}

export interface StaffCustomerQuote {
  id: string;
  productId: string;
  quantity: number;
  validatedOptions: Record<string, string>;
  lineItems: QuoteLineItem[];
  total: number;
  currency: string;
  expiresAt: string;
}

export interface StaffCreatedOrder {
  order: {
    id: string;
    status: 'SUBMITTED';
    total: number;
    currency: string;
  };
  paymentLink: {
    paymentLinkId: string;
    shortUrl: string;
    expiresAt: string;
  };
  emailQueued: true;
}

export interface FailedStaffNotification {
  id: string;
  orderId: string;
  eventType: string;
  lastError: string | null;
}

interface StaffOrderRecord {
  id: string;
  status: StaffOrderStatus;
  assignedStaffId?: string;
  total: number;
}

interface StaffOrdersResponse {
  orders: StaffQueueOrder[];
  failedNotifications: FailedStaffNotification[];
}

async function staffRequest<T>(
  path: string,
  token: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  headers.set('Authorization', `Bearer ${token}`);
  if (init.body) headers.set('Content-Type', 'application/json');
  const response = await fetch(`${getApiBase()}/api/staff${path}`, {
    ...init,
    headers,
    cache: 'no-store',
  });
  return handleResponse<T>(response);
}

export async function getStaffOrders(token: string): Promise<StaffOrdersResponse> {
  return staffRequest<StaffOrdersResponse>('/orders', token);
}

export async function getStaffOrder(
  orderId: string,
  token: string,
): Promise<StaffOrderDetails> {
  const result = await staffRequest<{ order: StaffOrderDetails }>(
    `/orders/${encodeURIComponent(orderId)}`,
    token,
  );
  return result.order;
}

export async function claimStaffOrder(
  orderId: string,
  token: string,
): Promise<StaffOrderRecord> {
  const result = await staffRequest<{ order: StaffOrderRecord }>(
    `/orders/${encodeURIComponent(orderId)}/claim`,
    token,
    { method: 'POST' },
  );
  return result.order;
}

export async function releaseStaffOrder(
  orderId: string,
  token: string,
): Promise<StaffOrderRecord> {
  const result = await staffRequest<{ order: StaffOrderRecord }>(
    `/orders/${encodeURIComponent(orderId)}/release`,
    token,
    { method: 'POST' },
  );
  return result.order;
}

export async function completeStaffOrder(
  orderId: string,
  token: string,
): Promise<StaffOrderRecord> {
  const result = await staffRequest<{ order: StaffOrderRecord }>(
    `/orders/${encodeURIComponent(orderId)}/complete`,
    token,
    { method: 'POST' },
  );
  return result.order;
}

export async function flagStaffOrder(
  orderId: string,
  token: string,
  note: string,
): Promise<void> {
  await staffRequest<{ message: string }>(
    `/orders/${encodeURIComponent(orderId)}/problems`,
    token,
    { method: 'POST', body: JSON.stringify({ note }) },
  );
}

export async function getStaffAccounts(token: string): Promise<StaffAccount[]> {
  const result = await staffRequest<{ staff: StaffAccount[] }>('/accounts', token);
  return result.staff;
}

export async function searchStaffCustomers(
  token: string,
  query: string,
): Promise<StaffCustomer[]> {
  const result = await staffRequest<{ customers: StaffCustomer[] }>(
    `/customers?query=${encodeURIComponent(query)}`,
    token,
  );
  return result.customers;
}

export async function getStaffCustomerQuotes(
  token: string,
  customerId: string,
): Promise<StaffCustomerQuote[]> {
  const result = await staffRequest<{ quotes: StaffCustomerQuote[] }>(
    `/customers/${encodeURIComponent(customerId)}/quotes`,
    token,
  );
  return result.quotes;
}

export async function createStaffOrder(
  token: string,
  payload: {
    customerId: string;
    quoteId: string;
    deliveryMethod: 'SHIP' | 'PICKUP';
    contact?: {
      name: string;
      phone: string;
      address: string;
      city: string;
      pincode: string;
    };
  },
  idempotencyKey: string,
): Promise<StaffCreatedOrder> {
  return staffRequest<StaffCreatedOrder>('/orders', token, {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify(payload),
  });
}

export async function assignStaffOrder(
  orderId: string,
  token: string,
  staffId: string,
): Promise<StaffOrderRecord> {
  const result = await staffRequest<{ order: StaffOrderRecord }>(
    `/orders/${encodeURIComponent(orderId)}/assign`,
    token,
    { method: 'POST', body: JSON.stringify({ staffId }) },
  );
  return result.order;
}

export async function retryStaffNotification(id: string, token: string): Promise<void> {
  await staffRequest<{ status: string }>(
    `/notifications/${encodeURIComponent(id)}/retry`,
    token,
    { method: 'POST' },
  );
}
