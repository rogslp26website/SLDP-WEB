import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

type Role = "student" | "teacher" | "panelist" | "mentor" | "volunteer";

function sanitizeString(value: unknown, maxLength = 500): string {
  if (value == null || typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const role = body.role as Role;
    const validRoles: Role[] = ["student", "teacher", "panelist", "mentor", "volunteer"];
    if (!role || !validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Choose student, teacher, panelist, mentor, or volunteer." },
        { status: 400 }
      );
    }

    const supabaseService = createServiceClient();
    let authUserId: string | null = null;
    if (role === "student" || role === "teacher") {
      const supabaseAuth = await createClient();
      const { data: { user } } = await supabaseAuth.auth.getUser();
      if (!user) {
        return NextResponse.json(
          { error: "You must be signed in to register as Student Leader or SALT Coordinator." },
          { status: 401 }
        );
      }
      authUserId = user.id;
    }

    const supabase = supabaseService;
    const name = sanitizeString(body.name);
    if (!name) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }
    const email = sanitizeString(body.email, 320);
    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }
    const phone = body.phone != null ? sanitizeString(String(body.phone).replace(/\D/g, ""), 10) : null;
    const principalContactRaw = body.principal_contact != null ? sanitizeString(body.principal_contact, 200) : null;
    const principalContact = principalContactRaw ? principalContactRaw.replace(/\D/g, "").slice(0, 10) || null : null;
    const almaMater = body.alma_mater != null ? sanitizeString(body.alma_mater, 200) : null;
    const fieldOfPractice = body.field_of_practice != null ? sanitizeString(body.field_of_practice, 200) : null;
    const howHeard = body.how_heard != null ? sanitizeString(body.how_heard, 200) : null;
    const availabilitySpeaking = body.availability_speaking != null ? sanitizeString(body.availability_speaking, 500) : null;
    const availabilityMentorship = body.availability_mentorship != null ? sanitizeString(body.availability_mentorship, 500) : null;
    const priorNoticeDuration = body.prior_notice_duration != null ? sanitizeString(body.prior_notice_duration, 200) : null;

    if (role === "student" || role === "teacher") {
      const schoolDisplay = body.school_name ?? body.school;
      const schoolIdOrNew = body.school_id;
      let schoolId: string;

      // Both student and teacher must select an existing partner school (only admins can add schools).
      if (!schoolIdOrNew || typeof schoolIdOrNew !== "string") {
        return NextResponse.json(
          { error: "Please select your partner school from the list." },
          { status: 400 }
        );
      }
      const { data: school } = await supabase.from("schools").select("id").eq("id", schoolIdOrNew).single();
      if (!school?.id) {
        return NextResponse.json({ error: "Invalid school selected." }, { status: 400 });
      }
      schoolId = school.id;

      if (role === "student") {
        const grade = sanitizeString(body.grade, 20);
        if (!grade) {
          return NextResponse.json({ error: "Grade is required for students." }, { status: 400 });
        }
        const { data: existingStudent } = await supabase
          .from("students")
          .select("id")
          .eq("email", email)
          .limit(1)
          .single();
        if (existingStudent?.id) {
          const { error: updateError } = await supabase
            .from("students")
            .update({
              auth_user_id: authUserId!,
              name,
              school_id: schoolId,
              grade,
              phone: phone || null,
              principal_contact: principalContact || null,
            })
            .eq("id", existingStudent.id);
          if (updateError) {
            return NextResponse.json(
              { error: updateError.message || "Failed to link student account." },
              { status: 500 }
            );
          }
        } else {
          const { error: insertError } = await supabase.from("students").insert({
            auth_user_id: authUserId!,
            name,
            school_id: schoolId,
            grade,
            email,
            phone: phone || null,
            principal_contact: principalContact || null,
          });
          if (insertError) {
            return NextResponse.json(
              { error: insertError.message || "Failed to save student profile." },
              { status: 500 }
            );
          }
        }
      } else {
        const { data: existingTeacher } = await supabase
          .from("teachers")
          .select("id")
          .eq("email", email)
          .limit(1)
          .single();
        if (existingTeacher?.id) {
          const { error: updateError } = await supabase
            .from("teachers")
            .update({
              auth_user_id: authUserId!,
              name,
              school_id: schoolId,
              phone: phone || null,
              principal_contact: principalContact || null,
            })
            .eq("id", existingTeacher.id);
          if (updateError) {
            return NextResponse.json(
              { error: updateError.message || "Failed to link teacher account." },
              { status: 500 }
            );
          }
        } else {
          const { error: insertError } = await supabase.from("teachers").insert({
            auth_user_id: authUserId!,
            name,
            school_id: schoolId,
            phone: phone || null,
            email,
            principal_contact: principalContact || null,
          });
          if (insertError) {
            return NextResponse.json(
              { error: insertError.message || "Failed to save teacher profile." },
              { status: 500 }
            );
          }
        }
      }

      return NextResponse.json({ success: true });
    }

    if (role === "panelist") {
      const { error: insertError } = await supabase.from("panelists").insert({
        name,
        alma_mater: almaMater || null,
        phone: phone || null,
        email,
        field_of_practice: fieldOfPractice || null,
        how_heard: howHeard || null,
        availability_speaking: availabilitySpeaking || null,
        prior_notice_duration: priorNoticeDuration || null,
      });
      if (insertError) {
        return NextResponse.json(
          { error: insertError.message || "Failed to save panelist registration." },
          { status: 500 }
        );
      }
      return NextResponse.json({ success: true });
    }

    if (role === "mentor") {
      const { error: insertError } = await supabase.from("mentors").insert({
        name,
        alma_mater: almaMater || null,
        phone: phone || null,
        email,
        field_of_practice: fieldOfPractice || null,
        how_heard: howHeard || null,
        availability_mentorship: availabilityMentorship || null,
        prior_notice_duration: priorNoticeDuration || null,
      });
      if (insertError) {
        return NextResponse.json(
          { error: insertError.message || "Failed to save mentor registration." },
          { status: 500 }
        );
      }
      return NextResponse.json({ success: true });
    }

    if (role === "volunteer") {
      const { error: insertError } = await supabase.from("volunteers").insert({
        name,
        alma_mater: almaMater || null,
        phone: phone || null,
        email,
        how_heard: howHeard || null,
        availability_speaking: availabilitySpeaking || null,
        prior_notice_duration: priorNoticeDuration || null,
      });
      if (insertError) {
        return NextResponse.json(
          { error: insertError.message || "Failed to save volunteer registration." },
          { status: 500 }
        );
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
