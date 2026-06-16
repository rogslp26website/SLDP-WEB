import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import DashboardResourcesClient from "./DashboardResourcesClient";

export default async function DashboardResourcesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const service = createServiceClient();
  const { data: rows } = await service
    .from("resources")
    .select("id, title, description, storage_key, file_label, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h2 className="text-xl font-semibold text-teal-blue mb-4">Resource Management</h2>
      <p className="text-gray-600 mb-8">Upload and remove programme resources.</p>
      <DashboardResourcesClient initialResources={rows ?? []} />
    </div>
  );
}
