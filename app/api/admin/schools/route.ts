import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getAdminUserId } from "@/lib/admin";
import { normalizeSchoolName, sanitizeSchoolDisplayName } from "@/lib/schools";

/** POST: admin add a new partner school */
export async function POST(request: Request) {
  const adminId = await getAdminUserId();
  if (!adminId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const name = typeof body.name === "string" ? sanitizeSchoolDisplayName(body.name.trim()) : "";
  if (!name) {
    return NextResponse.json({ error: "School name is required." }, { status: 400 });
  }

  const nameNormalized = normalizeSchoolName(name);
  const service = createServiceClient();

  const { data: existing } = await service
    .from("schools")
    .select("id, name")
    .eq("name_normalized", nameNormalized)
    .limit(1)
    .single();

  if (existing) {
    return NextResponse.json({ id: existing.id, name: existing.name, message: "School already exists." });
  }

  const sanitize = (v: unknown, max = 500): string =>
    typeof v === "string" ? v.trim().slice(0, max) : "";
  const principal = sanitize(body.principal, 200);
  const salt_coordinator_name = sanitize(body.salt_coordinator_name, 200);
  const salt_coordinator_contacts = sanitize(body.salt_coordinator_contacts, 500);
  const county = sanitize(body.county, 200);
  const address = sanitize(body.address, 500);

  const insertPayload: Record<string, unknown> = {
    name,
    name_normalized: nameNormalized,
  };
  if (principal) insertPayload.principal = principal;
  if (salt_coordinator_name) insertPayload.salt_coordinator_name = salt_coordinator_name;
  if (salt_coordinator_contacts) insertPayload.salt_coordinator_contacts = salt_coordinator_contacts;
  if (county) insertPayload.county = county;
  if (address) insertPayload.address = address;

  const { data: inserted, error } = await service
    .from("schools")
    .insert({ name, name_normalized: nameNormalized })
    .select("id, name")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message || "Failed to create school." }, { status: 500 });
  }
  return NextResponse.json({
    id: inserted.id,
    name: inserted.name,
    principal: principal || null,
    salt_coordinator_name: salt_coordinator_name || null,
    salt_coordinator_contacts: salt_coordinator_contacts || null,
    county: county || null,
    address: address || null,
  });
}
