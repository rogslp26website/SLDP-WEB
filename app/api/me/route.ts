import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

/** GET: current user info for Navbar (isAdmin, isParticipant). */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ user: null, isAdmin: false, isParticipant: false });
  }

  const service = createServiceClient();
  const [adminRow, profileRow, studentRow, teacherRow] = await Promise.all([
    service.from("salt_hub_admins").select("auth_user_id").eq("auth_user_id", user.id).limit(1).single(),
    service.from("profiles").select("role").eq("auth_user_id", user.id).limit(1).single(),
    service.from("students").select("id").eq("auth_user_id", user.id).limit(1).single(),
    service.from("teachers").select("id").eq("auth_user_id", user.id).limit(1).single(),
  ]);

  const isAdmin = !!adminRow.data?.auth_user_id;
  const isFacilitator = profileRow.data?.role === "facilitator";
  const isParticipant = !!studentRow.data?.id || !!teacherRow.data?.id;

  return NextResponse.json({
    user: { id: user.id, email: user.email ?? undefined },
    isAdmin,
    isFacilitator,
    isParticipant,
  });
}
