import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getAdminUserId } from "@/lib/admin";

const BUCKET = process.env.BUCKET_ADMIN_RESOURCES ?? "admin-resources";
const TABLE = "admin_resources";

function sanitize(value: unknown, max = 500): string {
  if (value == null || typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

export async function GET() {
  const adminId = await getAdminUserId();
  if (!adminId) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const supabase = createServiceClient();
  const { data: rows, error } = await supabase
    .from(TABLE)
    .select("id, title, description, storage_key, file_label, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(rows ?? []);
}

export async function POST(request: Request) {
  const adminId = await getAdminUserId();
  if (!adminId) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const title = sanitize(formData.get("title"), 200);
  const description = sanitize(formData.get("description"), 1000);
  const fileLabel = sanitize(formData.get("file_label"), 50);

  if (!file || file.size === 0) {
    return NextResponse.json({ error: "File is required." }, { status: 400 });
  }
  if (!title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  const ext = file.name.split(".").pop() ?? "bin";
  const storageKey = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;

  const supabase = createServiceClient();
  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storageKey, arrayBuffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json(
      { error: uploadError.message || "Upload failed. Ensure the storage bucket 'admin-resources' exists." },
      { status: 500 }
    );
  }

  const { data: row, error: insertError } = await supabase
    .from(TABLE)
    .insert({
      title,
      description: description || null,
      storage_key: storageKey,
      file_label: fileLabel || null,
    })
    .select("id")
    .single();

  if (insertError) {
    await supabase.storage.from(BUCKET).remove([storageKey]);
    return NextResponse.json(
      { error: insertError.message || "Failed to save admin resource." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, id: row?.id });
}
