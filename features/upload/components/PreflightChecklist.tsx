'use client';

import React from 'react';
import { FileCheck2 } from 'lucide-react';
import { ValidationResult } from '../../../lib/productUploadConfig';
import { Product } from '../../../types';

interface PreflightChecklistProps {
  validationResults: ValidationResult[];
  product: Product | null;
}

export function PreflightChecklist({ validationResults, product }: PreflightChecklistProps) {
  return (
    <aside className="upload-side">
      <div className="side-title">
        <FileCheck2 size={16} />
        <b>PRINT-READINESS CHECKS</b>
      </div>
      {validationResults.map((result) => (
        <div className="check-row" key={result.ruleId}>
          <span>
            {result.name}
            <b
              style={{
                maxWidth: 170,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {result.details}
            </b>
          </span>
          <strong
            className={result.status === 'WAITING' ? 'warning' : ''}
            style={{
              color:
                result.status === 'PASSED'
                  ? 'var(--success)'
                  : result.status === 'WARNING' || result.status === 'WAITING'
                  ? 'var(--amber)'
                  : result.status === 'FAILED'
                  ? 'var(--rust)'
                  : 'var(--muted)',
              fontSize: 10,
            }}
          >
            {result.status === 'NOT_VERIFIED' ? 'NOT VERIFIED' : result.status}
          </strong>
        </div>
      ))}
      <p style={{ color: 'var(--muted)', fontSize: 11, marginTop: 16, lineHeight: 1.5 }}>
        Automated preflight evaluates files for <b>{product?.name || 'selected product'}</b>. Server
        keys generated at <code>POST /api/demo/uploads</code>.
      </p>
    </aside>
  );
}
