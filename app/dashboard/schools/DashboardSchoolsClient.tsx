"use client";

import { useState } from "react";

type SchoolRow = {
  id: string;
  name: string;
  principal?: string | null;
  salt_coordinator_name?: string | null;
  salt_coordinator_contacts?: string | null;
  county?: string | null;
  address?: string | null;
  created_at?: string;
};

export default function DashboardSchoolsClient({ initialSchools }: { initialSchools: SchoolRow[] }) {
  const [schools, setSchools] = useState(initialSchools);
  const [name, setName] = useState("");
  const [principal, setPrincipal] = useState("");
  const [saltCoordinatorName, setSaltCoordinatorName] = useState("");
  const [saltCoordinatorContacts, setSaltCoordinatorContacts] = useState("");
  const [county, setCounty] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/schools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          principal: principal.trim() || undefined,
          salt_coordinator_name: saltCoordinatorName.trim() || undefined,
          salt_coordinator_contacts: saltCoordinatorContacts.trim() || undefined,
          county: county.trim() || undefined,
          address: address.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed to add school.");
        return;
      }
      if (data.id && !schools.some((s) => s.id === data.id)) {
        setSchools((prev) =>
          [
            {
              id: data.id,
              name: data.name ?? name.trim(),
              principal: data.principal ?? null,
              salt_coordinator_name: data.salt_coordinator_name ?? null,
              salt_coordinator_contacts: data.salt_coordinator_contacts ?? null,
              county: data.county ?? null,
              address: data.address ?? null,
            },
            ...prev,
          ].sort((a, b) => a.name.localeCompare(b.name))
        );
      }
      setName("");
      setPrincipal("");
      setSaltCoordinatorName("");
      setSaltCoordinatorContacts("");
      setCounty("");
      setAddress("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-lg font-medium text-teal-blue mb-3">Add partner school</h3>
        <form onSubmit={handleAdd} className="space-y-3 max-w-xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">School name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="School name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-lime-green focus:border-lime-green"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Principal</label>
            <input
              type="text"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              placeholder="Principal name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-lime-green focus:border-lime-green"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SALT Coordinator</label>
            <input
              type="text"
              value={saltCoordinatorName}
              onChange={(e) => setSaltCoordinatorName(e.target.value)}
              placeholder="Name (will be linked to registered SALT Coordinator account later)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-lime-green focus:border-lime-green"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SALT Coordinator contacts</label>
            <input
              type="text"
              value={saltCoordinatorContacts}
              onChange={(e) => setSaltCoordinatorContacts(e.target.value)}
              placeholder="Email / phone"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-lime-green focus:border-lime-green"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">County</label>
            <input
              type="text"
              value={county}
              onChange={(e) => setCounty(e.target.value)}
              placeholder="County"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-lime-green focus:border-lime-green"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Address"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-lime-green focus:border-lime-green"
            />
          </div>
          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className="px-4 py-2 rounded-lg font-medium bg-lime-green text-white hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "Adding…" : "Add school"}
          </button>
        </form>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </section>
      <section>
        <h3 className="text-lg font-medium text-teal-blue mb-3">Partner schools ({schools.length})</h3>
        {schools.length === 0 ? (
          <p className="text-gray-500">No schools yet. Add one above.</p>
        ) : (
          <ul className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200">
            {schools.map((s) => (
              <li key={s.id} className="px-4 py-3">
                <div className="font-medium">{s.name}</div>
                {(s.principal || s.salt_coordinator_name || s.county || s.address) && (
                  <div className="text-sm text-gray-600 mt-1 space-y-0.5">
                    {s.principal && <div>Principal: {s.principal}</div>}
                    {s.salt_coordinator_name && (
                      <div>
                        SALT Coordinator: {s.salt_coordinator_name}
                        {s.salt_coordinator_contacts && ` · ${s.salt_coordinator_contacts}`}
                      </div>
                    )}
                    {s.county && <div>County: {s.county}</div>}
                    {s.address && <div>Address: {s.address}</div>}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
