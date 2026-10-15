'use client';

import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import { OrderFlowProvider, useOrderFlow } from '../context/OrderFlowContext';
import { Notice } from '../components/layout/Notice';
import { Header } from '../components/layout/Header';
import { MobileNavDrawer } from '../components/layout/MobileNavDrawer';
import { SignInModal } from '../features/auth/components/SignInModal';
import { HomeView } from '../features/home/components/HomeView';
import { CatalogueView } from '../features/catalog/components/CatalogueView';
import { ConfiguratorView } from '../features/configurator/components/ConfiguratorView';
import { UploadView } from '../features/upload/components/UploadView';
import { ProofView } from '../features/proof/components/ProofView';
import { CheckoutView } from '../features/checkout/components/CheckoutView';
import { OrderConfirmationView } from '../features/order-confirmation/components/OrderConfirmationView';
import { TrackingView } from '../features/tracking/components/TrackingView';
import { BulkQuotesView } from '../features/bulk-quotes/components/BulkQuotesView';
import { HelpView } from '../features/help/components/HelpView';

function StorefrontApp() {
  const { page } = useOrderFlow();

  return (
    <div className="app-shell">
      <Notice />
      <Header />

      {page === 'home' && <HomeView />}
      {page === 'catalogue' && <CatalogueView />}
      {page === 'configurator' && <ConfiguratorView />}
      {page === 'upload' && <UploadView />}
      {page === 'proof' && <ProofView />}
      {page === 'checkout' && <CheckoutView />}
      {page === 'confirmation' && <OrderConfirmationView />}
      {page === 'tracking' && <TrackingView />}
      {page === 'bulk' && <BulkQuotesView />}
      {page === 'help' && <HelpView />}

      {/* Global Modals */}
      <SignInModal />
      <MobileNavDrawer />
    </div>
  );
}

export default function Page() {
  return (
    <AuthProvider>
      <OrderFlowProvider>
        <StorefrontApp />
      </OrderFlowProvider>
    </AuthProvider>
  );
}
