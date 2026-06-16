import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getAdminUserId } from "@/lib/admin";
import DashboardUsersClient from "./DashboardUsersClient";

export default async function DashboardUsersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");
  const adminId = await getAdminUserId();
  if (!adminId) redirect("/dashboard");

  const service = createServiceClient();
  const { data: profiles } = await service
    .from("profiles")
    .select("id, auth_user_id, full_name, role, school_id, county, phone, availability_notes, prior_notice_duration, created_at")
    .order("created_at", { ascending: false });

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

  return (
    <div>
      <h2 className="text-xl font-semibold text-teal-blue mb-4">User Management</h2>
      <p className="text-gray-600 mb-6">Users who have signed up and completed onboarding. Change role or remove users.</p>
      {!withSchoolName.length ? (
        <p className="text-gray-500">No profiles yet.</p>
      ) : (
        <DashboardUsersClient initialProfiles={withSchoolName} />
      )}
    </div>
  );
}
