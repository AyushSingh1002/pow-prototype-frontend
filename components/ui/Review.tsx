"use client";

import Autoplay from "embla-carousel-autoplay";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const DEFAULT_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    alt: "Block Reader - Editorial Print & Bookbinding",
    title: "Block Reader",
  },
  {
    src: "https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=800&q=80",
    alt: "Forest Fungi - Botanical & Nature Print",
    title: "Forest Fungi",
  },
  {
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    alt: "Golden Dusk - Archival Warm Tones",
    title: "Golden Dusk",
  },
  {
    src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    alt: "Silent Peaks - High Fidelity Landscape",
    title: "Silent Peaks",
  },
  {
    src: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80",
    alt: "Emerald Woods - Deep Pigment Ink Saturation",
    title: "Emerald Woods",
  },
  {
    src: "https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?auto=format&fit=crop&w=800&q=80",
    alt: "Falling Mist - High Resolution Monochrome Proof",
    title: "Falling Mist",
  },
  {
    src: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80",
    alt: "Midnight Veil - Deep Black Velvet Texture",
    title: "Midnight Veil",
  },
  {
    src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    alt: "Azure Ridge - Crisp Fine Art Print",
    title: "Azure Ridge",
  },
  {
    src: "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=800&q=80",
    alt: "Cloud Summit - High Altitude Fine Art Edition",
    title: "Cloud Summit",
  },
];

interface Skiper54Props {
  images?: { src: string; alt: string; title: string }[];
  className?: string;
  autoplay?: boolean;
  loop?: boolean;
  showNavigation?: boolean;
  showPagination?: boolean;
}

const Skiper54 = ({
  images = DEFAULT_IMAGES,
  className,
  autoplay = true,
  loop = true,
  showNavigation = true,
  showPagination = true,
}: Skiper54Props) => {
  return (
    <div
      className={cn(
        "relative flex h-full w-full max-w-full items-center justify-center overflow-hidden rounded-2xl bg-[#f5f4f3] p-4 py-8 shadow-sm transition-all",
        className
      )}
    >
      <Carousel_006
        images={images}
        className="w-full"
        loop={loop}
        autoplay={autoplay}
        showNavigation={showNavigation}
        showPagination={showPagination}
      />
    </div>
  );
};

interface Carousel_006Props {
  images: { src: string; alt: string; title: string }[];
  className?: string;
  autoplay?: boolean;
  loop?: boolean;
  showNavigation?: boolean;
  showPagination?: boolean;
}

const Carousel_006 = ({
  images,
  className,
  autoplay = false,
  loop = true,
  showNavigation = true,
  showPagination = true,
}: Carousel_006Props) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);

    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  return (
    <Carousel
      setApi={setApi}
      className={cn("relative w-full", className)}
      opts={{
        loop,
        slidesToScroll: 1,
      }}
      plugins={
        autoplay
          ? [
            Autoplay({
              delay: 2600,
              stopOnInteraction: true,
              stopOnMouseEnter: true,
            }),
          ]
          : []
      }
    >
      <CarouselContent className="flex h-[480px] w-full items-center">
        {images.map((img, index) => {
          const isActive = current === index;
          return (
            <CarouselItem
              key={index}
              className="relative flex h-[82%] w-full basis-[73%] items-center justify-center sm:basis-[50%] md:basis-[30%] lg:basis-[25%] xl:basis-[21%]"
            >
              <motion.div
                initial={false}
                animate={{
                  clipPath: !isActive
                    ? "inset(15% 0 15% 0 round 2rem)"
                    : "inset(0 0 0 0 round 2rem)",
                }}
                transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
                className="h-full w-full overflow-hidden rounded-3xl shadow-sm"
              >
                <div className="relative h-full w-full overflow-hidden border border-black/5 bg-neutral-200">
                  <img
                    src={img.src}
                    alt={img.alt}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.jpg";
                    }}
                    className="h-full w-full scale-105 object-cover transition-transform duration-700 hover:scale-110"
                  />
                </div>
              </motion.div>

              <AnimatePresence mode="wait">
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, filter: "blur(8px)", y: 6 }}
                    animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                    exit={{ opacity: 0, filter: "blur(6px)", y: 4 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="absolute -bottom-8 left-0 right-0 flex items-center justify-center text-center font-serif text-sm font-semibold tracking-wide text-neutral-800"
                  >
                    {img.title}
                  </motion.div>
                )}
              </AnimatePresence>
            </CarouselItem>
          );
        })}
      </CarouselContent>

      {/* Floating high-contrast accessible navigation arrows */}
      {showNavigation && (
        <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-between px-2 sm:px-4 z-20">
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => api?.scrollPrev()}
            className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-neutral-800 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:scale-105 active:scale-95 border border-black/10 cursor-pointer focus:outline-none focus:ring-2 focus:ring-neutral-400"
          >
            <ChevronLeft className="h-5 w-5 text-neutral-800" />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => api?.scrollNext()}
            className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-neutral-800 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:scale-105 active:scale-95 border border-black/10 cursor-pointer focus:outline-none focus:ring-2 focus:ring-neutral-400"
          >
            <ChevronRight className="h-5 w-5 text-neutral-800" />
          </button>
        </div>
      )}

      {/* Clean pagination indicators */}
      {showPagination && (
        <div className="mt-8 flex w-full items-center justify-center">
          <div className="flex items-center justify-center gap-2" role="tablist" aria-label="Slides">
            {Array.from({ length: images.length }).map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => api?.scrollTo(index)}
                className={cn(
                  "cursor-pointer rounded-full transition-all duration-300 focus:outline-none",
                  current === index
                    ? "h-2 w-6 bg-neutral-900"
                    : "h-2 w-2 bg-neutral-300 hover:bg-neutral-400"
                )}
                aria-label={`Go to slide ${index + 1}`}
                aria-selected={current === index}
                role="tab"
              />
            ))}
          </div>
        </div>
      )}
    </Carousel>
  );
};

export { Skiper54, Carousel_006 };
export const ReviewCarousel = Skiper54;
export default Skiper54;

/**
 * Skiper 54 Carousel_006 — React + Framer Motion
 * Built with shadcn/ui And Embla Carousel - Read docs to learn more https://ui.shadcn.com/docs/components/carousel https://embla-carousel.com/
 *
 * Web photography from Unsplash
 * Free to use and modify in personal and commercial projects.
 */
