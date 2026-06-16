import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import Link from "next/link";
import PortalNav from "./PortalNav";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const service = createServiceClient();
  const [studentRow, teacherRow] = await Promise.all([
    service.from("students").select("id, school_id").eq("auth_user_id", user.id).limit(1).single(),
    service.from("teachers").select("id, school_id").eq("auth_user_id", user.id).limit(1).single(),
  ]);
  const participant = studentRow.data ?? teacherRow.data;
  if (!participant) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-teal-blue mb-2">Portal</h1>
        <p className="text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          Access is for registered student leaders and SALT coordinators. Please{" "}
          <Link href="/register" className="text-lime-green font-medium hover:underline">register in the programme</Link> first.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-teal-blue">Participant Portal</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{user.email}</span>
            <Link href="/" className="text-sm text-teal-blue hover:underline">Back to site</Link>
          </div>
        </div>
      </header>
      <PortalNav />
      <main className="max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
