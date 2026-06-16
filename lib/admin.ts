import { createClient, createServiceClient } from "@/lib/supabase/server";

/** Returns the current user's id if they are in salt_hub_admins, else null. */
export async function getAdminUserId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const service = createServiceClient();
  const { data: row } = await service
    .from("salt_hub_admins")
    .select("auth_user_id")
    .eq("auth_user_id", user.id)
    .limit(1)
    .single();
  return row ? user.id : null;
}

/** Returns the current user's id if they are admin OR have profile role facilitator (dashboard/calendar access). */
export async function getDashboardUserId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const service = createServiceClient();
  const { data: adminRow } = await service
    .from("salt_hub_admins")
    .select("auth_user_id")
    .eq("auth_user_id", user.id)
    .limit(1)
    .single();
  if (adminRow) return user.id;
  const { data: profile } = await service
    .from("profiles")
    .select("role")
    .eq("auth_user_id", user.id)
    .limit(1)
    .single();
  if (profile?.role === "facilitator") return user.id;
  return null;
}
