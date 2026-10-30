/**
 * Press & Proof - API & Data Contract Types
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
  sampleStartingPrice: number; // in paise (100 paise = 1 INR)
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
  total: number; // in paise
  currency: string;
  createdAt: string;
  updatedAt: string;
  taxAmount?: number;
  shippingAmount?: number;
  contact?: {
    name: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
  };
  paymentOrderId?: string;
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
  quote: Pick<QuoteResponse, 'lineItems' | 'total' | 'currency' | 'taxIncluded' | 'shippingIncluded'>;
}

export interface UploadMetadataResponse {
  fileId: string;
  uploadUrl: string;
  status: string;
  maxBytes: number;
  allowedMimeTypes: string[];
  isDemo: boolean;
  preflight?: {
    pageCount: number;
    minimumDpi: number;
    bleedVerified: boolean;
  };
}

export interface DemoCheckoutResponse {
  transactionId: string;
  orderId: string;
  status: 'DEMO_SUCCESS';
  amountCharged: 0;
  isDemo: true;
  message: string;
  timestamp: string;
}

export interface PaymentOrderResponse {
  paymentOrderId: string;
  keyId: string;
  amount: number;
  currency: string;
  orderId: string;
}

export interface ProductionOrderResponse {
  id: string;
  status: string;
  total: number;
  currency: string;
  lineItems: Array<{ code: string; amount: number }>;
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
