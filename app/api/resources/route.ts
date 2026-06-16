import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

const BUCKET = process.env.BUCKET_RESOURCES ?? "resources";

export async function GET() {
  const supabase = createServiceClient();
  const { data: rows, error } = await supabase
    .from("resources")
    .select("id, title, description, storage_key, file_label")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const items = await Promise.all(
    (rows ?? []).map(async (row) => {
      let fileUrl = "";
      try {
        const { data: signed } = await supabase.storage
          .from(BUCKET)
          .createSignedUrl(row.storage_key, 3600);
        fileUrl = signed?.signedUrl ?? "";
      } catch {
        fileUrl = "";
      }
      return {
        id: row.id,
        title: row.title,
        description: row.description ?? "",
        fileUrl,
        fileLabel: row.file_label ?? undefined,
      };
    })
  );

  return NextResponse.json(items);
}
