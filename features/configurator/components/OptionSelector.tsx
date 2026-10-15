'use client';

import React from 'react';
import { PrintOption } from '../../../types';

interface OptionSelectorProps {
  option: PrintOption;
  selectedValue: string;
  onChange: (code: string, value: string) => void;
}

export function OptionSelector({
  option,
  selectedValue,
  onChange,
}: OptionSelectorProps) {
  const code = option.code.toLowerCase();

  return (
    <div className="py-6 border-b border-[#CBD0DA]">
      <div className="flex justify-between items-baseline mb-4">
        <label className="text-base font-bold text-[#0F1218]" style={{ fontFamily: 'var(--font-headline)' }}>
          {option.name}
        </label>
        <span className="text-xs text-[#5A6070]">
          {selectedValue ? option.choices.find((c) => c.value === selectedValue)?.label : 'Select option'}
        </span>
      </div>

      {/* Render custom visual representation per option type */}
      {code.includes('format') || code.includes('size') ? (
        /* FORMAT: True-proportion page silhouettes */
        <div className="grid grid-cols-3 gap-4">
          {option.choices.map((choice) => {
            const isSelected = selectedValue === choice.value;
            const isA4 = choice.value.toLowerCase().includes('a4');
            const isB5 = choice.value.toLowerCase().includes('b5');

            return (
              <button
                key={choice.value}
                type="button"
                onClick={() => onChange(option.code, choice.value)}
                className="p-3 text-center cursor-pointer transition-all duration-150 relative bg-white border border-[#0F1218] flex flex-col items-center justify-between"
                style={{
                  minHeight: '140px',
                }}
              >
                {/* True-proportion silhouette */}
                <div
                  className="bg-[#E8EAEE] border border-[#0F1218] my-auto flex items-center justify-center text-[10px] text-[#5A6070] font-mono"
                  style={{
                    width: isA4 ? '64px' : isB5 ? '54px' : '48px',
                    height: isA4 ? '90px' : isB5 ? '78px' : '68px',
                  }}
                >
                  {choice.value.toUpperCase()}
                </div>

                <div className="w-full text-center mt-2">
                  <span className="text-xs font-bold block text-[#0F1218]">{choice.label}</span>
                  {choice.description && (
                    <span className="text-[10px] text-[#5A6070] block">{choice.description}</span>
                  )}
                </div>

                {/* Corner ticks when selected (crop mark style) */}
                {isSelected && <CornerCropTicks />}
              </button>
            );
          })}
        </div>
      ) : code.includes('binding') ? (
        /* BINDING: Spine drawings */
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {option.choices.map((choice) => {
            const isSelected = selectedValue === choice.value;
            const val = choice.value.toLowerCase();

            return (
              <button
                key={choice.value}
                type="button"
                onClick={() => onChange(option.code, choice.value)}
                className="p-3 text-left cursor-pointer transition-all duration-150 relative bg-white border border-[#0F1218] flex flex-col justify-between"
                style={{ minHeight: '110px' }}
              >
                {/* Spine Drawing */}
                <div className="w-full h-10 mb-2 flex items-center justify-center bg-[#FDFDFC] border border-[#CBD0DA] p-1">
                  {val.includes('hard') ? (
                    <div className="flex items-center w-full justify-center">
                      <div className="w-4 h-7 bg-[#0F1218] border border-black" />
                      <div className="w-1 h-7 bg-[#999]" />
                      <div className="w-12 h-7 bg-[#E8EAEE] border border-[#0F1218]" />
                    </div>
                  ) : val.includes('saddle') ? (
                    <div className="flex items-center w-full justify-center gap-1.5">
                      <div className="w-1.5 h-6 bg-[#5A6070] border border-black" />
                      <div className="w-1.5 h-6 bg-[#5A6070] border border-black" />
                    </div>
                  ) : val.includes('spiral') ? (
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="w-1.5 h-5 bg-[#0F1218] rounded-full" />
                      ))}
                    </div>
                  ) : (
                    /* Perfect bound flat spine */
                    <div className="flex items-center w-full justify-center">
                      <div className="w-3.5 h-7 bg-[#0F1218] border border-black" />
                      <div className="w-12 h-7 bg-[#E8EAEE] border border-[#0F1218]" />
                    </div>
                  )}
                </div>

                <div>
                  <span className="text-xs font-bold block text-[#0F1218]">{choice.label}</span>
                  {choice.description && (
                    <span className="text-[10px] text-[#5A6070] block line-clamp-1">{choice.description}</span>
                  )}
                </div>

                {isSelected && <CornerCropTicks />}
              </button>
            );
          })}
        </div>
      ) : code.includes('paper') ? (
        /* PAPER: Edge-on swatches */
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {option.choices.map((choice) => {
            const isSelected = selectedValue === choice.value;
            const val = choice.value.toLowerCase();

            return (
              <button
                key={choice.value}
                type="button"
                onClick={() => onChange(option.code, choice.value)}
                className="p-3 text-left cursor-pointer transition-all duration-150 relative bg-white border border-[#0F1218] flex flex-col justify-between"
                style={{ minHeight: '90px' }}
              >
                {/* Edge-on paper swatch */}
                <div className="w-full h-6 mb-2 flex flex-col justify-center gap-0.5 bg-[#E8EAEE] px-1 border border-[#CBD0DA]">
                  <div
                    className="h-1 w-full"
                    style={{
                      backgroundColor: val.includes('cream') ? '#F9F4E5' : val.includes('natural') ? '#FDFBF7' : '#FFFFFF',
                      border: '0.5px solid #CBD0DA',
                    }}
                  />
                  <div
                    className="h-1 w-4/5"
                    style={{
                      backgroundColor: val.includes('cream') ? '#F9F4E5' : val.includes('natural') ? '#FDFBF7' : '#FFFFFF',
                      border: '0.5px solid #CBD0DA',
                    }}
                  />
                </div>

                <div>
                  <span className="text-xs font-bold block text-[#0F1218]">{choice.label}</span>
                  {choice.description && (
                    <span className="text-[10px] text-[#5A6070] block">{choice.description}</span>
                  )}
                </div>

                {isSelected && <CornerCropTicks />}
              </button>
            );
          })}
        </div>
      ) : code.includes('finish') ? (
        /* COVER FINISH: Surface samples */
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {option.choices.map((choice) => {
            const isSelected = selectedValue === choice.value;
            const val = choice.value.toLowerCase();

            return (
              <button
                key={choice.value}
                type="button"
                onClick={() => onChange(option.code, choice.value)}
                className="p-3 text-left cursor-pointer transition-all duration-150 relative bg-white border border-[#0F1218] flex flex-col justify-between"
                style={{ minHeight: '90px' }}
              >
                {/* Surface sample tile */}
                <div
                  className="w-full h-6 mb-2 border border-[#CBD0DA] flex items-center justify-center text-[9px] font-bold"
                  style={{
                    backgroundColor: val.includes('gloss')
                      ? '#FFFFFF'
                      : val.includes('foil')
                      ? '#FFF9D2'
                      : val.includes('spot')
                      ? '#E8F6FC'
                      : '#F5F5F7',
                    boxShadow: val.includes('gloss') ? 'inset 0 0 4px rgba(0,0,0,0.1)' : 'none',
                    color: val.includes('foil') ? '#9A7D0A' : '#0F1218',
                  }}
                >
                  {val.includes('foil') ? 'FOIL' : val.includes('spot') ? 'UV' : val.includes('gloss') ? 'GLOSS' : 'MATTE'}
                </div>

                <div>
                  <span className="text-xs font-bold block text-[#0F1218]">{choice.label}</span>
                </div>

                {isSelected && <CornerCropTicks />}
              </button>
            );
          })}
        </div>
      ) : (
        /* Standard choices with corner ticks when selected */
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {option.choices.map((choice) => {
            const isSelected = selectedValue === choice.value;

            return (
              <button
                key={choice.value}
                type="button"
                onClick={() => onChange(option.code, choice.value)}
                className="p-3 text-left cursor-pointer transition-all duration-150 relative bg-white border border-[#0F1218] flex flex-col justify-between"
              >
                <span className="text-xs font-bold block text-[#0F1218]">{choice.label}</span>
                {choice.description && (
                  <span className="text-[10px] text-[#5A6070] block mt-0.5">{choice.description}</span>
                )}
                {isSelected && <CornerCropTicks />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Corner ticks that look like printer's crop marks (1px key) */
function CornerCropTicks() {
  return (
    <>
      <span className="absolute top-0.5 left-0.5 w-2 h-2 border-t-2 border-l-2 border-[#0F1218] pointer-events-none" />
      <span className="absolute top-0.5 right-0.5 w-2 h-2 border-t-2 border-r-2 border-[#0F1218] pointer-events-none" />
      <span className="absolute bottom-0.5 left-0.5 w-2 h-2 border-b-2 border-l-2 border-[#0F1218] pointer-events-none" />
      <span className="absolute bottom-0.5 right-0.5 w-2 h-2 border-b-2 border-r-2 border-[#0F1218] pointer-events-none" />
    </>
  );
}

export default OptionSelector;
