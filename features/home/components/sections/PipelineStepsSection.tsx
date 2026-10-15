'use client';

import React from 'react';

export interface PipelineStep {
  number: string;
  line1: string;
  line2: string;
  description: string;
}

const DEFAULT_STEPS: PipelineStep[] = [
  {
    number: '01',
    line1: 'Configure',
    line2: 'options',
    description: 'Server computes minor unit quote.',
  },
  {
    number: '02',
    line1: 'Upload',
    line2: 'artwork',
    description: 'Preflight metadata validation API.',
  },
  {
    number: '03',
    line1: 'Review',
    line2: 'digital proof',
    description: 'Verify specifications and margins.',
  },
  {
    number: '04',
    line1: 'Draft',
    line2: 'order',
    description: 'Idempotent state machine transition.',
  },
  {
    number: '05',
    line1: 'Track',
    line2: 'delivery',
    description: 'Audit status history timeline.',
  },
];

export interface PipelineStepsSectionProps {
  steps?: PipelineStep[];
  className?: string;
}

export function PipelineStepsSection({
  steps = DEFAULT_STEPS,
  className = '',
}: PipelineStepsSectionProps) {
  return (
    <section className={`steps section ${className}`.trim()}>
      <div className="section-heading" style={{ maxWidth: 540 }}>
        <p className="eyebrow">HOW THE PIPELINE WORKS</p>
        <h2>Five auditable steps from file to print.</h2>
      </div>
      <div className="steps-grid">
        {steps.map((s) => (
          <div className="step" key={s.number}>
            <span>{s.number}</span>
            <strong>
              {s.line1}
              <br />
              {s.line2}
            </strong>
            <p>{s.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default PipelineStepsSection;
