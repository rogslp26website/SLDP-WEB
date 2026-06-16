import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDashboardUserId, getAdminUserId } from "@/lib/admin";
import Link from "next/link";
import DashboardNav from "./DashboardNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const dashboardUserId = await getDashboardUserId();
  const adminUserId = await getAdminUserId();
  if (!dashboardUserId) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-teal-blue mb-2">Dashboard</h1>
        <p className="text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          Access is limited to SALT Hub administrators and facilitators.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-teal-blue">SALT Hub Admin</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{user.email}</span>
            <Link
              href="/"
              className="text-sm text-teal-blue hover:underline"
            >
              Back to site
            </Link>
          </div>
        </div>
      </header>
      <DashboardNav isAdmin={!!adminUserId} />
      <main className="max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
