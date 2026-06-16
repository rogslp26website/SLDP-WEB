import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getDashboardUserId } from "@/lib/admin";
import DashboardCalendarClient from "./DashboardCalendarClient";

export default async function DashboardCalendarPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");
  const dashboardUserId = await getDashboardUserId();
  if (!dashboardUserId) redirect("/sign-in");

  const service = createServiceClient();
  const [eventsRes, schoolsRes, facilitatorsRes, eventSchoolsRes, eventFacilitatorsRes] = await Promise.all([
    service.from("calendar_events").select("id, title, description, event_date, event_end_date, event_time, event_end_time, participants, scope, created_at").order("event_date", { ascending: true }),
    service.from("schools").select("id, name").order("name"),
    service.from("facilitators").select("id, name, email, phone").order("name"),
    service.from("calendar_event_schools").select("event_id, school_id"),
    service.from("calendar_event_facilitators").select("event_id, facilitator_id"),
  ]);
  const events = eventsRes.data ?? [];
  const byEventSchools: Record<string, string[]> = {};
  for (const r of eventSchoolsRes.data ?? []) {
    if (!byEventSchools[r.event_id]) byEventSchools[r.event_id] = [];
    byEventSchools[r.event_id].push(r.school_id);
  }
  const byEventFacilitators: Record<string, string[]> = {};
  for (const r of eventFacilitatorsRes.data ?? []) {
    if (!byEventFacilitators[r.event_id]) byEventFacilitators[r.event_id] = [];
    byEventFacilitators[r.event_id].push(r.facilitator_id);
  }
  const eventsWithSchoolsAndFacilitators = events.map((e) => ({
    ...e,
    school_ids: byEventSchools[e.id] ?? [],
    facilitator_ids: byEventFacilitators[e.id] ?? [],
  }));
  const schools = schoolsRes.data ?? [];
  const facilitators = facilitatorsRes.data ?? [];

  return (
    <div>
      <h2 className="text-xl font-semibold text-teal-blue mb-4">Calendar</h2>
      <p className="text-gray-600 mb-6">Add events for all schools (general) or for specific schools. Assign up to 4 facilitators per event. Visible to admins and facilitators.</p>
      <DashboardCalendarClient initialEvents={eventsWithSchoolsAndFacilitators} schools={schools} facilitators={facilitators} />
    </div>
  );
}
