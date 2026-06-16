import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import AdminJoinClient from "./AdminJoinClient";

export default async function AdminJoinPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (!token?.trim()) {
    return (
      <div className="max-w-md mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-teal-blue mb-4">Invalid link</h1>
        <p className="text-gray-600">This admin invite link is missing a token. Use the full link shared by an admin.</p>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const service = createServiceClient();
  const { data: tokenRow } = await service
    .from("admin_invite_tokens")
    .select("id")
    .eq("token", token.trim())
    .limit(1)
    .single();

  if (!tokenRow) {
    return (
      <div className="max-w-md mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-teal-blue mb-4">Invalid or expired link</h1>
        <p className="text-gray-600">This invite link is no longer valid. Ask an admin for a new link.</p>
      </div>
    );
  }

  if (!user) {
    redirect(`/sign-in?next=${encodeURIComponent(`/admin-join?token=${encodeURIComponent(token)}`)}`);
  }

  return <AdminJoinClient token={token.trim()} />;
}
