import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

const ROLES = ["student_leader", "salt_coordinator", "facilitator", "volunteer", "mentor", "panelist", "other"] as const;

/** GET: current user's profile (for onboarding check and register page). */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const service = createServiceClient();
  const { data: profile, error } = await service
    .from("profiles")
    .select("id, auth_user_id, full_name, role, school_id, county, phone, alma_mater, how_heard, availability_notes, prior_notice_duration, field_of_practice, onboarding_completed_at, created_at")
    .eq("auth_user_id", user.id)
    .limit(1)
    .single();
  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ profile: profile ?? null });
}

/** POST: create or update profile (onboarding). */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const fullName = typeof body.full_name === "string" ? body.full_name.trim().slice(0, 200) : "";
  const role = body.role;
  const county = typeof body.county === "string" ? body.county.trim().slice(0, 100) : null;
  const phone = typeof body.phone === "string" ? body.phone.replace(/\D/g, "").slice(0, 10) : null;
  const schoolId = typeof body.school_id === "string" && body.school_id ? body.school_id : null;
  const almaMater = typeof body.alma_mater === "string" ? body.alma_mater.trim().slice(0, 200) : null;
  const howHeard = typeof body.how_heard === "string" ? body.how_heard.trim().slice(0, 200) : null;
  const availabilityNotes = typeof body.availability_notes === "string" ? body.availability_notes.trim().slice(0, 500) : null;
  const priorNoticeDuration = typeof body.prior_notice_duration === "string" ? body.prior_notice_duration.trim().slice(0, 200) : null;
  const fieldOfPractice = typeof body.field_of_practice === "string" ? body.field_of_practice.trim().slice(0, 200) : null;

  if (!fullName) {
    return NextResponse.json({ error: "Full name is required." }, { status: 400 });
  }
  if (!role || !ROLES.includes(role)) {
    return NextResponse.json(
      { error: "Role must be one of: student_leader, salt_coordinator, facilitator, volunteer, mentor, panelist, other." },
      { status: 400 }
    );
  }

  const needsSchool = role === "student_leader" || role === "salt_coordinator";
  if (needsSchool && !schoolId) {
    return NextResponse.json(
      { error: "Please select your school (required for Student Leader and SALT Coordinator)." },
      { status: 400 }
    );
  }

  const service = createServiceClient();
  const { data: existing } = await service
    .from("profiles")
    .select("id")
    .eq("auth_user_id", user.id)
    .limit(1)
    .single();

  const row = {
    auth_user_id: user.id,
    full_name: fullName,
    role,
    school_id: schoolId || null,
    county: county || null,
    phone: phone || null,
    alma_mater: almaMater ?? null,
    how_heard: howHeard ?? null,
    availability_notes: availabilityNotes ?? null,
    prior_notice_duration: priorNoticeDuration ?? null,
    field_of_practice: fieldOfPractice ?? null,
    onboarding_completed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (existing?.id) {
    const { error: updateError } = await service
      .from("profiles")
      .update(row)
      .eq("auth_user_id", user.id);
    if (updateError) {
      return NextResponse.json({ error: updateError.message || "Failed to update profile." }, { status: 500 });
    }
  } else {
    const { error: insertError } = await service.from("profiles").insert(row);
    if (insertError) {
      return NextResponse.json({ error: insertError.message || "Failed to save profile." }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
