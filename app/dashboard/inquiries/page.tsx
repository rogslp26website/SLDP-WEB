import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getAdminUserId } from "@/lib/admin";
import DashboardInquiriesClient from "./DashboardInquiriesClient";

export default async function DashboardInquiriesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");
  const adminId = await getAdminUserId();
  if (!adminId) redirect("/dashboard");

  const service = createServiceClient();
  const { data: submissions } = await service
    .from("contact_submissions")
    .select("id, full_name, school_organization, role, role_other, phone, email, message, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h2 className="text-xl font-semibold text-teal-blue mb-4">Incoming Inquiries</h2>
      <p className="text-gray-600 mb-6">Contact form submissions from the website. Use Clear once an enquiry has been responded to.</p>
      {!submissions?.length ? (
        <p className="text-gray-500">No contact submissions yet.</p>
      ) : (
        <DashboardInquiriesClient initialSubmissions={submissions} />
      )}
    </div>
  );
}
