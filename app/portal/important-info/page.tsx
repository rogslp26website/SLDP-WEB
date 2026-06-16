import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function PortalImportantInfoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const service = createServiceClient();
  const [studentRow, teacherRow] = await Promise.all([
    service.from("students").select("school_id").eq("auth_user_id", user.id).limit(1).single(),
    service.from("teachers").select("school_id").eq("auth_user_id", user.id).limit(1).single(),
  ]);
  const schoolId = studentRow.data?.school_id ?? teacherRow.data?.school_id;
  if (!schoolId) redirect("/portal");

  const { data: notices } = await service
    .from("notices")
    .select("id, title, body, scope, created_at")
    .order("created_at", { ascending: false });

  const generalIds = (notices ?? []).filter((n) => n.scope === "general").map((n) => n.id);
  const { data: noticeSchools } = schoolId
    ? await service.from("notice_schools").select("notice_id").eq("school_id", schoolId)
    : { data: [] };
  const schoolNoticeIds = (noticeSchools ?? []).map((r) => r.notice_id);
  const visibleIds = new Set([...generalIds, ...schoolNoticeIds]);
  const visible = (notices ?? []).filter((n) => visibleIds.has(n.id));

  const visibleIdsArr = Array.from(visibleIds);
  const { data: attachments } = visibleIdsArr.length > 0
    ? await service.from("notice_attachments").select("id, notice_id, file_name").in("notice_id", visibleIdsArr)
    : { data: [] };
  const attachmentsByNotice: Record<string, { id: string; file_name: string }[]> = {};
  for (const a of attachments ?? []) {
    if (!attachmentsByNotice[a.notice_id]) attachmentsByNotice[a.notice_id] = [];
    attachmentsByNotice[a.notice_id].push({ id: a.id, file_name: a.file_name });
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-teal-blue mb-4">Important Information</h2>
      <p className="text-gray-600 mb-6">Notices and updates for your school and general programme.</p>
      {visible.length === 0 ? (
        <p className="text-gray-500">No notices at the moment.</p>
      ) : (
        <ul className="space-y-4">
          {visible.map((n) => (
            <li key={n.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="font-medium text-teal-blue">{n.title}</div>
              <div className="text-sm text-gray-500 mt-1">
                {new Date(n.created_at).toLocaleDateString()}
              </div>
              <div className="text-gray-700 mt-2 whitespace-pre-wrap text-sm">{n.body}</div>
              {(attachmentsByNotice[n.id] ?? []).length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {(attachmentsByNotice[n.id] ?? []).map((a) => (
                    <Link
                      key={a.id}
                      href={`/api/portal/notice-attachment?notice_id=${encodeURIComponent(n.id)}&attachment_id=${encodeURIComponent(a.id)}`}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-100 text-sm text-teal-blue hover:bg-gray-200"
                    >
                      📎 {a.file_name}
                    </Link>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
