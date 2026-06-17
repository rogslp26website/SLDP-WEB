/**
 * Server-only: cached gallery list for faster admin and public listing.
 * Use revalidateGalleryList() after upload/delete so next request gets fresh data.
 */
import { unstable_cache, revalidateTag } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { listFromStorage, type GalleryImageItem } from "@/lib/gallery-source";

const CACHE_KEY = ["gallery-list"];
const CACHE_TAG = "gallery-list";
/** Cache manifest 5 min — listing paths is cheap once cached; revalidate on admin upload/delete. */
const REVALIDATE_SECONDS = 300;

async function fetchGalleryList(): Promise<GalleryImageItem[] | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn("[gallery] Missing Supabase env for Storage listing");
    return null;
  }
  try {
    return listFromStorage(() => Promise.resolve(createServiceClient()));
  } catch (err) {
    console.error("[gallery] fetchGalleryList failed:", err);
    return null;
  }
}

/** Cached gallery manifest (paths + CDN URLs). Revalidates every 5 min or when tag is revalidated. */
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
