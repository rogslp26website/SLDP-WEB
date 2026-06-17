"use client";

import { useState, useCallback } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { GalleryImageItem } from "@/lib/gallery-source";

const THUMB_WIDTH = 400;

function imageSrc(item: GalleryImageItem, thumb = false): string {
  if (thumb && item.thumbUrl) return item.thumbUrl;
  if (!thumb && item.url) return item.url;
  const base = `/api/gallery/image?path=${encodeURIComponent(item.path)}`;
  if (thumb) return `${base}&w=${THUMB_WIDTH}`;
  return base;
}

interface GalleryGridProps {
  /** Pre-hydrated first page from the server (avoids duplicate full list fetch). */
  initialImages?: GalleryImageItem[];
  total?: number;
  initialHasMore?: boolean;
  pageSize?: number;
  /** Legacy: full list passed at once (e.g. admin). */
  images?: GalleryImageItem[];
}

export default function GalleryGrid({
  initialImages,
  total: totalProp,
  initialHasMore = false,
  pageSize = 24,
  images: imagesProp,
}: GalleryGridProps) {
  const legacySlice = imagesProp?.slice(0, pageSize);
  const [images, setImages] = useState<GalleryImageItem[]>(
    initialImages ?? legacySlice ?? []
  );
  const [total, setTotal] = useState(
    totalProp ?? imagesProp?.length ?? initialImages?.length ?? 0
  );
  const [hasMore, setHasMore] = useState(
    initialHasMore ??
      (imagesProp ? imagesProp.length > pageSize : false)
  );
  const [loadingMore, setLoadingMore] = useState(false);
  const [lightboxPath, setLightboxPath] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(
        `/api/gallery/list?offset=${images.length}&limit=${pageSize}`
      );
      if (!res.ok) throw new Error("Failed to load more");
      const data = await res.json();
      const next = (data.images ?? []) as GalleryImageItem[];
      setImages((prev) => [...prev, ...next]);
      setTotal(data.total ?? total);
      setHasMore(!!data.hasMore);
    } catch {
      /* keep existing images visible */
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, images.length, loadingMore, pageSize, total]);

  if (images.length === 0) {
    return (
      <p className="text-gray-600 text-center py-12">
        No gallery images found. Add photos to the Gallery bucket or docs and photos folder.
      </p>
    );
  }

  const lightboxItem = lightboxPath
    ? images.find((i) => i.path === lightboxPath)
    : null;
  const lightboxSrc = lightboxItem
    ? imageSrc(lightboxItem, false)
    : lightboxPath
      ? `/api/gallery/image?path=${encodeURIComponent(lightboxPath)}`
      : "";

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        {images.map((img) => (
          <motion.button
            key={img.id + img.path}
            type="button"
            onClick={() => setLightboxPath(img.path)}
            className="relative aspect-square overflow-hidden rounded-lg border border-gray-200 hover:border-teal-blue/50 transition-colors focus:ring-2 focus:ring-lime-green focus:ring-offset-2 group"
            whileHover={prefersReducedMotion ? undefined : { scale: 1.03 }}
            transition={{ duration: 0.2 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc(img, true)}
              alt={img.alt}
              width={THUMB_WIDTH}
              height={THUMB_WIDTH}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              decoding="async"
            />
          </motion.button>
        ))}
      </div>

      {hasMore && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore}
            className="px-6 py-3 rounded-lg font-semibold bg-teal-blue text-white hover:bg-teal-blue/90 transition-colors disabled:opacity-60"
          >
            {loadingMore ? "Loading…" : `Load more (${images.length} of ${total})`}
          </button>
        </div>
      )}

      <AnimatePresence>
        {lightboxPath && (
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.25 }}
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
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="relative max-w-4xl w-full aspect-[3/2]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lightboxSrc}
                alt="Prefect Summit 2025"
                className="w-full h-full object-contain"
                loading="eager"
                decoding="async"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export type { GalleryImageItem };
