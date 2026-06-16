import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getAdminUserId } from "@/lib/admin";

const BUCKET = "notice-attachments";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminId = await getAdminUserId();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const service = createServiceClient();
  const { data: attachments } = await service.from("notice_attachments").select("storage_key").eq("notice_id", id);
  if (attachments?.length) {
    await service.storage.from(BUCKET).remove(attachments.map((a) => a.storage_key));
  }
  await service.from("notice_attachments").delete().eq("notice_id", id);
  await service.from("notice_schools").delete().eq("notice_id", id);
  const { error } = await service.from("notices").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
