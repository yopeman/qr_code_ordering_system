"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Utensils, Image as ImageIcon } from "lucide-react";

interface DishImageGalleryProps {
  images: string[];
  dishName: string;
  className?: string;
}

export function DishImageGallery({
  images = [],
  dishName,
  className = "",
}: DishImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Reset active index when images list changes
  useEffect(() => {
    setActiveIndex(0);
  }, [images]);

  if (!images || images.length === 0) {
    return (
      <div className={`h-56 w-full rounded-2xl bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center text-slate-400 ${className}`}>
        <Utensils className="w-8 h-8 mb-2 opacity-50" />
        <span className="text-xs">No photos available</span>
      </div>
    );
  }

  const hasMultiple = images.length > 1;

  const nextImage = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Featured Main Image Container */}
      <div className="relative h-60 sm:h-72 w-full rounded-2xl overflow-hidden bg-slate-900 shadow-inner group select-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={images[activeIndex]}
          src={images[activeIndex]}
          alt={`${dishName} - photo ${activeIndex + 1}`}
          className="w-full h-full object-cover transition-opacity duration-200"
          // Following optimize-image-priority: high priority for candidate, no lazy loading on active view
          fetchPriority="high"
        />

        {/* Navigation Arrows (if multiple images) */}
        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={prevImage}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white transition shadow-lg opacity-90 hover:opacity-100 hover:scale-105 active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={nextImage}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white transition shadow-lg opacity-90 hover:opacity-100 hover:scale-105 active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Counter Badge */}
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-medium tracking-wide shadow flex items-center gap-1">
              <ImageIcon className="w-3 h-3" />
              <span>
                {activeIndex + 1} / {images.length}
              </span>
            </div>

            {/* Carousel Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  aria-label={`Go to image ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === activeIndex
                      ? "w-5 bg-white"
                      : "w-1.5 bg-white/50 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail Strip (if multiple images) */}
      {hasMultiple && (
        <div className="flex items-center gap-2 overflow-x-auto py-1 px-0.5 no-scrollbar">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`relative h-14 w-14 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                i === activeIndex
                  ? "border-orange-500 ring-2 ring-orange-500/30 scale-105 shadow-sm"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt={`${dishName} thumbnail ${i + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
                fetchPriority="low"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
