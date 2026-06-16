import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getDashboardUserId, getAdminUserId } from "@/lib/admin";

function sanitize(value: unknown, max = 200): string {
  if (value == null || typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

/** GET: list facilitators for dropdown (admin/facilitator only). */
export async function GET() {
  const userId = await getDashboardUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const service = createServiceClient();
  const { data, error } = await service
    .from("facilitators")
    .select("id, name, email, phone")
    .order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

/** POST: add facilitator (admin only). */
export async function POST(request: Request) {
  const adminId = await getAdminUserId();
  if (!adminId) return NextResponse.json({ error: "Forbidden. Admins only." }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const name = sanitize(body.name, 200);
  if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 });

  const service = createServiceClient();
  const { data: row, error } = await service
    .from("facilitators")
    .insert({
      name,
      email: sanitize(body.email, 320) || null,
      phone: sanitize(body.phone, 20) || null,
    })
    .select("id, name, email, phone")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(row);
}
