import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getAdminUserId } from "@/lib/admin";

const BUCKET = "notice-attachments";

/** GET: redirect to a signed URL for the notice attachment (admin only). Query: key=storage_key */
export async function GET(request: Request) {
  const adminId = await getAdminUserId();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  if (!key || key.includes("..")) return NextResponse.json({ error: "Invalid key" }, { status: 400 });

  const service = createServiceClient();
  const { data, error } = await service.storage.from(BUCKET).createSignedUrl(key, 60);
  if (error || !data?.signedUrl) return NextResponse.json({ error: "Failed to get download link" }, { status: 500 });
  return NextResponse.redirect(data.signedUrl);
}
