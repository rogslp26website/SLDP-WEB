import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getAdminUserId } from "@/lib/admin";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { data: { user }, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
    if (!sessionError && user) {
      const service = createServiceClient();
      const [profileRes, adminId] = await Promise.all([
        service.from("profiles").select("onboarding_completed_at").eq("auth_user_id", user.id).limit(1).single(),
        getAdminUserId(),
      ]);
      const profile = profileRes.data;
      if (!profile?.onboarding_completed_at) {
        const to = nextParam ? `/onboarding?next=${encodeURIComponent(nextParam)}` : "/onboarding";
        return NextResponse.redirect(`${origin}${to}`);
      }
      if (nextParam) return NextResponse.redirect(`${origin}${nextParam}`);
      if (adminId) return NextResponse.redirect(`${origin}/dashboard`);
      const [studentRow, teacherRow] = await Promise.all([
        service.from("students").select("id").eq("auth_user_id", user.id).limit(1).single(),
        service.from("teachers").select("id").eq("auth_user_id", user.id).limit(1).single(),
      ]);
      if (studentRow.data ?? teacherRow.data) return NextResponse.redirect(`${origin}/portal`);
      return NextResponse.redirect(`${origin}/`);
    }
  }

  return NextResponse.redirect(`${origin}/sign-in?error=auth_callback`);
}
