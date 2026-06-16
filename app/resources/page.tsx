import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import ResourceCard from "@/components/ResourceCard";
import type { ResourceItem } from "@/lib/resources";

const BUCKET = "resources";

export default async function ResourcesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const service = createServiceClient();
  const { data: profile } = await service
    .from("profiles")
    .select("onboarding_completed_at")
    .eq("auth_user_id", user.id)
    .limit(1)
    .single();
  if (!profile?.onboarding_completed_at) {
    redirect(`/onboarding?next=${encodeURIComponent("/resources")}`);
  }

  const [studentRow, teacherRow] = await Promise.all([
    service.from("students").select("id").eq("auth_user_id", user.id).limit(1).single(),
    service.from("teachers").select("id").eq("auth_user_id", user.id).limit(1).single(),
  ]);
  const isParticipant = !!studentRow.data?.id || !!teacherRow.data?.id;
  if (!isParticipant) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-teal-blue mb-2">Resources</h1>
        <p className="text-gray-600 mb-4">Signed in as {user.email}.</p>
        <p className="text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          Access to materials is limited to registered student leaders, SALT coordinators, and facilitators. Volunteers and other roles cannot access materials. If you are a student leader or coordinator, please{" "}
          <a href="/register" className="text-lime-green font-medium hover:underline">register in the programme</a> with a partner school to access materials.
        </p>
      </div>
    );
  }

  const { data: rows } = await service
    .from("resources")
    .select("id, title, description, storage_key, file_label")
    .order("created_at", { ascending: false });

  const items: ResourceItem[] = [];
  for (const row of rows ?? []) {
    let fileUrl = "";
    try {
      const { data: signed } = await service.storage
        .from(BUCKET)
        .createSignedUrl(row.storage_key, 3600);
      fileUrl = signed?.signedUrl ?? "";
    } catch {
      fileUrl = "";
    }
    items.push({
      id: row.id,
      title: row.title,
      description: row.description ?? "",
      fileUrl,
      fileLabel: row.file_label ?? undefined,
    });
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-teal-blue mb-2">Resources</h1>
      <p className="text-gray-600 mb-8">
        Programme materials for participants. Signed in as {user.email}.
      </p>
      {items.length === 0 ? (
        <p className="text-gray-500">No resources available yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <ResourceCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
