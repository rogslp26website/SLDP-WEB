import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getAdminUserId } from "@/lib/admin";

/** GET: admin list all profiles (for user management) */
export async function GET() {
  const adminId = await getAdminUserId();
  if (!adminId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const service = createServiceClient();
  const { data: profiles, error } = await service
    .from("profiles")
    .select("id, auth_user_id, full_name, role, school_id, county, phone, alma_mater, how_heard, availability_notes, prior_notice_duration, field_of_practice, onboarding_completed_at, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const schoolIds = Array.from(new Set((profiles ?? []).map((p) => p.school_id).filter(Boolean))) as string[];
  let schoolMap: Record<string, string> = {};
  if (schoolIds.length > 0) {
    const { data: schools } = await service.from("schools").select("id, name").in("id", schoolIds);
    schoolMap = Object.fromEntries((schools ?? []).map((s) => [s.id, s.name]));
  }

  const withSchoolName = (profiles ?? []).map((p) => ({
    ...p,
    school_name: p.school_id ? schoolMap[p.school_id] ?? null : null,
  }));

  return NextResponse.json({ profiles: withSchoolName });
}
