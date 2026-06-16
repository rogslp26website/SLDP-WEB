import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getAdminUserId } from "@/lib/admin";

const BUCKET = process.env.BUCKET_RESOURCES ?? "resources";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminId = await getAdminUserId();
  if (!adminId) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Resource id required." }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data: row, error: fetchError } = await supabase
    .from("resources")
    .select("storage_key")
    .eq("id", id)
    .single();

  if (fetchError || !row?.storage_key) {
    return NextResponse.json({ error: "Resource not found." }, { status: 404 });
  }

  await supabase.storage.from(BUCKET).remove([row.storage_key]);
  const { error: deleteError } = await supabase.from("resources").delete().eq("id", id);

  if (deleteError) {
    return NextResponse.json(
      { error: deleteError.message || "Failed to delete resource." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
