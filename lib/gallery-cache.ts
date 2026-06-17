/**
 * Server-only: cached gallery list for faster admin and public listing.
 * Use revalidateGalleryList() after upload/delete so next request gets fresh data.
 */
import { unstable_cache, revalidateTag } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { listFromStorage, type GalleryImageItem } from "@/lib/gallery-source";

const CACHE_KEY = ["gallery-list"];
const CACHE_TAG = "gallery-list";
const REVALIDATE_SECONDS = 60;

async function fetchGalleryList(): Promise<GalleryImageItem[] | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  try {
    return listFromStorage(() => Promise.resolve(createServiceClient()));
  } catch {
    return null;
  }
}

/** Cached gallery list (revalidates every 60s or when tag is revalidated). */
export async function getCachedGalleryList(): Promise<GalleryImageItem[] | null> {
  return unstable_cache(fetchGalleryList, CACHE_KEY, {
    revalidate: REVALIDATE_SECONDS,
    tags: [CACHE_TAG],
  })();
}

/** Call after upload or delete so the next GET returns fresh list. */
export function revalidateGalleryList(): void {
  revalidateTag(CACHE_TAG);
}
