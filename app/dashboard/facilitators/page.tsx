import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getAdminUserId } from "@/lib/admin";
import DashboardFacilitatorsClient from "./DashboardFacilitatorsClient";

export default async function DashboardFacilitatorsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");
  const adminId = await getAdminUserId();
  if (!adminId) redirect("/dashboard");

  const service = createServiceClient();
  const { data: facilitators } = await service
    .from("facilitators")
    .select("id, name, email, phone")
    .order("name");

  return (
    <div>
      <h2 className="text-xl font-semibold text-teal-blue mb-4">Facilitators</h2>
      <p className="text-gray-600 mb-6">
        Manage who can be assigned to calendar events. Add facilitators manually, or promote SALT Coordinators and admins to dual-role facilitator. The list here appears in the Calendar event dropdown.
      </p>
      <DashboardFacilitatorsClient initialFacilitators={facilitators ?? []} />
    </div>
  );
}
