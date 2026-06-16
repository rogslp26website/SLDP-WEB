import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminUserId } from "@/lib/admin";
import { getCachedGalleryList } from "@/lib/gallery-cache";
import DashboardMediaClient from "./DashboardMediaClient";

export default async function DashboardMediaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");
  const adminId = await getAdminUserId();
  if (!adminId) redirect("/dashboard");

  const images = (await getCachedGalleryList()) ?? [];

  return (
    <div>
      <h2 className="text-xl font-semibold text-teal-blue mb-4">Media Management</h2>
      <p className="text-gray-600 mb-6">Upload and remove gallery images (Gallery bucket).</p>
      <DashboardMediaClient initialImages={images} />
    </div>
  );
}
