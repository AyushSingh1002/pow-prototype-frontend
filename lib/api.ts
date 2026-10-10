/**
 * Press & Proof - API Client for PrintOnWeb Storefront Backend Prototype
 * 
 * Interacts with the backend services:
 * - Catalogue & Print Options
 * - Real-time Server Quote Generation (Integer paise, server-side pricing engine)
 * - File Artwork Metadata Registration (/api/demo/uploads)
 * - Draft Order Lifecycle (/api/orders)
 * - Demo Zero-Dollar Checkout (/api/demo/checkout)
 * - Order Status & Audit Tracking (/api/orders/:id)
 */

export interface ProductOptionChoice {
  value: string;
  label: string;
  description?: string;
}

export interface PrintOption {
  id: string;
  productId: string;
  code: string;
  name: string;
  type: string;
  choices: ProductOptionChoice[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  isActive: boolean;
  minQuantity: number;
  maxQuantity: number;
  sampleStartingPrice: number; // In paise (100 paise = 1 INR)
  currency: string;
  isSample: boolean;
}

export interface QuoteLineItem {
  code: string;
  description: string;
  quantity: number;
  unitAmount: number;
  lineTotal: number;
}

export interface QuoteResponse {
  id: string;
  lineItems: QuoteLineItem[];
  total: number; // in paise
  currency: string;
  expiresAt: string;
  pricingConfigVersion: string;
  isSample: boolean;
  taxIncluded: boolean;
  shippingIncluded: boolean;
}

export interface OrderRecord {
  id: string;
  quoteId: string;
  customerId: string;
  idempotencyKey: string;
  status: string;
  total: number; // paise
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderHistoryItem {
  id: string;
  orderId: string;
  fromStatus: string | null;
  toStatus: string;
  reason: string;
  createdAt: string;
}

export interface OrderLookupResponse {
  order: OrderRecord;
  history: OrderHistoryItem[];
}

export interface UploadMetadataResponse {
  fileId: string;
  uploadUrl: string;
  status: string;
  maxBytes: number;
  allowedMimeTypes: string[];
  isDemo: boolean;
}

export interface DemoCheckoutResponse {
  transactionId: string;
  orderId: string;
  status: "DEMO_SUCCESS";
  amountCharged: 0;
  isDemo: true;
  message: string;
  timestamp: string;
}

export interface BackendHealthResponse {
  status: string;
  pricingConfigVersion: string;
  isSample: boolean;
  timestamp: string;
}

export interface ApiErrorShape {
  error: {
    code: string;
    message: string;
    details?: Array<{ path: string; issue: string }>;
    requestId?: string;
  };
}

const getApiBase = () => {
  // In the browser, relative calls to /api will be routed through Next.js rewrite proxy
  if (typeof window !== "undefined") {
    return "";
  }
  return process.env.BACKEND_INTERNAL_URL || "http://127.0.0.1:5000";
};

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorJson: ApiErrorShape | null = null;
    try {
      errorJson = await res.json();
    } catch {
      // not JSON
    }
    const message = errorJson?.error?.message || `Request failed with status ${res.status}`;
    const code = errorJson?.error?.code || "HTTP_ERROR";
    const error = new Error(message) as Error & { code?: string; details?: any; requestId?: string; status: number };
    error.code = code;
    error.details = errorJson?.error?.details;
    error.requestId = errorJson?.error?.requestId;
    error.status = res.status;
    throw error;
  }
  return res.json();
}

/** Check backend health */
export async function checkBackendHealth(): Promise<BackendHealthResponse> {
  const res = await fetch(`${getApiBase()}/api/health`, {
    cache: "no-store",
  });
  return handleResponse<BackendHealthResponse>(res);
}

/** Fetch catalogue products */
export async function fetchProducts(category?: string): Promise<{ data: Product[]; total: number }> {
  const url = new URL(`${getApiBase()}/api/products`, typeof window !== "undefined" ? window.location.origin : "http://127.0.0.1:5000");
  if (category && category !== "All") {
    url.searchParams.set("category", category.toLowerCase());
  }
  url.searchParams.set("pageSize", "50");

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
  });
  return handleResponse<{ data: Product[]; total: number }>(res);
}

/** Fetch print options for a specific product */
export async function fetchPrintOptions(productId: string): Promise<PrintOption[]> {
  const url = new URL(`${getApiBase()}/api/print-options`, typeof window !== "undefined" ? window.location.origin : "http://127.0.0.1:5000");
  url.searchParams.set("productId", productId);

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
  });
  const data = await handleResponse<{ data: PrintOption[] }>(res);
  return data.data;
}

/** Generate a server-computed quote (paise integer calculations) */
export async function createQuote(payload: {
  productId: string;
  options: Record<string, string>;
  quantity: number;
}): Promise<QuoteResponse> {
  const res = await fetch(`${getApiBase()}/api/quotes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });
  return handleResponse<QuoteResponse>(res);
}

/** Lookup a quote by UUID */
export async function getQuote(quoteId: string): Promise<QuoteResponse> {
  const res = await fetch(`${getApiBase()}/api/quotes/${encodeURIComponent(quoteId)}`, {
    headers: { Accept: "application/json" },
  });
  return handleResponse<QuoteResponse>(res);
}

/** Register artwork upload metadata */
export async function registerArtworkUpload(payload: {
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  quoteId?: string;
  orderId?: string;
}): Promise<UploadMetadataResponse> {
  const res = await fetch(`${getApiBase()}/api/demo/uploads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });
  return handleResponse<UploadMetadataResponse>(res);
}

/** Create a draft order from a validated quote */
export async function createDraftOrder(payload: {
  quoteId: string;
  idempotencyKey?: string;
  token?: string;
}): Promise<{ id: string; status: string }> {
  const idempotencyKey = payload.idempotencyKey || `idem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const token = payload.token || "demo-token";

  const res = await fetch(`${getApiBase()}/api/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "Idempotency-Key": idempotencyKey,
      Accept: "application/json",
    },
    body: JSON.stringify({ quoteId: payload.quoteId }),
  });
  return handleResponse<{ id: string; status: string }>(res);
}

/** Lookup order details and audit status history */
export async function getOrder(orderId: string, token: string = "demo-token"): Promise<OrderLookupResponse> {
  const res = await fetch(`${getApiBase()}/api/orders/${encodeURIComponent(orderId)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
  return handleResponse<OrderLookupResponse>(res);
}

/** Process demo checkout ($0 charged, instant simulated confirmation) */
export async function processDemoCheckout(payload: {
  orderId: string;
  paymentMethod: "demo_card" | "demo_upi" | "demo_netbanking";
}): Promise<DemoCheckoutResponse> {
  const res = await fetch(`${getApiBase()}/api/demo/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });
  return handleResponse<DemoCheckoutResponse>(res);
}
