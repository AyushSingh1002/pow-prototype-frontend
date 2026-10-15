import { ArtworkLayoutType } from '../lib/coverSpread';
import { UploadedSlotData } from '../lib/productUploadConfig';
import {
  Product,
  QuoteResponse,
  UploadMetadataResponse,
  DemoCheckoutResponse,
  BackendHealthResponse,
} from './api.types';

export type StorefrontPage =
  | 'home'
  | 'catalogue'
  | 'configurator'
  | 'upload'
  | 'proof'
  | 'checkout'
  | 'confirmation'
  | 'tracking'
  | 'bulk'
  | 'help';

export interface CoverMetadata {
  width?: number;
  height?: number;
  aspectRatio?: number;
  detectedLayout?: ArtworkLayoutType;
  numPages?: number;
}

export interface BackendHealthState {
  connected: boolean;
  version?: string;
}

export type PaymentMethod = 'demo_upi' | 'demo_card' | 'demo_netbanking';
