'use client';

import React from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { useOrderFlow } from '../../context/OrderFlowContext';
import { StorefrontPage } from '../../types';

interface FlowStepperProps {
  activeStep: number;
  onNavigate?: (page: StorefrontPage) => void;
}

export function FlowStepper({ activeStep, onNavigate }: FlowStepperProps) {
  const { navigate: contextNavigate } = useOrderFlow();
  const navigate = onNavigate || contextNavigate;

  const steps: Array<{ num: number; label: string; page: StorefrontPage }> = [
    { num: 1, label: 'Configure Options', page: 'configurator' },
    { num: 2, label: 'Upload Artwork', page: 'upload' },
    { num: 3, label: 'Review Proof', page: 'proof' },
    { num: 4, label: 'Confirm & Order', page: 'checkout' },
  ];

  return (
    <div className="flow-stepper" role="navigation" aria-label="Order progress">
      {steps.map((s, idx) => (
        <React.Fragment key={s.num}>
          <div
            className={`flow-step-item ${
              activeStep === s.num ? 'active' : activeStep > s.num ? 'completed' : ''
            }`}
          >
            <span className="flow-step-num">
              {activeStep > s.num ? <Check size={11} /> : s.num}
            </span>
            <span>{s.label}</span>
          </div>
          {idx < steps.length - 1 && (
            <ChevronRight size={13} style={{ color: 'var(--line-strong)', margin: '0 2px' }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
