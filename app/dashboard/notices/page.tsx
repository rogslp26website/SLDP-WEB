import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getDashboardUserId } from "@/lib/admin";
import DashboardNoticesClient from "./DashboardNoticesClient";

export default async function DashboardNoticesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");
  const dashboardUserId = await getDashboardUserId();
  if (!dashboardUserId) redirect("/sign-in");

  const service = createServiceClient();
  const [noticesRes, schoolsRes, noticeSchoolsRes, attachmentsRes] = await Promise.all([
    service.from("notices").select("id, title, body, scope, created_at").order("created_at", { ascending: false }),
    service.from("schools").select("id, name").order("name"),
    service.from("notice_schools").select("notice_id, school_id"),
    service.from("notice_attachments").select("id, notice_id, storage_key, file_name, content_type"),
  ]);

  const notices = noticesRes.data ?? [];
  const schools = schoolsRes.data ?? [];
  const byNotice: Record<string, string[]> = {};
  for (const r of noticeSchoolsRes.data ?? []) {
    if (!byNotice[r.notice_id]) byNotice[r.notice_id] = [];
    byNotice[r.notice_id].push(r.school_id);
  }
  const attachmentsByNotice: Record<string, { id: string; storage_key: string; file_name: string; content_type: string | null }[]> = {};
  for (const a of attachmentsRes.data ?? []) {
    if (!attachmentsByNotice[a.notice_id]) attachmentsByNotice[a.notice_id] = [];
    attachmentsByNotice[a.notice_id].push({
      id: a.id,
      storage_key: a.storage_key,
      file_name: a.file_name,
      content_type: a.content_type ?? null,
    });
  }
  const noticesWithMeta = notices.map((n) => ({
    ...n,
    school_ids: byNotice[n.id] ?? [],
    attachments: attachmentsByNotice[n.id] ?? [],
  }));

  return (
    <div>
      <h2 className="text-xl font-semibold text-teal-blue mb-4">Important Info (Notices)</h2>
      <p className="text-gray-600 mb-6">
        Create notices for participants. Set scope to all students and SALT coordinators, or to specific schools only. You can add attachments.
      </p>
      <DashboardNoticesClient initialNotices={noticesWithMeta} schools={schools} />
    </div>
  );
}
