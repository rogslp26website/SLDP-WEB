import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getAdminUserId } from "@/lib/admin";

const APPROVER_EMAIL = process.env.APPROVER_EMAIL || "leokimandula@gmail.com";

/** POST: approve or reject admin request. Only approver (leokimandula@gmail.com) can. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminId = await getAdminUserId();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email?.toLowerCase() !== APPROVER_EMAIL.toLowerCase()) {
    return NextResponse.json({ error: "Only the designated approver can approve or reject requests." }, { status: 403 });
  }

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const body = await request.json().catch(() => ({}));
  const action = body.action === "reject" ? "rejected" : "approved";

  const service = createServiceClient();
  const { data: reqRow, error: fetchErr } = await service
    .from("admin_approval_requests")
    .select("id, requested_by, status")
    .eq("id", id)
    .single();
  if (fetchErr || !reqRow || reqRow.status !== "pending") {
    return NextResponse.json({ error: "Request not found or already processed." }, { status: 400 });
  }

  const { error: updateErr } = await service
    .from("admin_approval_requests")
    .update({
      status: action,
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  if (action === "approved") {
    const { error: insertErr } = await service.from("salt_hub_admins").insert({ auth_user_id: reqRow.requested_by });
    if (insertErr && insertErr.code !== "23505") return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, action });
}
