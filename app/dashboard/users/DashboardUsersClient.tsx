"use client";

import { useState } from "react";

export const ROLE_LABELS: Record<string, string> = {
  student_leader: "Student Leader",
  salt_coordinator: "SALT Coordinator",
  facilitator: "SALT Facilitator/Mentor",
  volunteer: "Volunteer",
  mentor: "SALT Facilitator/Mentor",
  panelist: "Panelist",
  other: "Other",
};

const ROLES = Object.keys(ROLE_LABELS);

type ProfileRow = {
  id: string;
  auth_user_id: string;
  full_name: string;
  role: string;
  school_id: string | null;
  county: string | null;
  phone: string | null;
  prior_notice_duration: string | null;
  availability_notes: string | null;
  created_at: string;
  school_name: string | null;
};

export default function DashboardUsersClient({
  initialProfiles,
}: {
  initialProfiles: ProfileRow[];
}) {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  async function handleRoleChange(profileId: string, newRole: string) {
    setUpdatingId(profileId);
    try {
      const res = await fetch(`/api/admin/profiles/${profileId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setProfiles((prev) =>
          prev.map((p) => (p.id === profileId ? { ...p, role: newRole } : p))
        );
      }
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleRemove(profileId: string) {
    setRemovingId(profileId);
    try {
      const res = await fetch(`/api/admin/profiles/${profileId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setProfiles((prev) => prev.filter((p) => p.id !== profileId));
        setConfirmRemoveId(null);
      }
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 rounded-lg overflow-hidden bg-white">
          <thead className="bg-teal-blue/10">
            <tr>
              <th className="text-left px-4 py-2 font-semibold text-teal-blue">Date</th>
              <th className="text-left px-4 py-2 font-semibold text-teal-blue">Name</th>
              <th className="text-left px-4 py-2 font-semibold text-teal-blue">Role</th>
              <th className="text-left px-4 py-2 font-semibold text-teal-blue">School</th>
              <th className="text-left px-4 py-2 font-semibold text-teal-blue">County</th>
              <th className="text-left px-4 py-2 font-semibold text-teal-blue">Phone</th>
              <th className="text-left px-4 py-2 font-semibold text-teal-blue">Notice period</th>
              <th className="text-left px-4 py-2 font-semibold text-teal-blue">Availability</th>
              <th className="text-left px-4 py-2 font-semibold text-teal-blue">Actions</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((p) => (
              <tr key={p.id} className="border-t border-gray-200">
                <td className="px-4 py-2 text-sm text-gray-600">
                  {new Date(p.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 font-medium">{p.full_name}</td>
                <td className="px-4 py-2 text-sm">
                  <select
                    value={p.role}
                    onChange={(e) => handleRoleChange(p.id, e.target.value)}
                    disabled={updatingId === p.id}
                    className="border border-gray-300 rounded px-2 py-1 text-sm bg-white disabled:opacity-60"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-2 text-sm">{p.school_name ?? "—"}</td>
                <td className="px-4 py-2 text-sm">{p.county ?? "—"}</td>
                <td className="px-4 py-2 text-sm">{p.phone ?? "—"}</td>
                <td className="px-4 py-2 text-sm max-w-[120px] truncate" title={p.prior_notice_duration ?? ""}>
                  {p.prior_notice_duration ?? "—"}
                </td>
                <td className="px-4 py-2 text-sm max-w-[160px] truncate" title={p.availability_notes ?? ""}>
                  {p.availability_notes ?? "—"}
                </td>
                <td className="px-4 py-2">
                  <button
                    type="button"
                    onClick={() => setConfirmRemoveId(p.id)}
                    className="text-sm font-medium text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {confirmRemoveId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-remove-title"
        >
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 id="confirm-remove-title" className="text-lg font-semibold text-gray-900 mb-2">
              Remove user?
            </h3>
            <p className="text-gray-600 mb-6">
              This will remove the user from the platform (profile and sign-in account). This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmRemoveId(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleRemove(confirmRemoveId)}
                disabled={removingId === confirmRemoveId}
                className="px-4 py-2 rounded-lg font-medium bg-red-600 text-white hover:opacity-90 disabled:opacity-60"
              >
                {removingId === confirmRemoveId ? "Removing…" : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
