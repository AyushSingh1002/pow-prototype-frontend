'use client';

import React from 'react';
import { Product, StorefrontPage } from '../../../types';
import { useOrderFlow } from '../../../context/OrderFlowContext';
import {
  HeroSection,
  OfferStrip,
  AudienceSection,
  LiveCatalogueSection,
  PipelineStepsSection,
  PricingBannerSection,
  TrustedReviewsSection,
  FaqSection,
} from './sections';
import { Footer } from '../../../components/layout/Footer';

export interface HomeViewProps {
  products?: Product[];
  onNavigate?: (page: StorefrontPage) => void;
  onSelectProduct?: (productId: string) => void;
}

export function HomeView({
  products: propProducts,
  onNavigate: propNavigate,
  onSelectProduct: propSelectProduct,
}: HomeViewProps) {
  const {
    products: contextProducts,
    navigate: contextNavigate,
    setSelectedProductId: contextSelectProduct,
  } = useOrderFlow();

  const products = propProducts || contextProducts;
  const onNavigate = propNavigate || contextNavigate;
  const onSelectProduct = propSelectProduct || contextSelectProduct;

  return (
    <main>
      <HeroSection onNavigate={onNavigate} onSelectProduct={onSelectProduct} />
      <OfferStrip />
      <AudienceSection />
      <LiveCatalogueSection
        products={products}
        onNavigate={onNavigate}
        onSelectProduct={onSelectProduct}
      />
      <PipelineStepsSection />
      <PricingBannerSection onNavigate={onNavigate} onSelectProduct={onSelectProduct} />
      <TrustedReviewsSection />
      <FaqSection />
      <Footer onNavigate={onNavigate} />
    </main>
  );
}

export default HomeView;
