/**
 * Gallery image source: Supabase Storage (production) or local "docs and photos" (dev).
 * Bucket name from NEXT_PUBLIC_GALLERY_BUCKET (default "Gallery").
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export const GALLERY_BUCKET =
  typeof process !== "undefined" && process.env?.NEXT_PUBLIC_GALLERY_BUCKET
    ? process.env.NEXT_PUBLIC_GALLERY_BUCKET
    : "Gallery";

const IMG_EXT = new Set([".jpg", ".jpeg", ".png", ".JPG", ".JPEG", ".PNG"]);
const DUPLICATE_PATTERN = /\(\d+\)/;
const LIST_PAGE_SIZE = 1000;

export interface GalleryImageItem {
  id: string;
  path: string;
  alt: string;
  /** Full-size public Storage URL (when from Supabase). */
  url?: string;
  /** Resized thumbnail URL via Supabase render (when from Supabase). */
  thumbUrl?: string;
}

export function encodeStoragePath(storagePath: string): string {
  return storagePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

/** Public object URL — no Next.js proxy. */
export function buildGalleryPublicUrl(storagePath: string): string | undefined {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return undefined;
  return `${base}/storage/v1/object/public/${GALLERY_BUCKET}/${encodeStoragePath(storagePath)}`;
}

/** Thumbnail via Supabase image render API — avoids sharp proxy on every thumb. */
export function buildGalleryThumbUrl(
  storagePath: string,
  width = 400,
  quality = 80
): string | undefined {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return undefined;
  const params = new URLSearchParams({
    width: String(width),
    quality: String(quality),
  });
  return `${base}/storage/v1/render/image/public/${GALLERY_BUCKET}/${encodeStoragePath(storagePath)}?${params}`;
}

function isImageName(name: string): boolean {
  const ext = name.includes(".") ? name.substring(name.lastIndexOf(".")) : "";
  return IMG_EXT.has(ext) && !DUPLICATE_PATTERN.test(name);
}

function isStorageFolder(entry: { name: string; id: string | null }): boolean {
  if (entry.id === null) return true;
  if (!entry.name.includes(".")) return true;
  return false;
}

function enrichImage(pathName: string, index: number): GalleryImageItem {
  return {
    id: String(index + 1),
    path: pathName,
    alt: "Prefect Summit 2025",
    url: buildGalleryPublicUrl(pathName),
    thumbUrl: buildGalleryThumbUrl(pathName, 400),
  };
}

/** List image objects from Supabase Storage. Returns null if not configured or on failure. */
export async function listFromStorage(
  getSupabase: () => Promise<SupabaseClient>
): Promise<GalleryImageItem[] | null> {
  try {
    const supabase = await getSupabase();
    const paths = await listStorageRecursive(supabase, "");
    if (!paths.length) {
      console.warn("[gallery] Storage bucket is empty or no images matched:", GALLERY_BUCKET);
      return null;
    }

    const sorted = [...paths].sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" })
    );
    return sorted.map((pathName, i) => enrichImage(pathName, i));
  } catch (err) {
    console.error("[gallery] listFromStorage failed:", err);
    return null;
  }
}

async function listStorageRecursive(
  supabase: SupabaseClient,
  folderPath: string
): Promise<string[]> {
  const files: string[] = [];
  let offset = 0;

  while (true) {
    const { data, error } = await supabase.storage
      .from(GALLERY_BUCKET)
      .list(folderPath, {
        limit: LIST_PAGE_SIZE,
        offset,
        sortBy: { column: "name", order: "asc" },
      });

    if (error) {
      console.error(
        "[gallery] storage.list error:",
        GALLERY_BUCKET,
        folderPath || "/",
        error.message
      );
      throw error;
    }

    if (!data?.length) break;

    for (const entry of data) {
      const name = entry.name;
      if (!name || name.startsWith(".")) continue;

      const fullPath = folderPath ? `${folderPath}/${name}` : name;

      if (isImageName(name)) {
        files.push(fullPath);
        continue;
      }

      if (isStorageFolder(entry)) {
        files.push(...(await listStorageRecursive(supabase, fullPath)));
      }
    }

    if (data.length < LIST_PAGE_SIZE) break;
    offset += LIST_PAGE_SIZE;
  }

  return files;
}

/** Get public URL for a path in the Storage bucket. */
export async function getStoragePublicUrl(
  path: string,
  getSupabase: () => Promise<SupabaseClient>
): Promise<string | null> {
  const direct = buildGalleryPublicUrl(path);
  if (direct) return direct;
  try {
    const supabase = await getSupabase();
    const { data } = supabase.storage.from(GALLERY_BUCKET).getPublicUrl(path);
    return data.publicUrl ?? null;
  } catch {
    return null;
  }
}

/** Slice a cached full list for paginated API / client loads. */
export function paginateGalleryImages(
  images: GalleryImageItem[],
  offset = 0,
  limit = 24
): { images: GalleryImageItem[]; total: number; hasMore: boolean } {
  const total = images.length;
  const slice = images.slice(offset, offset + limit);
  return {
    images: slice,
    total,
    hasMore: offset + slice.length < total,
  };
}
