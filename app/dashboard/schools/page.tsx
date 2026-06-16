import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getAdminUserId } from "@/lib/admin";
import DashboardSchoolsClient from "./DashboardSchoolsClient";

export default async function DashboardSchoolsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");
  const adminId = await getAdminUserId();
  if (!adminId) redirect("/dashboard");

  const service = createServiceClient();
  const { data: schools } = await service
    .from("schools")
    .select("id, name, created_at")
    .order("name");

  return (
    <div>
      <h2 className="text-xl font-semibold text-teal-blue mb-4">Register School</h2>
      <p className="text-gray-600 mb-6">Add and manage partner schools. Students can only select from this list when registering.</p>
      <DashboardSchoolsClient initialSchools={schools ?? []} />
    </div>
  );
}
