import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function PortalCalendarPage() {
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

  const { data: events } = await service
    .from("calendar_events")
    .select("id, title, description, event_date, event_end_date, scope")
    .order("event_date", { ascending: true });

  const eventIdsGeneral = (events ?? []).filter((e) => e.scope === "general").map((e) => e.id);
  const { data: eventSchools } = schoolId
    ? await service.from("calendar_event_schools").select("event_id").eq("school_id", schoolId)
    : { data: [] };
  const eventIdsForSchool = (eventSchools ?? []).map((r) => r.event_id);
  const visibleIds = new Set([...eventIdsGeneral, ...eventIdsForSchool]);
  const visible = (events ?? []).filter((e) => visibleIds.has(e.id));

  return (
    <div>
      <h2 className="text-xl font-semibold text-teal-blue mb-4">Calendar</h2>
      <p className="text-gray-600 mb-6">Events for your school and general programme events.</p>
      {visible.length === 0 ? (
        <p className="text-gray-500">No upcoming events. Check back later.</p>
      ) : (
        <ul className="space-y-4">
          {visible.map((ev) => (
            <li key={ev.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="font-medium text-teal-blue">{ev.title}</div>
              <div className="text-sm text-gray-600 mt-1">
                {new Date(ev.event_date).toLocaleDateString(undefined, {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
                {ev.event_end_date && ev.event_end_date !== ev.event_date && (
                  <> – {new Date(ev.event_end_date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</>
                )}
              </div>
              {ev.description && <p className="text-gray-700 mt-2 text-sm">{ev.description}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
