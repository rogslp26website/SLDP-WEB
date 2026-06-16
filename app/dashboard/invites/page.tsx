import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getAdminUserId } from "@/lib/admin";
import DashboardInvitesClient from "./DashboardInvitesClient";

const APPROVER_EMAIL = process.env.APPROVER_EMAIL;

export default async function DashboardInvitesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");
  const adminId = await getAdminUserId();
  if (!adminId) redirect("/dashboard");

  const service = createServiceClient();
  const { data: requests } = await service
    .from("admin_approval_requests")
    .select("id, token, requested_by, status, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const userIds = Array.from(new Set((requests ?? []).map((r) => r.requested_by)));
  const users: Record<string, string> = {};
  if (userIds.length > 0) {
    const { data: authData } = await service.auth.admin.listUsers();
    for (const u of authData?.users ?? []) {
      if (userIds.includes(u.id)) users[u.id] = u.email ?? "";
    }
  }
  const pendingWithEmail = (requests ?? []).map((r) => ({ ...r, requested_by_email: users[r.requested_by] ?? "" }));
  const canApprove = APPROVER_EMAIL ? user.email?.toLowerCase() === APPROVER_EMAIL.toLowerCase() : false;

  return (
    <div>
      <h2 className="text-xl font-semibold text-teal-blue mb-4">Admin Invites</h2>
      <p className="text-gray-600 mb-6">
        Create an invite link to allow someone to request admin access. Requests are subject to approval by the designated approver.
      </p>
      <DashboardInvitesClient pendingRequests={pendingWithEmail} canApprove={canApprove} />
    </div>
  );
}
