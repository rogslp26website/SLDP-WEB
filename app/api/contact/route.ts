import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

function sanitize(value: unknown, maxLength = 500): string {
  if (value == null || typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const fullName = sanitize(body.full_name, 200);
    const schoolOrganization = sanitize(body.school_organization, 300);
    const role = sanitize(body.role, 100);
    const roleOther = body.role_other != null ? sanitize(body.role_other, 200) : null;
    const phone = sanitize(body.phone, 30).replace(/\D/g, "").slice(0, 10);
    const email = sanitize(body.email, 320);
    const message = sanitize(body.message, 2000);

    if (!fullName) {
      return NextResponse.json({ error: "Full name is required." }, { status: 400 });
    }
    if (!schoolOrganization) {
      return NextResponse.json({ error: "School / organization is required." }, { status: 400 });
    }
    if (!role) {
      return NextResponse.json({ error: "Role / interest area is required." }, { status: 400 });
    }
    if (!phone) {
      return NextResponse.json({ error: "Phone number is required." }, { status: 400 });
    }
    if (!email) {
      return NextResponse.json({ error: "Email address is required." }, { status: 400 });
    }
    if (!message) {
      return NextResponse.json({ error: "Message / inquiry is required." }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { error } = await supabase.from("contact_submissions").insert({
      full_name: fullName,
      school_organization: schoolOrganization,
      role,
      role_other: roleOther,
      phone,
      email,
      message,
    });

    if (error) {
      console.error("Contact submission insert error:", error);
      return NextResponse.json(
        { error: "Failed to save your message. Please try again or email us directly." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Contact API error:", e);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
