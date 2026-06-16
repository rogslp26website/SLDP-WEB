import { createServiceClient } from "@/lib/supabase/server";
import { listFromStorage } from "@/lib/gallery-source";
import GalleryGrid from "@/components/GalleryGrid";
import GalleryPageClient from "./GalleryPageClient";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const images = await listFromStorage(() => Promise.resolve(createServiceClient()));
  const list = images ?? [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {list.length > 0 ? (
        <GalleryGrid images={list} />
      ) : (
        <GalleryPageClient />
      )}
    </div>
  );
}
