import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { getStoragePublicUrl } from "@/lib/gallery-source";
import { createClient } from "@/lib/supabase/server";

const GALLERY_ROOT = path.join(process.cwd(), "docs and photos");
const THUMB_MAX_WIDTH = 800;
const CACHE_AGE = "public, max-age=86400, s-maxage=86400"; // 1 day

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".JPG": "image/jpeg",
  ".JPEG": "image/jpeg",
  ".PNG": "image/png",
};

/** Fetch image from Storage URL and optionally resize. */
async function fetchAndResizeStorageImage(
  storageUrl: string,
  maxWidth: number
): Promise<{ buffer: Buffer; mime: string } | null> {
  try {
    const res = await fetch(storageUrl, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    const arr = await res.arrayBuffer();
    const buf = Buffer.from(arr);
    const resized = await sharp(buf)
      .resize(maxWidth, null, { withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();
    return { buffer: resized, mime: "image/jpeg" };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const pathParam = request.nextUrl.searchParams.get("path");
  const widthParam = request.nextUrl.searchParams.get("w");
  if (!pathParam) {
    return NextResponse.json({ error: "Missing path" }, { status: 400 });
  }
  const resolved = path.resolve(GALLERY_ROOT, pathParam);
  const onDisk = fs.existsSync(resolved) && fs.statSync(resolved).isFile() && resolved.startsWith(GALLERY_ROOT);
  const wantThumb = widthParam != null;
  const maxWidth = wantThumb ? Math.min(Number(widthParam) || THUMB_MAX_WIDTH, 1600) : 0;

  if (!onDisk) {
    const storageUrl = await getStoragePublicUrl(pathParam, () => createClient());
    if (!storageUrl) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (maxWidth > 0) {
      const result = await fetchAndResizeStorageImage(storageUrl, maxWidth);
      if (result) {
        return new NextResponse(new Uint8Array(result.buffer), {
          headers: { "Content-Type": result.mime, "Cache-Control": CACHE_AGE },
        });
      }
    }
    return NextResponse.redirect(storageUrl, 302);
  }

  const ext = path.extname(resolved);
  const mime = MIME[ext] || "application/octet-stream";

  if (maxWidth > 0) {
    try {
      const buf = fs.readFileSync(resolved);
      const resized = await sharp(buf)
        .resize(maxWidth, null, { withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();
      return new NextResponse(new Uint8Array(resized), {
        headers: { "Content-Type": "image/jpeg", "Cache-Control": CACHE_AGE },
      });
    } catch {
      // Fall through to full-size serve
    }
  }

  const buf = fs.readFileSync(resolved);
  return new NextResponse(new Uint8Array(buf), {
    headers: { "Content-Type": mime, "Cache-Control": CACHE_AGE },
  });
}
