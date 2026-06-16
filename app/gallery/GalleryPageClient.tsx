"use client";

import { useState, useEffect } from "react";
import GalleryGrid, { type GalleryImageItem } from "@/components/GalleryGrid";

/** Client-side fetch when server has no Storage images (e.g. local dev with "docs and photos"). */
export default function GalleryPageClient() {
  const [images, setImages] = useState<GalleryImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/gallery/list")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load gallery");
        return res.json();
      })
      .then((data) => setImages(data.images ?? []))
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
        No gallery images found. Add photos to the Gallery bucket or docs and photos folder.
      </p>
    );
  }
  return <GalleryGrid images={images} />;
}
