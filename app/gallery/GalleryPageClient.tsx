"use client";

import { useState, useEffect } from "react";
import GalleryGrid, { type GalleryImageItem } from "@/components/GalleryGrid";

const PAGE_SIZE = 24;

/**
 * Client fallback when the server manifest is empty (e.g. local dev without Storage).
 * Fetches paginated metadata only — images load from CDN via thumbUrl when available.
 */
export default function GalleryPageClient() {
  const [images, setImages] = useState<GalleryImageItem[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/gallery/list?offset=0&limit=${PAGE_SIZE}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load gallery");
        return res.json();
      })
      .then((data) => {
        setImages(data.images ?? []);
        setTotal(data.total ?? data.images?.length ?? 0);
        setHasMore(!!data.hasMore);
      })
      .catch(() => setError("Could not load gallery images."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-center text-gray-600 py-12">Loading gallery…</p>;
  }
  if (error) {
    return <p className="text-center text-red-600 py-12">{error}</p>;
  }
  if (images.length === 0) {
    return (
      <p className="text-gray-600 text-center py-12">
        No gallery images found. Upload photos to the{" "}
        <strong>Gallery</strong> bucket in Supabase Storage (check{" "}
        <code className="text-sm">NEXT_PUBLIC_GALLERY_BUCKET</code> matches the bucket
        name exactly).
      </p>
    );
  }

  return (
    <GalleryGrid
      initialImages={images}
      total={total}
      initialHasMore={hasMore}
      pageSize={PAGE_SIZE}
    />
  );
}
