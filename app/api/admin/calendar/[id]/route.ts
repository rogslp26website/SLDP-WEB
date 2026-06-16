import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getDashboardUserId } from "@/lib/admin";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getDashboardUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const service = createServiceClient();
  await service.from("calendar_event_facilitators").delete().eq("event_id", id);
  await service.from("calendar_event_schools").delete().eq("event_id", id);
  const { error } = await service.from("calendar_events").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getDashboardUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
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
  const { data: existing } = await service.from("calendar_events").select("id").eq("id", id).single();
  if (!existing) return NextResponse.json({ error: "Event not found." }, { status: 404 });

  const updatePayload: Record<string, unknown> = {
    title,
    description,
    event_date: eventDate,
    event_end_date: eventEndDate,
    scope,
    event_time: eventTime,
    event_end_time: eventEndTime,
    participants,
  };
  const { error: updateError } = await service.from("calendar_events").update(updatePayload).eq("id", id);
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  await service.from("calendar_event_schools").delete().eq("event_id", id);
  if (scope === "schools" && schoolIds.length > 0) {
    await service.from("calendar_event_schools").insert(schoolIds.map((school_id: string) => ({ event_id: id, school_id })));
  }
  await service.from("calendar_event_facilitators").delete().eq("event_id", id);
  if (facilitatorIds.length > 0) {
    await service.from("calendar_event_facilitators").insert(facilitatorIds.map((facilitator_id: string) => ({ event_id: id, facilitator_id })));
  }
  return NextResponse.json({ success: true });
}
