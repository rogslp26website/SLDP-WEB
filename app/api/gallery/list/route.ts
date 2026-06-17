export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getCachedGalleryList } from "@/lib/gallery-cache";
import { paginateGalleryImages } from "@/lib/gallery-source";

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

function parsePagination(request: NextRequest) {
  const offset = Math.max(0, Number(request.nextUrl.searchParams.get("offset") ?? 0) || 0);
  const limitParam = request.nextUrl.searchParams.get("limit");
  const limit = limitParam
    ? Math.min(Math.max(1, Number(limitParam) || 24), 100)
    : undefined;
  return { offset, limit };
}

export async function GET(request: NextRequest) {
  try {
    const { offset, limit } = parsePagination(request);

    const storageImages = await getCachedGalleryList();
    if (storageImages?.length) {
      const payload = limit
        ? paginateGalleryImages(storageImages, offset, limit)
        : { images: storageImages, total: storageImages.length, hasMore: false };

      const res = NextResponse.json(payload);
      res.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
      return res;
    }

    const paths = listImages(GALLERY_ROOT, GALLERY_ROOT).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" })
    );
    const all = paths.map((p, i) => ({
      id: String(i + 1),
      path: p,
      alt: "Prefect Summit 2025",
    }));
    const payload = limit
      ? paginateGalleryImages(all, offset, limit)
      : { images: all, total: all.length, hasMore: false };

    return NextResponse.json(payload);
  } catch (err) {
    console.error("Gallery list error:", err);
    return NextResponse.json(
      { error: "Failed to list gallery" },
      { status: 500 }
    );
  }
}
