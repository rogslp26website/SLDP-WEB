/**
 * Gallery image source: Supabase Storage (for production/Vercel) or local "docs and photos" (dev).
 * When using Storage, list and image routes use the bucket from NEXT_PUBLIC_GALLERY_BUCKET or "gallery".
 */

const BUCKET =
  typeof process !== "undefined" && process.env?.NEXT_PUBLIC_GALLERY_BUCKET
    ? process.env.NEXT_PUBLIC_GALLERY_BUCKET
    : "Gallery";
const IMG_EXT = new Set([".jpg", ".jpeg", ".png", ".JPG", ".JPEG", ".PNG"]);
const DUPLICATE_PATTERN = /\(\d+\)/;

export interface GalleryImageItem {
  id: string;
  path: string;
  alt: string;
  url?: string; // when from Supabase Storage, use this for src
}

function isImageName(name: string): boolean {
  const ext = name.includes(".") ? name.substring(name.lastIndexOf(".")) : "";
  return IMG_EXT.has(ext) && !DUPLICATE_PATTERN.test(name);
}

/** List image objects from Supabase Storage bucket "gallery". Returns null if Storage not configured or bucket empty. */
export async function listFromStorage(
  getSupabase: () => Promise<{ storage: { from: (b: string) => { list: (path?: string) => Promise<{ data: { name: string }[] | null }>; getPublicUrl: (path: string) => { data: { publicUrl: string } } } } }>
): Promise<GalleryImageItem[] | null> {
  try {
    const supabase = await getSupabase();
    const paths = await listStorageRecursive(supabase, "");
    if (!paths.length) return null;

    const sorted = [...paths].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
    const images: GalleryImageItem[] = sorted.map((pathName, i) => ({
      id: String(i + 1),
      path: pathName,
      alt: "Prefect Summit 2025",
      url: supabase.storage.from(BUCKET).getPublicUrl(pathName).data.publicUrl,
    }));
    return images;
  } catch {
    return null;
  }
}

async function listStorageRecursive(
  supabase: { storage: { from: (b: string) => { list: (path?: string) => Promise<{ data: { name: string }[] | null }> } } },
  folderPath: string
): Promise<string[]> {
  const { data } = await supabase.storage.from(BUCKET).list(folderPath);
  if (!data?.length) return [];
  const files: string[] = [];
  for (const f of data) {
    const name = f.name;
    if (!name || name.startsWith(".")) continue;
    const fullPath = folderPath ? `${folderPath}/${name}` : name;
    if (isImageName(name)) files.push(fullPath);
    else files.push(...(await listStorageRecursive(supabase, fullPath)));
  }
  return files;
}

/** Get public URL for a path in the Storage bucket. */
export async function getStoragePublicUrl(
  path: string,
  getSupabase: () => Promise<{ storage: { from: (b: string) => { getPublicUrl: (path: string) => { data: { publicUrl: string } } } } }>
): Promise<string | null> {
  try {
    const supabase = await getSupabase();
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl ?? null;
  } catch {
    return null;
  }
}
