'use client';

import React, { useEffect, useRef, useState } from 'react';

export interface ProcessPathProps {
  /** If provided, overrides scroll and renders a fixed station status for the Track Order page */
  fixedStation?: 'upload' | 'proof' | 'print' | 'dispatch' | 'delivered';
  isTrackingPage?: boolean;
}

export function ProcessPath({ fixedStation, isTrackingPage = false }: ProcessPathProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const stations: Array<{
    id: 'upload' | 'proof' | 'print' | 'dispatch' | 'delivered';
    label: string;
    sub: string;
    threshold: number;
  }> = [
    { id: 'upload', label: 'Upload', sub: 'Preflight check', threshold: 0.1 },
    { id: 'proof', label: 'Proof', sub: 'Digital inspection', threshold: 0.32 },
    { id: 'print', label: 'Print and bind', sub: 'Press imposition', threshold: 0.55 },
    { id: 'dispatch', label: 'Dispatch', sub: 'Hub logistics', threshold: 0.78 },
    { id: 'delivered', label: 'Delivered', sub: 'Proof complete', threshold: 0.95 },
  ];

  // Map fixedStation to a progress index for tracking mode
  const fixedProgress = fixedStation
    ? (stations.find((station) => station.id === fixedStation)?.threshold ?? 0) + 0.01
    : 0;

  useEffect(() => {
    if (isTrackingPage || fixedStation) return;

    let frame = 0;
    const handleScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        if (!containerRef.current) {
          frame = 0;
          return;
        }

        const rect = containerRef.current.getBoundingClientRect();
        const totalScrollable = rect.height - window.innerHeight;
        const rawProgress = totalScrollable > 0
          ? Math.min(Math.max(-rect.top / totalScrollable, 0), 1)
          : 0;
        setScrollProgress(rawProgress * rawProgress * (3 - 2 * rawProgress));
        frame = 0;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.cancelAnimationFrame(frame);
    };
  }, [isTrackingPage, fixedStation]);

  const activeProgress = fixedStation ? fixedProgress : scrollProgress;

  return (
    <section
      ref={containerRef}
      className={isTrackingPage ? 'py-8' : 'relative h-[180vh] md:h-[200vh] my-12'}
      aria-label="Print production pipeline sequence"
    >
      <div
        className={
          isTrackingPage
            ? 'w-full'
            : 'sticky top-20 z-20 pt-8 pb-12 bg-[#E8EAEE]'
        }
      >
        <div className="proof-container">
          <div className="proof-sheet p-6 md:p-10 border border-[#0F1218]">
            <div className="flex justify-between items-baseline border-b border-[#0F1218] pb-4 mb-8">
              <div>
                <h3 className="text-xl md:text-2xl font-bold" style={{ fontFamily: 'var(--font-headline)' }}>
                  Production Pipeline
                </h3>
                <p className="reading-text-soft text-sm mt-0.5">
                  The actual mechanical lifecycle from file upload to final bound shipment.
                </p>
              </div>

              {isTrackingPage && (
                <span className="sample-stamp">Sample statuses</span>
              )}
            </div>

            {/* Horizontal Line Path and Stations with mobile horizontal protection */}
            <div className="py-8 relative overflow-x-auto">
              <div className="min-w-[560px] relative py-4">
                {/* Background Guide Line */}
                <div className="h-[2px] bg-[#CBD0DA] w-full absolute top-[68px] left-0 right-0 z-0" />

                {/* Active Drawn Line */}
                <div
                  className="h-[2.5px] bg-[#0F1218] absolute top-[68px] left-0 z-0"
                  style={{
                    width: `${Math.min(activeProgress * 100, 100)}%`,
                  }}
                />

                {/* Travelling Mini Press Sheet on the Line */}
                <div
                  className="absolute top-[58px] -ml-3 z-20 flex items-center justify-center w-6 h-6 bg-[#FDFDFC] border border-[#0F1218] shadow-[1px_1px_0_0_#0F1218]"
                  style={{
                    left: `${Math.min(Math.max(activeProgress * 100, 0), 98)}%`,
                  }}
                  title="Travelling proof sheet"
                >
                  <span className="w-1.5 h-1.5 bg-[#0A95D4] rounded-none" />
                </div>

                {/* Stations */}
                <div className="grid grid-cols-5 gap-4 relative z-10 text-center">
                  {stations.map((station, index) => {
                    const isReached = activeProgress >= station.threshold;
                    const isCurrent =
                      activeProgress >= station.threshold &&
                      (index === stations.length - 1 || activeProgress < stations[index + 1].threshold);

                    return (
                      <div key={station.id} className="flex flex-col items-center">
                        {/* Station Node Indicator */}
                        <div
                          className="w-5 h-5 border-2 transition-colors duration-200 flex items-center justify-center mb-3"
                          style={{
                            backgroundColor: isReached ? 'var(--key)' : 'var(--sheet)',
                            borderColor: 'var(--key)',
                          }}
                        >
                          {isCurrent && (
                            <span className="w-1.5 h-1.5 bg-[#FFD60A] block" />
                          )}
                        </div>

                        <span
                          className="text-xs sm:text-sm font-semibold transition-colors duration-150"
                          style={{
                            color: isReached ? 'var(--key)' : 'var(--key-soft)',
                            fontFamily: 'var(--font-interface)',
                          }}
                        >
                          {station.label}
                        </span>
                        <span className="text-[11px] text-[#5A6070] block mt-0.5">
                          {station.sub}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer Slug */}
            <div className="mt-4 pt-3 border-t border-[#0F1218] flex items-center justify-between text-xs text-[#5A6070]">
              <span>5 Verified stages</span>
              <span>Zero client-side spoofing</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProcessPath;
