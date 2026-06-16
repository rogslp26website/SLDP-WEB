import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

/** POST: submit admin access request (user must be signed in; token from invite link). */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const token = typeof body.token === "string" ? body.token.trim() : "";
  if (!token) return NextResponse.json({ error: "Token required." }, { status: 400 });

  const service = createServiceClient();
  const { data: tokenRow } = await service
    .from("admin_invite_tokens")
    .select("id")
    .eq("token", token)
    .limit(1)
    .single();
  if (!tokenRow) return NextResponse.json({ error: "Invalid or expired invite link." }, { status: 400 });

  const { error } = await service.from("admin_approval_requests").upsert(
    { token, requested_by: user.id, status: "pending" },
    { onConflict: "token,requested_by" }
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, message: "Your request has been submitted for approval." });
}
