import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getAdminUserId } from "@/lib/admin";
import { getCachedGalleryList, revalidateGalleryList } from "@/lib/gallery-cache";

const BUCKET =
  process.env.NEXT_PUBLIC_GALLERY_BUCKET ?? "Gallery";

const IMG_EXT = new Set([".jpg", ".jpeg", ".png", ".JPG", ".JPEG", ".PNG"]);

function isImageName(name: string): boolean {
  const ext = name.includes(".") ? name.substring(name.lastIndexOf(".")) : "";
  return IMG_EXT.has(ext);
}

/** GET: return cached gallery list (admin only). */
export async function GET() {
  const adminId = await getAdminUserId();
  if (!adminId) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  const images = await getCachedGalleryList();
  const res = NextResponse.json({
    images: images ?? [],
  });
  res.headers.set("Cache-Control", "private, s-maxage=60, stale-while-revalidate=30");
  return res;
}

/** POST: upload one or more images (admin only). */
export async function POST(request: Request) {
  const adminId = await getAdminUserId();
  if (!adminId) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const formData = await request.formData();
  const files = formData.getAll("file") as File[];
  const toUpload = files.filter((f) => f && f.size > 0 && isImageName(f.name));
  if (!toUpload.length) {
    return NextResponse.json(
      { error: "Select at least one image (jpg/png)." },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();
  const uploaded: string[] = [];
  for (const file of toUpload) {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const storagePath = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
    const arrayBuffer = await file.arrayBuffer();
    const { error } = await supabase.storage.from(BUCKET).upload(storagePath, arrayBuffer, {
      contentType: file.type || `image/${ext}`,
      upsert: false,
    });
    if (error) {
      for (const path of uploaded) {
        await supabase.storage.from(BUCKET).remove([path]);
      }
      return NextResponse.json(
        { error: error.message || "Upload failed." },
        { status: 500 }
      );
    }
    uploaded.push(storagePath);
  }

  revalidateGalleryList();
  const list = await getCachedGalleryList();
  return NextResponse.json({
    success: true,
    images: list ?? [],
  });
}

/** DELETE: remove one image by path (admin only). */
export async function DELETE(request: Request) {
  const adminId = await getAdminUserId();
  if (!adminId) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");
  if (!path || path.includes("..")) {
    return NextResponse.json({ error: "Invalid path." }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) {
    return NextResponse.json(
      { error: error.message || "Delete failed." },
      { status: 500 }
    );
  }
  revalidateGalleryList();
  return NextResponse.json({ success: true });
}
