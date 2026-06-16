import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

const BUCKET = "notice-attachments";

/** GET: redirect to signed URL for a notice attachment. User must be able to see the notice (portal). */
export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const noticeId = searchParams.get("notice_id");
  const attachmentId = searchParams.get("attachment_id");
  if (!noticeId || !attachmentId) return NextResponse.json({ error: "Missing params" }, { status: 400 });

  const service = createServiceClient();
  const [studentRow, teacherRow] = await Promise.all([
    service.from("students").select("school_id").eq("auth_user_id", user.id).limit(1).single(),
    service.from("teachers").select("school_id").eq("auth_user_id", user.id).limit(1).single(),
  ]);
  const schoolId = studentRow.data?.school_id ?? teacherRow.data?.school_id;
  if (!schoolId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data: notice } = await service.from("notices").select("id, scope").eq("id", noticeId).single();
  if (!notice) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (notice.scope === "general") {
    // allowed
  } else {
    const { data: link } = await service
      .from("notice_schools")
      .select("notice_id")
      .eq("notice_id", noticeId)
      .eq("school_id", schoolId)
      .limit(1)
      .single();
    if (!link) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: att } = await service
    .from("notice_attachments")
    .select("storage_key")
    .eq("id", attachmentId)
    .eq("notice_id", noticeId)
    .single();
  if (!att) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data, error } = await service.storage.from(BUCKET).createSignedUrl(att.storage_key, 60);
  if (error || !data?.signedUrl) return NextResponse.json({ error: "Failed to get download link" }, { status: 500 });
  return NextResponse.redirect(data.signedUrl);
}
