'use client';

import React from 'react';
import { ValidationResult } from '../../../lib/productUploadConfig';
import { Product } from '../../../types';

interface PreflightChecklistProps {
  validationResults: ValidationResult[];
  product: Product | null;
}

export function PreflightChecklist({ validationResults, product }: PreflightChecklistProps) {
  return (
    <aside className="proof-sheet p-6 border border-[#0F1218] bg-white space-y-4">
      <div className="border-b border-[#0F1218] pb-3">
        <span className="sample-stamp">Browser checks</span>
        <h3 className="text-lg font-bold mt-2" style={{ fontFamily: 'var(--font-headline)' }}>
          File checks
        </h3>
        <p className="reading-text-soft text-xs mt-1">
          Local checks for {product?.name || 'print job'}; files are not sent to production preflight.
        </p>
      </div>

      <div className="divide-y divide-[#CBD0DA] text-xs">
        {validationResults.map((result) => (
          <div className="py-2.5 flex justify-between items-start gap-3" key={result.ruleId}>
            <div>
              <span className="font-semibold text-[#0F1218] block">{result.name}</span>
              <span className="text-[#5A6070] text-[11px] block mt-0.5 line-clamp-1">
                {result.details}
              </span>
            </div>

            <span
              className="text-[10px] font-bold uppercase shrink-0 px-2 py-0.5 border"
              style={{
                borderColor:
                  result.status === 'PASSED'
                    ? '#00628F'
                    : result.status === 'FAILED'
                    ? '#C4161C'
                    : '#0F1218',
                color:
                  result.status === 'PASSED'
                    ? '#00628F'
                    : result.status === 'FAILED'
                    ? '#C4161C'
                    : '#5A6070',
              }}
            >
              {result.status === 'PASSED'
                ? 'Passed'
                : result.status === 'FAILED'
                ? 'Failed'
                : 'Pending'}
            </span>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-[#5A6070] pt-2 border-t border-[#CBD0DA]">
        Checks inspect available file metadata only. No server-side artwork validation is configured.
      </p>
    </aside>
  );
}

export default PreflightChecklist;
