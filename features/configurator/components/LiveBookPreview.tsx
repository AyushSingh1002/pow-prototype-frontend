'use client';

import React, { useState } from 'react';

export interface LiveBookPreviewProps {
  format?: string; // 'a5' | 'b5' | 'a4'
  binding?: string; // 'perfect_bound' | 'hardcover' | 'saddle_stitch' | 'spiral'
  pageCount?: number;
  coverFinish?: string; // 'matte' | 'gloss' | 'spot_uv' | 'foil'
  interiorColour?: string; // 'bw' | 'colour'
  title?: string;
  isThumbnail?: boolean;
}

export function LiveBookPreview({
  format = 'a5',
  binding = 'perfect_bound',
  pageCount = 120,
  coverFinish = 'matte',
  interiorColour = 'bw',
  title = 'Press & Proof Editorial',
  isThumbnail = false,
}: LiveBookPreviewProps) {
  const [isOpenSpread, setIsOpenSpread] = useState(false);

  // Compute physical spine thickness (approx 0.052mm per page for 80gsm paper)
  const spineThicknessMm = Math.max(2.5, Math.min((pageCount * 0.052), 34));
  const spinePx = Math.round(spineThicknessMm * 1.8);

  // Proportions: A5 (148x210), B5 (176x250), A4 (210x297)
  const widthRatio = format === 'a4' ? 210 : format === 'b5' ? 176 : 148;
  const heightRatio = format === 'a4' ? 297 : format === 'b5' ? 250 : 210;

  if (isThumbnail) {
    return (
      <div className="w-[100px] h-[75px] bg-[#E8EAEE] border border-[#0F1218] flex items-center justify-center p-1 select-none">
        <div
          className="bg-white border border-[#0F1218] flex items-center justify-center text-[9px] font-bold"
          style={{ width: '45px', height: '62px' }}
        >
          {binding === 'hardcover' ? 'HC' : binding === 'saddle_stitch' ? 'SS' : 'PB'}
        </div>
      </div>
    );
  }

  return (
    <div className="proof-sheet p-6 flex flex-col items-center justify-between border border-[#0F1218] bg-[#FDFDFC]">
      {/* Top Bar: Specs and Spread Toggle */}
      <div className="w-full flex justify-between items-center text-xs border-b border-[#0F1218] pb-3 mb-6">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#0F1218] uppercase">{format.toUpperCase()}</span>
          <span className="text-[#5A6070] font-mono">
            {widthRatio}×{heightRatio}mm · {spineThicknessMm.toFixed(1)}mm spine
          </span>
        </div>

        <button
          onClick={() => setIsOpenSpread(!isOpenSpread)}
          className="btn-proof-link text-xs cursor-pointer bg-transparent border-0"
        >
          {isOpenSpread ? 'View closed cover' : 'Open spread view'}
        </button>
      </div>

      {/* SVG Canvas for Book Preview (settles in 250ms) */}
      <div
        className="relative my-4 flex items-center justify-center transition-all duration-250 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ minHeight: '260px' }}
      >
        {!isOpenSpread ? (
          /* CLOSED COVER VIEW */
          <div
            className="relative flex items-stretch transition-all duration-250 select-none"
            style={{
              width: `${Math.round((widthRatio / 210) * 190)}px`,
              height: `${Math.round((heightRatio / 297) * 260)}px`,
            }}
          >
            {/* Peeking Interior Page (Shows interior colour) */}
            <div
              className="absolute -top-1.5 -right-2 w-full h-full border border-[#0F1218] z-0 transition-colors duration-250"
              style={{
                backgroundColor: interiorColour === 'colour' ? '#F4F9FF' : '#FFFFFF',
              }}
            >
              {interiorColour === 'colour' ? (
                <div className="absolute top-4 right-4 w-12 h-16 bg-[#0A95D4] opacity-40 border border-[#0F1218]" />
              ) : (
                <div className="absolute top-4 right-4 w-12 space-y-1">
                  <div className="h-0.5 bg-[#0F1218] w-full" />
                  <div className="h-0.5 bg-[#5A6070] w-4/5" />
                  <div className="h-0.5 bg-[#5A6070] w-3/4" />
                </div>
              )}
            </div>

            {/* Spine (Perfect bound = flat spine, Saddle stitch = folded with 2 staples, Hardcover = board edge + hinge groove, Spiral = wire coil) */}
            {binding === 'perfect_bound' && (
              <div
                className="bg-[#0F1218] text-[#FDFDFC] flex items-center justify-center text-[8px] font-mono tracking-widest uppercase transition-all duration-250 z-10 shrink-0"
                style={{
                  width: `${Math.max(10, spinePx)}px`,
                  writingMode: 'vertical-rl',
                  borderRight: '1.5px solid #282C35',
                }}
              >
                {spinePx > 14 ? 'PRESS & PROOF' : ''}
              </div>
            )}

            {binding === 'hardcover' && (
              <div className="flex items-stretch shrink-0 z-10">
                {/* Board Spine */}
                <div
                  className="bg-[#0F1218] text-[#FDFDFC] flex items-center justify-center text-[8px] font-mono tracking-widest uppercase transition-all duration-250"
                  style={{
                    width: `${Math.max(14, spinePx + 4)}px`,
                    writingMode: 'vertical-rl',
                  }}
                >
                  PRESS &amp; PROOF
                </div>
                {/* Hinge Groove Impression */}
                <div className="w-1.5 bg-[#1F2430] border-r border-[#0F1218]" />
              </div>
            )}

            {binding === 'saddle_stitch' && (
              <div className="relative w-3 border-r-2 border-[#0F1218] bg-[#CBD0DA] flex flex-col justify-around py-6 shrink-0 z-10">
                {/* 2 Staples */}
                <div className="w-2.5 h-6 bg-[#5A6070] border border-[#0F1218] mx-auto shadow-sm" title="Metallic staple 1" />
                <div className="w-2.5 h-6 bg-[#5A6070] border border-[#0F1218] mx-auto shadow-sm" title="Metallic staple 2" />
              </div>
            )}

            {binding === 'spiral' && (
              <div className="w-6 flex flex-col justify-between py-2 shrink-0 z-10 -mr-1">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-5 h-2 bg-[#0F1218] rounded-full border border-gray-400 my-0.5 shadow-sm"
                    title="Twin-loop wire coil"
                  />
                ))}
              </div>
            )}

            {/* Main Cover Surface */}
            <div
              className="flex-1 bg-[#FDFDFC] border border-[#0F1218] p-4 flex flex-col justify-between relative overflow-hidden z-10 transition-all duration-250"
              style={{
                boxShadow: binding === 'hardcover' ? 'inset 0 0 0 2px #E8EAEE, 3px 3px 0 0 #0F1218' : '2px 2px 0 0 #CBD0DA',
              }}
            >
              {/* Cover Finish Highlight Effects */}
              {coverFinish === 'gloss' && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 50%)',
                  }}
                />
              )}

              {/* Top Cover Title Area */}
              <div className="relative z-10 mt-3">
                <div className="text-[10px] text-[#5A6070] tracking-widest font-mono uppercase mb-1">
                  EDITION 2026
                </div>

                <div
                  className={`text-lg md:text-xl font-bold leading-tight ${
                    coverFinish === 'foil' ? 'text-[#0F1218] drop-shadow-[0_1px_1px_rgba(255,214,10,0.8)]' : 'text-[#0F1218]'
                  }`}
                  style={{
                    fontFamily: 'var(--font-headline)',
                    backgroundColor: coverFinish === 'spot_uv' ? '#E8F6FC' : 'transparent',
                    padding: coverFinish === 'spot_uv' ? '4px 6px' : '0',
                    border: coverFinish === 'spot_uv' ? '1px dashed #0A95D4' : 'none',
                  }}
                >
                  {title}
                </div>

                {coverFinish === 'foil' && (
                  <span className="text-[9px] bg-[#FFD60A] text-[#0F1218] px-1 font-semibold uppercase mt-1 inline-block">
                    Gold foil finish
                  </span>
                )}
                {coverFinish === 'spot_uv' && (
                  <span className="text-[9px] text-[#00628F] font-semibold uppercase mt-1 inline-block">
                    Spot UV mask applied
                  </span>
                )}
              </div>

              {/* Graphic Block on Cover */}
              <div className="w-full h-16 border border-[#0F1218] bg-[#E8EAEE] my-auto flex items-center justify-center text-[10px] text-[#5A6070] font-mono">
                ARTWORK MATTE
              </div>

              {/* Bottom Colophon */}
              <div className="text-[9px] text-[#5A6070] flex justify-between items-center border-t border-[#CBD0DA] pt-2">
                <span>{pageCount} pp</span>
                <span>{coverFinish.toUpperCase()}</span>
              </div>
            </div>
          </div>
        ) : (
          /* OPEN SPREAD VIEW */
          <div
            className="flex items-stretch border border-[#0F1218] bg-white shadow-md transition-all duration-250 select-none"
            style={{ width: '340px', height: '220px' }}
          >
            {/* Left Page (Verso) */}
            <div className="flex-1 p-3 border-r border-[#CBD0DA] flex flex-col justify-between">
              <div className="text-[8px] text-[#5A6070] font-mono flex justify-between">
                <span>Verso</span>
                <span>p.14</span>
              </div>
              <div className="space-y-1.5 my-auto">
                <div className="h-1 bg-[#0F1218] w-3/4" />
                <div className="h-0.5 bg-[#5A6070] w-full" />
                <div className="h-0.5 bg-[#5A6070] w-full" />
                <div className="h-0.5 bg-[#5A6070] w-4/5" />
              </div>
              <div className="text-[7px] text-[#5A6070] font-mono">Running header</div>
            </div>

            {/* Gutter / Center fold */}
            <div className="w-1 bg-[#CBD0DA]" />

            {/* Right Page (Recto) */}
            <div
              className="flex-1 p-3 flex flex-col justify-between transition-colors duration-250"
              style={{
                backgroundColor: interiorColour === 'colour' ? '#F6FAFC' : '#FFFFFF',
              }}
            >
              <div className="text-[8px] text-[#5A6070] font-mono flex justify-between">
                <span>Recto</span>
                <span>p.15</span>
              </div>
              {interiorColour === 'colour' ? (
                <div className="w-full h-20 bg-[#0A95D4] opacity-30 border border-[#0F1218] my-auto flex items-center justify-center text-[8px] text-[#00628F] font-bold">
                  FOUR COLOUR CMYK
                </div>
              ) : (
                <div className="space-y-1.5 my-auto">
                  <div className="h-0.5 bg-[#5A6070] w-full" />
                  <div className="h-0.5 bg-[#5A6070] w-full" />
                  <div className="h-0.5 bg-[#5A6070] w-2/3" />
                </div>
              )}
              <div className="text-[7px] text-[#5A6070] font-mono">Running header</div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Status Rule */}
      <div className="w-full border-t border-[#0F1218] pt-3 flex justify-between text-xs text-[#5A6070]">
        <span>Spine: {spineThicknessMm.toFixed(1)}mm</span>
        <span>Interior: {interiorColour === 'colour' ? 'Full colour' : 'Black & white'}</span>
      </div>
    </div>
  );
}

export default LiveBookPreview;
