import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getAdminUserId } from "@/lib/admin";

const ALLOWED_ROLES = [
  "student_leader",
  "salt_coordinator",
  "facilitator",
  "volunteer",
  "mentor",
  "panelist",
  "other",
] as const;

/** PATCH: update profile (e.g. change role) — admin only */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminId = await getAdminUserId();
  if (!adminId) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id: profileId } = await params;
  if (!profileId) {
    return NextResponse.json({ error: "Missing profile id." }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const role = typeof body.role === "string" && ALLOWED_ROLES.includes(body.role as (typeof ALLOWED_ROLES)[number])
    ? body.role
    : undefined;

  if (!role) {
    return NextResponse.json({ error: "Valid role is required." }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("id", profileId)
    .select("id, role")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

/** DELETE: remove user (delete profile and auth user) — admin only */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminId = await getAdminUserId();
  if (!adminId) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id: profileId } = await params;
  if (!profileId) {
    return NextResponse.json({ error: "Missing profile id." }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data: profile, error: fetchError } = await supabase
    .from("profiles")
    .select("auth_user_id")
    .eq("id", profileId)
    .single();

  if (fetchError || !profile?.auth_user_id) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }

  const { error: deleteProfileError } = await supabase
    .from("profiles")
    .delete()
    .eq("id", profileId);

  if (deleteProfileError) {
    return NextResponse.json({ error: deleteProfileError.message }, { status: 500 });
  }

  const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(
    profile.auth_user_id
  );

  if (deleteAuthError) {
    return NextResponse.json(
      { error: deleteAuthError.message || "Profile removed but auth delete failed." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
