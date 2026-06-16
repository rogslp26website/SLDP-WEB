"use client";

import { useState, useEffect } from "react";

type FacilitatorRow = { id: string; name: string; email?: string | null; phone?: string | null };
type TeacherRow = { id: string; name: string; email: string };
type AdminRow = { id: string; email: string; full_name: string };

export default function DashboardFacilitatorsClient({
  initialFacilitators,
}: {
  initialFacilitators: FacilitatorRow[];
}) {
  const [facilitators, setFacilitators] = useState(initialFacilitators);
  const [teachers, setTeachers] = useState<TeacherRow[]>([]);
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [facilitatorEmails, setFacilitatorEmails] = useState<Set<string>>(new Set());
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/facilitators/promote-list")
      .then((r) => r.json())
      .then((data) => {
        if (data.teachers) setTeachers(data.teachers);
        if (data.admins) setAdmins(data.admins);
        if (Array.isArray(data.facilitatorEmails)) setFacilitatorEmails(new Set(data.facilitatorEmails.map((e: string) => e.toLowerCase())));
      })
      .catch(() => {});
  }, [facilitators]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/admin/facilitators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() || null, phone: phone.replace(/\D/g, "").slice(0, 10) || null }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed to add.");
        return;
      }
      setFacilitators((prev) => [...prev, data].sort((a, b) => (a.name || "").localeCompare(b.name || "")));
      setName("");
      setEmail("");
      setPhone("");
    } finally {
      setAdding(false);
    }
  }

  async function addFromTeacher(t: TeacherRow) {
    setError("");
    setAdding(true);
    try {
      const res = await fetch("/api/admin/facilitators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: t.name, email: t.email || null }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed to add.");
        return;
      }
      setFacilitators((prev) => [...prev, data].sort((a, b) => (a.name || "").localeCompare(b.name || "")));
    } finally {
      setAdding(false);
    }
  }

  async function addFromAdmin(a: AdminRow) {
    setError("");
    setAdding(true);
    try {
      const res = await fetch("/api/admin/facilitators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: a.full_name, email: a.email || null }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed to add.");
        return;
      }
      setFacilitators((prev) => [...prev, data].sort((a, b) => (a.name || "").localeCompare(b.name || "")));
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    setError("");
    try {
      const res = await fetch(`/api/admin/facilitators/${id}`, { method: "DELETE" });
      if (res.ok) setFacilitators((prev) => prev.filter((f) => f.id !== id));
      else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to remove.");
      }
    } finally {
      setDeletingId(null);
    }
  }

  const teacherAlreadyFacilitator = (t: TeacherRow) => facilitatorEmails.has((t.email || "").toLowerCase());
  const adminAlreadyFacilitator = (a: AdminRow) => facilitatorEmails.has((a.email || "").toLowerCase());

  return (
    <div className="space-y-8">
      <section className="bg-white border border-gray-200 rounded-lg p-4 max-w-2xl">
        <h3 className="font-medium text-teal-blue mb-3">Add facilitator (manual)</h3>
        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
        <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-0.5">Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="px-2 py-1.5 border border-gray-300 rounded text-sm w-40" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-0.5">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="px-2 py-1.5 border border-gray-300 rounded text-sm w-48" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-0.5">Phone (10 digits)</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} className="px-2 py-1.5 border border-gray-300 rounded text-sm w-32" maxLength={10} />
          </div>
          <button type="submit" disabled={adding} className="px-3 py-1.5 text-sm font-medium bg-lime-green text-white rounded disabled:opacity-60">
            {adding ? "Adding…" : "Add"}
          </button>
        </form>
      </section>

      <section className="bg-white border border-gray-200 rounded-lg p-4 max-w-2xl">
        <h3 className="font-medium text-teal-blue mb-3">Promote SALT Coordinator to facilitator</h3>
        <p className="text-sm text-gray-600 mb-3">Add a registered SALT Coordinator (teacher) as a facilitator so they can be assigned to events. Dual role: they remain SALT Coordinator and also appear in the event facilitator dropdown.</p>
        {teachers.filter((t) => !teacherAlreadyFacilitator(t)).length === 0 ? (
          <p className="text-gray-500 text-sm">All SALT Coordinators are already facilitators, or there are none.</p>
        ) : (
          <ul className="space-y-2">
            {teachers.filter((t) => !teacherAlreadyFacilitator(t)).map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-2 py-1">
                <span className="text-sm">{t.name} {t.email && <span className="text-gray-500">({t.email})</span>}</span>
                <button type="button" onClick={() => addFromTeacher(t)} disabled={adding} className="text-sm font-medium text-teal-blue hover:underline disabled:opacity-60">
                  Add as facilitator
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="bg-white border border-gray-200 rounded-lg p-4 max-w-2xl">
        <h3 className="font-medium text-teal-blue mb-3">Add admin as facilitator</h3>
        <p className="text-sm text-gray-600 mb-3">Admins can have a dual role and be assigned to events. Add an admin to the facilitator list.</p>
        {admins.filter((a) => !adminAlreadyFacilitator(a)).length === 0 ? (
          <p className="text-gray-500 text-sm">All admins are already facilitators, or there are none.</p>
        ) : (
          <ul className="space-y-2">
            {admins.filter((a) => !adminAlreadyFacilitator(a)).map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-2 py-1">
                <span className="text-sm">{a.full_name} <span className="text-gray-500">({a.email})</span></span>
                <button type="button" onClick={() => addFromAdmin(a)} disabled={adding} className="text-sm font-medium text-teal-blue hover:underline disabled:opacity-60">
                  Add as facilitator
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="bg-white border border-gray-200 rounded-lg p-4 max-w-2xl">
        <h3 className="font-medium text-teal-blue mb-3">Current facilitators</h3>
        <p className="text-sm text-gray-600 mb-3">These appear in the Calendar event dropdown. Remove to stop assigning them to new events (existing assignments are cleared).</p>
        {facilitators.length === 0 ? (
          <p className="text-gray-500 text-sm">No facilitators yet. Add or promote above.</p>
        ) : (
          <ul className="space-y-2">
            {facilitators.map((f) => (
              <li key={f.id} className="flex items-center justify-between gap-2 py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm">{f.name} {f.email && <span className="text-gray-500">({f.email})</span>}</span>
                <button type="button" onClick={() => handleDelete(f.id)} disabled={deletingId === f.id} className="text-sm text-red-600 hover:underline disabled:opacity-60">
                  {deletingId === f.id ? "Removing…" : "Remove"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
