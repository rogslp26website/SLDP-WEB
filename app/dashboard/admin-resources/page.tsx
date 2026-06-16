import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { getAdminUserId } from "@/lib/admin";
import DashboardAdminResourcesClient from "./DashboardAdminResourcesClient";

export default async function DashboardAdminResourcesPage() {
  const adminId = await getAdminUserId();
  if (!adminId) redirect("/dashboard");

  const service = createServiceClient();
  const { data: rows } = await service
    .from("admin_resources")
    .select("id, title, description, storage_key, file_label, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h2 className="text-xl font-semibold text-teal-blue mb-4">Admin Resources</h2>
      <p className="text-gray-600 mb-8">
        Files for admin use only. Any admin can upload and view these; they are not visible to programme users.
      </p>
      <DashboardAdminResourcesClient initialResources={rows ?? []} />
    </div>
  );
}
