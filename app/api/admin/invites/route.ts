import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getAdminUserId } from "@/lib/admin";
import { randomUUID } from "crypto";

const APPROVER_EMAIL = process.env.APPROVER_EMAIL || "leokimandula@gmail.com";

/** GET: list pending admin approval requests (for approver) and optionally invite tokens */
export async function GET() {
  const adminId = await getAdminUserId();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isApprover = user?.email?.toLowerCase() === APPROVER_EMAIL.toLowerCase();
  const service = createServiceClient();

  const { data: requests } = await service
    .from("admin_approval_requests")
    .select("id, token, requested_by, status, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const userIds = Array.from(new Set((requests ?? []).map((r) => r.requested_by)));
  const users: Record<string, { email: string }> = {};
  if (userIds.length > 0) {
    const { data: authData } = await service.auth.admin.listUsers();
    for (const u of authData?.users ?? []) {
      if (userIds.includes(u.id)) users[u.id] = { email: u.email ?? "" };
    }
  }

  const withEmail = (requests ?? []).map((r) => ({ ...r, requested_by_email: users[r.requested_by]?.email ?? "" }));

  return NextResponse.json({
    pendingRequests: withEmail,
    canApprove: isApprover,
  });
}

/** POST: create invite link (any admin). Returns { link, token }. */
export async function POST() {
  const adminId = await getAdminUserId();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const token = randomUUID();
  const service = createServiceClient();
  const { error } = await service.from("admin_invite_tokens").insert({
    token,
    created_by: adminId,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const origin = process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : process.env.NEXTAUTH_URL || "http://localhost:3000";
  return NextResponse.json({ link: `${origin}/admin-join?token=${token}`, token });
}
