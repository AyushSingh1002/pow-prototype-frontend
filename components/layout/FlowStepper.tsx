'use client';

import React from 'react';
import { useOrderFlow } from '../../context/OrderFlowContext';
import { StorefrontPage } from '../../types';

interface FlowStepperProps {
  activeStep: number; // 1: Configure, 2: Upload, 3: Review proof, 4: Delivery, 5: Pay
  onNavigate?: (page: StorefrontPage) => void;
}

export function FlowStepper({ activeStep, onNavigate }: FlowStepperProps) {
  const { navigate: contextNavigate } = useOrderFlow();
  const navigate = onNavigate || contextNavigate;

  const steps: Array<{ num: number; label: string; page?: StorefrontPage }> = [
    { num: 1, label: 'Configure', page: 'configurator' },
    { num: 2, label: 'Upload', page: 'upload' },
    { num: 3, label: 'Review proof', page: 'proof' },
    { num: 4, label: 'Delivery', page: 'checkout' },
    { num: 5, label: 'Pay', page: 'checkout' },
  ];

  return (
    <nav
      className="flex items-center gap-3 md:gap-6 py-4 overflow-x-auto select-none"
      aria-label="Order step sequence"
    >
      {steps.map((s) => {
        const isCompleted = activeStep > s.num;
        const isCurrent = activeStep === s.num;

        return (
          <div
            key={s.num}
            className="flex items-center gap-2 cursor-default"
            onClick={() => {
              if (s.page && isCompleted) navigate(s.page);
            }}
          >
            {/* Colour bar step swatch */}
            <span
              className="w-4 h-4 transition-all duration-150 inline-block"
              style={{
                backgroundColor: isCompleted
                  ? 'var(--key)'
                  : isCurrent
                  ? 'var(--sheet)'
                  : 'transparent',
                border: isCurrent
                  ? '2px solid var(--key)'
                  : isCompleted
                  ? '1.5px solid var(--key)'
                  : '1.5px dashed var(--key-soft)',
              }}
              title={`Step ${s.num}: ${s.label}`}
            />
            <span
              className="text-xs whitespace-nowrap"
              style={{
                fontFamily: 'var(--font-interface)',
                fontWeight: isCurrent ? 600 : 500,
                color: isCurrent
                  ? 'var(--key)'
                  : isCompleted
                  ? 'var(--key)'
                  : 'var(--key-soft)',
              }}
            >
              {s.num}. {s.label}
            </span>
          </div>
        );
      })}
    </nav>
  );
}

export default FlowStepper;
