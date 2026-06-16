import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import RegisterClient from "./RegisterClient";

export default async function RegisterPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const service = createServiceClient();
  const { data: profile } = await service
    .from("profiles")
    .select("role, full_name")
    .eq("auth_user_id", user.id)
    .limit(1)
    .single();

  if (!profile?.role) {
    redirect(`/onboarding?next=${encodeURIComponent("/register")}`);
  }

  return (
    <RegisterClient
      profile={{ role: profile.role, full_name: profile.full_name ?? "" }}
      initialEmail={user.email ?? ""}
    />
  );
}
