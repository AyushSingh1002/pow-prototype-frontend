'use client';

import React, { useState } from 'react';
import { Product, StorefrontPage } from '../../../types';
import { useOrderFlow } from '../../../context/OrderFlowContext';
import { HeroPressSheet } from './HeroPressSheet';
import { SentenceBuilder, PrintingIntent } from './SentenceBuilder';
import { ProductIndex } from './ProductIndex';
import { ProcessPath } from './ProcessPath';
import { MiniConfigurator } from './MiniConfigurator';
import { SamplePoliciesSection } from './SamplePoliciesSection';
import { QuestionsSection } from './QuestionsSection';
import { HomeBulkSection } from './HomeBulkSection';
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

  const [intent, setIntent] = useState<PrintingIntent>('author');

  return (
    <main className="w-full relative" role="main">
      {/* 1. The Press Sheet Hero */}
      <HeroPressSheet
        onNavigate={onNavigate}
        onSelectProduct={onSelectProduct}
      />

      {/* 2. Printing Purpose Sentence Builder */}
      <SentenceBuilder
        currentIntent={intent}
        onIntentChange={setIntent}
      />

      {/* 3. The Typographic Product Index with Live Sheet Preview */}
      <ProductIndex
        products={products}
        intent={intent}
        onNavigate={onNavigate}
        onSelectProduct={onSelectProduct}
      />

      {/* 4. The Sticky Production Process Path */}
      <ProcessPath />

      {/* 5. Working Mini Configurator with Live Book Preview & Integer Quote */}
      <MiniConfigurator
        onNavigate={onNavigate}
        onSelectProduct={onSelectProduct}
      />

      {/* 6. What Happens if Something is Wrong (Sample Policies) */}
      <SamplePoliciesSection />

      {/* 7. Questions (Grouped Accordions) */}
      <QuestionsSection />

      {/* 8. Bespoke Commercial Bulk Request */}
      <HomeBulkSection />

      {/* Site Footer with Site Index and Final Colour Bar Rule */}
      <Footer onNavigate={onNavigate} />
    </main>
  );
}

export default HomeView;
