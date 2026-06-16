import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getAdminUserId } from "@/lib/admin";

/** GET: list teachers (SALT Coordinators) and admins for "promote to facilitator" (admin only). */
export async function GET() {
  const adminId = await getAdminUserId();
  if (!adminId) return NextResponse.json({ error: "Forbidden. Admins only." }, { status: 403 });

  const service = createServiceClient();

  const [teachersRes, adminsRes, facilitatorsRes] = await Promise.all([
    service.from("teachers").select("id, name, email").order("name"),
    service.from("salt_hub_admins").select("auth_user_id").order("auth_user_id"),
    service.from("facilitators").select("id, email").not("email", "is", null),
  ]);

  const teachers = teachersRes.data ?? [];
  const adminUserIds = (adminsRes.data ?? []).map((r) => r.auth_user_id);
  const facilitatorEmails = new Set((facilitatorsRes.data ?? []).map((r) => (r.email ?? "").toLowerCase()));

  let adminsList: { id: string; email: string; full_name: string }[] = [];
  if (adminUserIds.length > 0) {
    const { data: profiles } = await service
      .from("profiles")
      .select("auth_user_id, full_name")
      .in("auth_user_id", adminUserIds);
    const { data: authData } = await service.auth.admin.listUsers();
    const authUsers = authData?.users ?? [];
    const byId = authUsers.reduce((acc: Record<string, { email: string }>, u) => {
      acc[u.id] = { email: u.email ?? "" };
      return acc;
    }, {});
    const byProfile = (profiles ?? []).reduce((acc: Record<string, string>, p) => {
      acc[p.auth_user_id] = p.full_name ?? "";
      return acc;
    }, {});
    adminsList = adminUserIds.map((uid) => ({
      id: uid,
      email: byId[uid]?.email ?? "",
      full_name: byProfile[uid] || byId[uid]?.email || uid,
    }));
  }

  return NextResponse.json({
    teachers: teachers.map((t) => ({ id: t.id, name: t.name, email: t.email ?? "" })),
    admins: adminsList,
    facilitatorEmails: Array.from(facilitatorEmails),
  });
}
