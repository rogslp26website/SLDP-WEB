export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getCachedGalleryList } from "@/lib/gallery-cache";

const GALLERY_ROOT = path.join(process.cwd(), "docs and photos");
const IMG_EXT = new Set([".jpg", ".jpeg", ".png", ".JPG", ".JPEG", ".PNG"]);
const DUPLICATE_PATTERN = /\(\d+\)/;

function listImages(dir: string, baseDir: string): string[] {
  const out: string[] = [];
  if (!fs.existsSync(dir)) return out;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    const rel = path.relative(baseDir, full);
    if (e.isDirectory()) {
      out.push(...listImages(full, baseDir));
    } else if (e.isFile()) {
      const ext = path.extname(e.name);
      if (IMG_EXT.has(ext) && !DUPLICATE_PATTERN.test(e.name)) {
        out.push(rel.replace(/\\/g, "/"));
      }
    }
  }
  return out;
}

export async function GET() {
  try {
    // Prefer cached Supabase Storage list (fast for both public and admin)
    const storageImages = await getCachedGalleryList();
    if (storageImages?.length) {
      const res = NextResponse.json({ images: storageImages });
      res.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
      return res;
    }
    // Fallback: local "docs and photos" (e.g. dev)
    const paths = listImages(GALLERY_ROOT, GALLERY_ROOT);
    const images = paths.map((p, i) => ({
      id: String(i + 1),
      path: p,
      alt: "Prefect Summit 2025",
    }));
    return NextResponse.json({ images });
  } catch (err) {
    console.error("Gallery list error:", err);
    return NextResponse.json(
      { error: "Failed to list gallery" },
      { status: 500 }
    );
  }
}
