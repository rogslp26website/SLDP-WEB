"use client";

import { useState } from "react";
import { X } from "lucide-react";

export interface GalleryImageItem {
  id: string;
  path: string;
  alt: string;
  url?: string; // when from Supabase Storage, use this for src (no resize param)
}

const PAGE_SIZE = 24;
const THUMB_WIDTH = 400; // smaller thumbnails for faster load; API resizes Storage images too

function imageSrc(item: GalleryImageItem, thumb = false): string {
  const base = `/api/gallery/image?path=${encodeURIComponent(item.path)}`;
  if (thumb) return `${base}&w=${THUMB_WIDTH}`;
  return item.url ?? base; // full size: use Storage URL when available to avoid proxy
}

export default function GalleryGrid({ images }: { images: GalleryImageItem[] }) {
  const [shownCount, setShownCount] = useState(PAGE_SIZE);
  const [lightboxPath, setLightboxPath] = useState<string | null>(null);

  const visible = images.slice(0, shownCount);
  const hasMore = shownCount < images.length;

  if (images.length === 0) {
    return (
      <p className="text-gray-600 text-center py-12">
        No gallery images found. Add photos to the docs and photos folder.
      </p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        {visible.map((img) => (
          <button
            key={img.id + img.path}
            type="button"
            onClick={() => setLightboxPath(img.path)}
            className="relative aspect-square overflow-hidden rounded-lg border border-gray-200 hover:border-teal-blue/50 transition-colors focus:ring-2 focus:ring-lime-green focus:ring-offset-2"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc(img, true)}
              alt={img.alt}
              width={THUMB_WIDTH}
              height={THUMB_WIDTH}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </button>
        ))}
      </div>

      {hasMore && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setShownCount((c) => Math.min(c + PAGE_SIZE, images.length))}
            className="px-6 py-3 rounded-lg font-semibold bg-teal-blue text-white hover:bg-teal-blue/90 transition-colors"
          >
            Load more
          </button>
        </div>
      )}

      {lightboxPath && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxPath(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
        >
          <button
            type="button"
            onClick={() => setLightboxPath(null)}
            className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full z-10"
            aria-label="Close"
          >
            <X size={28} />
          </button>
          <div
            className="relative max-w-4xl w-full aspect-[3/2]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={(() => {
              const item = images.find((i) => i.path === lightboxPath);
              return item ? imageSrc(item, false) : `/api/gallery/image?path=${encodeURIComponent(lightboxPath)}`;
            })()}
              alt="Prefect Summit 2025"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
