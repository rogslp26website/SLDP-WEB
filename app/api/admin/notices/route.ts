import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getAdminUserId } from "@/lib/admin";

const BUCKET = "notice-attachments";
const BODY_MAX = 50000;
const TITLE_MAX = 200;

export async function GET() {
  const adminId = await getAdminUserId();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const service = createServiceClient();
  const { data: notices, error } = await service
    .from("notices")
    .select("id, title, body, scope, created_at")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const [schoolsRes, attachmentsRes] = await Promise.all([
    service.from("notice_schools").select("notice_id, school_id"),
    service.from("notice_attachments").select("id, notice_id, storage_key, file_name, content_type"),
  ]);
  const byNotice: Record<string, string[]> = {};
  for (const r of schoolsRes.data ?? []) {
    if (!byNotice[r.notice_id]) byNotice[r.notice_id] = [];
    byNotice[r.notice_id].push(r.school_id);
  }
  const attachmentsByNotice: Record<string, { id: string; storage_key: string; file_name: string; content_type: string | null }[]> = {};
  for (const a of attachmentsRes.data ?? []) {
    if (!attachmentsByNotice[a.notice_id]) attachmentsByNotice[a.notice_id] = [];
    attachmentsByNotice[a.notice_id].push({
      id: a.id,
      storage_key: a.storage_key,
      file_name: a.file_name,
      content_type: a.content_type ?? null,
    });
  }
  const withSchools = (notices ?? []).map((n) => ({
    ...n,
    school_ids: byNotice[n.id] ?? [],
    attachments: attachmentsByNotice[n.id] ?? [],
  }));
  return NextResponse.json({ notices: withSchools });
}

function parseSchoolIds(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((id: unknown) => typeof id === "string");
  if (typeof value === "string") {
    try {
      const arr = JSON.parse(value) as unknown;
      return Array.isArray(arr) ? arr.filter((id: unknown) => typeof id === "string") : [];
    } catch {
      return [];
    }
  }
  return [];
}

export async function POST(request: Request) {
  const adminId = await getAdminUserId();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contentType = request.headers.get("content-type") ?? "";
  let title = "";
  let bodyText = "";
  let scope: "general" | "schools" = "general";
  let schoolIds: string[] = [];
  const files: File[] = [];

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    title = typeof formData.get("title") === "string" ? formData.get("title") as string : "";
    bodyText = typeof formData.get("body") === "string" ? formData.get("body") as string : "";
    scope = formData.get("scope") === "schools" ? "schools" : "general";
    schoolIds = parseSchoolIds(formData.get("school_ids"));
    const attachments = formData.getAll("attachments");
    for (const a of attachments) {
      if (a instanceof File && a.size > 0) files.push(a);
    }
  } else {
    const body = await request.json().catch(() => ({}));
    title = typeof body.title === "string" ? body.title.trim().slice(0, TITLE_MAX) : "";
    bodyText = typeof body.body === "string" ? body.body.trim().slice(0, BODY_MAX) : "";
    scope = body.scope === "schools" ? "schools" : "general";
    schoolIds = Array.isArray(body.school_ids) ? body.school_ids.filter((id: unknown) => typeof id === "string") : [];
  }

  title = title.trim().slice(0, TITLE_MAX);
  bodyText = bodyText.trim().slice(0, BODY_MAX);
  if (!title || !bodyText) return NextResponse.json({ error: "Title and body required." }, { status: 400 });

  const service = createServiceClient();
  const { data: notice, error: insertError } = await service
    .from("notices")
    .insert({ title, body: bodyText, scope, created_by: adminId })
    .select("id")
    .single();
  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
  if (scope === "schools" && schoolIds.length > 0 && notice?.id) {
    await service.from("notice_schools").insert(schoolIds.map((school_id: string) => ({ notice_id: notice.id, school_id })));
  }

  if (notice?.id && files.length > 0) {
    for (const file of files) {
      const ext = file.name.split(".").pop()?.replace(/[^a-z0-9]/gi, "") ?? "bin";
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
      const storageKey = `${notice.id}/${Date.now()}-${Math.random().toString(36).slice(2, 9)}-${safeName}`;
      const arrayBuffer = await file.arrayBuffer();
      const { error: uploadError } = await service.storage.from(BUCKET).upload(storageKey, arrayBuffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });
      if (!uploadError) {
        await service.from("notice_attachments").insert({
          notice_id: notice.id,
          storage_key: storageKey,
          file_name: file.name,
          content_type: file.type || null,
        });
      }
    }
  }

  return NextResponse.json({ id: notice?.id });
}
