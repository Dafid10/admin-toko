"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductMedia {
  id: string;
  url: string;
  type: "IMAGE" | "VIDEO";
  order: number;
}

export default function ProductGallery({
  media,
  productName,
}: {
  media: ProductMedia[];
  productName: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!media || media.length === 0) {
    return (
      <div className="relative w-full aspect-square bg-surface-low rounded-2xl overflow-hidden border border-outline-variant flex items-center justify-center text-ink-muted/50">
        Tidak ada foto
      </div>
    );
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
  };

  const currentMedia = media[currentIndex];

  return (
    <div className="space-y-4">
      {/* Main Image Area */}
      <div className="relative group w-full aspect-square min-h-[350px] bg-surface-low rounded-2xl overflow-hidden border border-outline-variant">
        {currentMedia.type === "IMAGE" ? (
          <Image
            alt={productName}
            className="absolute inset-0 object-cover"
            fill
            priority
            src={currentMedia.url}
          />
        ) : (
          <video
            src={currentMedia.url}
            controls
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Navigation Arrows (Only show if more than 1 media) */}
        {media.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-ink p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center w-10 h-10"
              aria-label="Previous image"
            >
              <span className="border-t-2 border-l-2 border-current w-3 h-3 rotate-[-45deg] translate-x-0.5"></span>
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-ink p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center w-10 h-10"
              aria-label="Next image"
            >
              <span className="border-t-2 border-r-2 border-current w-3 h-3 rotate-[45deg] -translate-x-0.5"></span>
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {media.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {media.map((m, i) => (
            <button
              key={m.id || i}
              onClick={() => setCurrentIndex(i)}
              className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                currentIndex === i
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-transparent hover:border-outline"
              } bg-surface-low`}
            >
              {m.type === "IMAGE" ? (
                <Image src={m.url} alt="" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-black text-white text-[10px] relative">
                  <span className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1"></span>
                  <span className="sr-only">Video</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
