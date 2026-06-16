import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getDashboardUserId } from "@/lib/admin";

export async function GET() {
  const userId = await getDashboardUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const service = createServiceClient();
  const { data: events, error } = await service
    .from("calendar_events")
    .select("id, title, description, event_date, event_end_date, event_time, event_end_time, participants, scope, created_at")
    .order("event_date", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const [eventSchoolsRes, eventFacilitatorsRes] = await Promise.all([
    service.from("calendar_event_schools").select("event_id, school_id"),
    service.from("calendar_event_facilitators").select("event_id, facilitator_id"),
  ]);
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
  const withSchoolsAndFacilitators = (events ?? []).map((e) => ({
    ...e,
    school_ids: byEventSchools[e.id] ?? [],
    facilitator_ids: byEventFacilitators[e.id] ?? [],
  }));
  return NextResponse.json({ events: withSchoolsAndFacilitators });
}

export async function POST(request: Request) {
  const userId = await getDashboardUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const title = typeof body.title === "string" ? body.title.trim().slice(0, 200) : "";
  const description = typeof body.description === "string" ? body.description.trim().slice(0, 2000) : null;
  const eventDate = body.event_date;
  const eventEndDate = body.event_end_date || null;
  const eventTime = typeof body.event_time === "string" ? body.event_time.slice(0, 8) : null;
  const eventEndTime = typeof body.event_end_time === "string" ? body.event_end_time.slice(0, 8) : null;
  const participants = typeof body.participants === "string" ? body.participants.trim().slice(0, 2000) : null;
  const scope = body.scope === "schools" ? "schools" : "general";
  const schoolIds = Array.isArray(body.school_ids) ? body.school_ids.filter((id: unknown) => typeof id === "string") : [];
  const facilitatorIds = (Array.isArray(body.facilitator_ids) ? body.facilitator_ids.filter((id: unknown) => typeof id === "string") : []).slice(0, 4);
  if (!title || !eventDate) return NextResponse.json({ error: "Title and event date required." }, { status: 400 });

  const service = createServiceClient();
  const basePayload = {
    title,
    description,
    event_date: eventDate,
    event_end_date: eventEndDate || null,
    scope,
    created_by: userId,
  };
  const fullPayload = { ...basePayload } as Record<string, unknown>;
  if (eventTime) fullPayload.event_time = eventTime;
  if (eventEndTime) fullPayload.event_end_time = eventEndTime;
  if (participants) fullPayload.participants = participants;
  let result = await service.from("calendar_events").insert(fullPayload).select("id").single();
  if (result.error && (result.error.message.includes("column") || result.error.message.includes("participants") || result.error.message.includes("event_time"))) {
    result = await service.from("calendar_events").insert(basePayload).select("id").single();
  }
  const { data: event, error: insertError } = result;
  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
  if (scope === "schools" && schoolIds.length > 0 && event?.id) {
    await service.from("calendar_event_schools").insert(schoolIds.map((school_id: string) => ({ event_id: event.id, school_id })));
  }
  if (event?.id && facilitatorIds.length > 0) {
    await service.from("calendar_event_facilitators").insert(facilitatorIds.map((facilitator_id: string) => ({ event_id: event.id, facilitator_id })));
  }
  return NextResponse.json({ id: event?.id });
}
