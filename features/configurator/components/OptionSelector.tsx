'use client';

import React from 'react';
import { PrintOption } from '../../../types';

interface OptionSelectorProps {
  option: PrintOption;
  stepIndex: number;
  selectedValue: string;
  onChange: (code: string, value: string) => void;
}

export function OptionSelector({
  option,
  stepIndex,
  selectedValue,
  onChange,
}: OptionSelectorProps) {
  return (
    <div className="config-step">
      <span>
        {stepIndex + 1}. {option.name.toUpperCase()}
      </span>
      <div className="option-grid">
        {option.choices.map((choice) => (
          <button
            key={choice.value}
            className={selectedValue === choice.value ? 'selected' : ''}
            onClick={() => onChange(option.code, choice.value)}
          >
            <b>{choice.label}</b>
            {choice.description && <small>{choice.description}</small>}
          </button>
        ))}
      </div>
    </div>
  );
}
