'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Product,
  QuoteResponse,
  UploadMetadataResponse,
  DemoCheckoutResponse,
  StorefrontPage,
  CoverMetadata,
  BackendHealthState,
} from '../types';
import { checkBackendHealth, fetchProducts } from '../lib/api';
import { fallbackProducts } from '../features/catalog/data/fallbackProducts';
import { ArtworkLayoutType } from '../lib/coverSpread';
import { UploadedSlotData } from '../lib/productUploadConfig';

interface OrderFlowContextType {
  // Navigation & Shell
  page: StorefrontPage;
  navigate: (page: StorefrontPage) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
  backendHealth: BackendHealthState;

  // Catalogue
  products: Product[];
  selectedProductId: string;
  setSelectedProductId: (id: string) => void;
  currentProduct: Product;

  // Active Quote & Configuration
  activeQuote: QuoteResponse | null;
  activeOptions: Record<string, string>;
  activeQuantity: number;
  handleQuoteReady: (
    quote: QuoteResponse,
    product: Product,
    options: Record<string, string>,
    quantity: number
  ) => void;
  setActiveQuote: (quote: QuoteResponse | null) => void;
  setActiveOptions: (options: Record<string, string>) => void;
  setActiveQuantity: (qty: number) => void;

  // Upload & Slots State
  slotsData: Record<string, UploadedSlotData | undefined>;
  interiorFile: File | null;
  interiorUpload: UploadMetadataResponse | null;
  interiorPageCount: number;
  interiorCurrentPage: number;
  coverFile: File | null;
  coverPreviewUrl: string | null;
  isCoverObjectUrl: boolean;
  coverUpload: UploadMetadataResponse | null;
  coverMetadata: CoverMetadata | null;

  // Upload Handlers
  handleInteriorChange: (
    file: File,
    uploadData: UploadMetadataResponse | null,
    pageCount?: number
  ) => void;
  handleInteriorRemove: () => void;
  handleCoverChange: (
    file: File,
    previewUrl: string,
    isObjUrl: boolean,
    uploadData: UploadMetadataResponse | null,
    metadata?: CoverMetadata
  ) => void;
  handleCoverRemove: () => void;
  handleSlotChange: (slotId: string, data: UploadedSlotData) => void;
  handleSlotRemove: (slotId: string) => void;
  setInteriorCurrentPage: (page: number) => void;
  setInteriorPageCount: (count: number) => void;

  // Proof Approval
  proofApproved: boolean;
  setProofApproved: (approved: boolean) => void;

  // Order & Tracking
  lastOrderId: string;
  setLastOrderId: (id: string) => void;
  lastCheckout: DemoCheckoutResponse | null;
  setLastCheckout: (checkout: DemoCheckoutResponse | null) => void;
}

const OrderFlowContext = createContext<OrderFlowContextType | undefined>(undefined);

export function OrderFlowProvider({ children }: { children: ReactNode }) {
  const [page, setPage] = useState<StorefrontPage>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [backendHealth, setBackendHealth] = useState<BackendHealthState>({ connected: false });
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [selectedProductId, setSelectedProductId] = useState<string>('books');

  // Active Quote State
  const [activeQuote, setActiveQuote] = useState<QuoteResponse | null>(null);
  const [activeOptions, setActiveOptions] = useState<Record<string, string>>({});
  const [activeQuantity, setActiveQuantity] = useState<number>(10);

  // Interior Manuscript File State
  const [interiorFile, setInteriorFile] = useState<File | null>(null);
  const [interiorUpload, setInteriorUpload] = useState<UploadMetadataResponse | null>(null);
  const [interiorPageCount, setInteriorPageCount] = useState<number>(12);
  const [interiorCurrentPage, setInteriorCurrentPage] = useState<number>(1);

  // Cover Artwork File State
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [isCoverObjectUrl, setIsCoverObjectUrl] = useState<boolean>(false);
  const [coverUpload, setCoverUpload] = useState<UploadMetadataResponse | null>(null);
  const [coverMetadata, setCoverMetadata] = useState<CoverMetadata | null>(null);

  // Slots Data Dictionary
  const [slotsData, setSlotsData] = useState<Record<string, UploadedSlotData | undefined>>({});

  // Proof Approval State
  const [proofApproved, setProofApproved] = useState<boolean>(false);

  // Last Order and Checkout Result
  const [lastOrderId, setLastOrderId] = useState<string>('');
  const [lastCheckout, setLastCheckout] = useState<DemoCheckoutResponse | null>(null);

  // Load products & backend probe
  useEffect(() => {
    checkBackendHealth()
      .then((h) => {
        setBackendHealth({ connected: true, version: h.pricingConfigVersion });
      })
      .catch((err) => {
        console.warn('Backend probe:', err);
        setBackendHealth({ connected: false });
      });

    fetchProducts()
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setProducts(res.data);
        }
      })
      .catch((err) => {
        console.warn('Using fallback initial products:', err);
      });
  }, []);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (isCoverObjectUrl && coverPreviewUrl) {
        try {
          URL.revokeObjectURL(coverPreviewUrl);
        } catch { }
      }
    };
  }, [isCoverObjectUrl, coverPreviewUrl]);

  const navigate = (nextPage: StorefrontPage) => {
    setPage(nextPage);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleInteriorChange = (
    file: File,
    uploadData: UploadMetadataResponse | null,
    pageCount?: number
  ) => {
    setInteriorFile(file);
    setInteriorUpload(uploadData);
    if (pageCount && pageCount > 0) {
      setInteriorPageCount(pageCount);
    }
    setProofApproved(false);
  };

  const handleInteriorRemove = () => {
    setInteriorFile(null);
    setInteriorUpload(null);
    setInteriorCurrentPage(1);
    setInteriorPageCount(12);
    setProofApproved(false);
  };

  const handleCoverChange = (
    file: File,
    previewUrl: string,
    isObjUrl: boolean,
    uploadData: UploadMetadataResponse | null,
    metadata?: CoverMetadata
  ) => {
    if (isCoverObjectUrl && coverPreviewUrl) {
      try {
        URL.revokeObjectURL(coverPreviewUrl);
      } catch (err) {
        console.warn('Revoke object URL warning:', err);
      }
    }
    setCoverFile(file);
    setCoverPreviewUrl(previewUrl);
    setIsCoverObjectUrl(isObjUrl);
    setCoverUpload(uploadData);
    setCoverMetadata(metadata || null);
    setProofApproved(false);
  };

  const handleCoverRemove = () => {
    if (isCoverObjectUrl && coverPreviewUrl) {
      try {
        URL.revokeObjectURL(coverPreviewUrl);
      } catch (err) {
        console.warn('Revoke object URL warning:', err);
      }
    }
    setCoverFile(null);
    setCoverPreviewUrl(null);
    setIsCoverObjectUrl(false);
    setCoverUpload(null);
    setCoverMetadata(null);
    setProofApproved(false);
  };

  const handleSlotChange = (slotId: string, data: UploadedSlotData) => {
    setSlotsData((prev) => ({ ...prev, [slotId]: data }));
    if (slotId === 'interior' || slotId === 'manuscript') {
      handleInteriorChange(data.file, data.uploadResponse, data.metadata?.numPages);
    } else if (slotId === 'cover') {
      handleCoverChange(
        data.file,
        data.previewUrl,
        data.isObjectUrl,
        data.uploadResponse,
        data.metadata
          ? {
            ...data.metadata,
            detectedLayout: data.metadata.detectedLayout as ArtworkLayoutType | undefined,
          }
          : undefined
      );
    } else if (slotId === 'primary' || slotId === 'front') {
      handleCoverChange(
        data.file,
        data.previewUrl,
        data.isObjectUrl,
        data.uploadResponse,
        data.metadata
          ? {
            ...data.metadata,
            detectedLayout: data.metadata.detectedLayout as ArtworkLayoutType | undefined,
          }
          : undefined
      );
      if (data.file.type === 'application/pdf' || data.file.name.endsWith('.pdf')) {
        handleInteriorChange(data.file, data.uploadResponse, data.metadata?.numPages);
      }
    }
  };

  const handleSlotRemove = (slotId: string) => {
    setSlotsData((prev) => {
      const next = { ...prev };
      delete next[slotId];
      return next;
    });
    if (slotId === 'interior' || slotId === 'manuscript') {
      handleInteriorRemove();
    } else if (slotId === 'cover') {
      handleCoverRemove();
    } else if (slotId === 'primary' || slotId === 'front') {
      handleCoverRemove();
      handleInteriorRemove();
    }
  };

  const handleQuoteReady = (
    quote: QuoteResponse,
    _product: Product,
    options: Record<string, string>,
    quantity: number
  ) => {
    setActiveQuote(quote);
    setActiveOptions(options);
    setActiveQuantity(quantity);
  };

  const currentProduct =
    products.find((p) => p.id === selectedProductId) || products[0] || fallbackProducts[0];

  return (
    <OrderFlowContext.Provider
      value={{
        page,
        navigate,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        backendHealth,
        products,
        selectedProductId,
        setSelectedProductId,
        currentProduct,
        activeQuote,
        activeOptions,
        activeQuantity,
        handleQuoteReady,
        setActiveQuote,
        setActiveOptions,
        setActiveQuantity,
        slotsData,
        interiorFile,
        interiorUpload,
        interiorPageCount,
        interiorCurrentPage,
        coverFile,
        coverPreviewUrl,
        isCoverObjectUrl,
        coverUpload,
        coverMetadata,
        handleInteriorChange,
        handleInteriorRemove,
        handleCoverChange,
        handleCoverRemove,
        handleSlotChange,
        handleSlotRemove,
        setInteriorCurrentPage,
        setInteriorPageCount,
        proofApproved,
        setProofApproved,
        lastOrderId,
        setLastOrderId,
        lastCheckout,
        setLastCheckout,
      }}
    >
      {children}
    </OrderFlowContext.Provider>
  );
}

export function useOrderFlow(): OrderFlowContextType {
  const context = useContext(OrderFlowContext);
  if (!context) {
    throw new Error('useOrderFlow must be used within an OrderFlowProvider');
  }
  return context;
}
