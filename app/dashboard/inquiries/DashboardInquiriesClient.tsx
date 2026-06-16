"use client";

import { useState } from "react";

type Submission = {
  id: string;
  full_name: string;
  school_organization: string;
  role: string;
  role_other: string | null;
  phone: string;
  email: string;
  message: string;
  created_at: string;
};

export default function DashboardInquiriesClient({
  initialSubmissions,
}: {
  initialSubmissions: Submission[];
}) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [clearingId, setClearingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  async function handleClear(id: string) {
    setClearingId(id);
    try {
      const res = await fetch(`/api/admin/contact-submissions/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSubmissions((prev) => prev.filter((s) => s.id !== id));
        setConfirmId(null);
      }
    } finally {
      setClearingId(null);
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
              <th className="text-left px-4 py-2 font-semibold text-teal-blue">School / Org</th>
              <th className="text-left px-4 py-2 font-semibold text-teal-blue">Role</th>
              <th className="text-left px-4 py-2 font-semibold text-teal-blue">Email</th>
              <th className="text-left px-4 py-2 font-semibold text-teal-blue">Message</th>
              <th className="text-left px-4 py-2 font-semibold text-teal-blue">Actions</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((s) => (
              <tr key={s.id} className="border-t border-gray-200">
                <td className="px-4 py-2 text-sm text-gray-600">
                  {new Date(s.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 font-medium">{s.full_name}</td>
                <td className="px-4 py-2 text-sm">{s.school_organization}</td>
                <td className="px-4 py-2 text-sm">
                  {s.role}
                  {s.role_other ? ` (${s.role_other})` : ""}
                </td>
                <td className="px-4 py-2 text-sm">
                  <a href={`mailto:${s.email}`} className="text-lime-green hover:underline">
                    {s.email}
                  </a>
                </td>
                <td className="px-4 py-2 text-sm max-w-xs truncate" title={s.message}>
                  {s.message}
                </td>
                <td className="px-4 py-2">
                  <button
                    type="button"
                    onClick={() => setConfirmId(s.id)}
                    className="text-sm font-medium text-teal-blue hover:underline"
                  >
                    Clear
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {confirmId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-clear-title"
        >
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 id="confirm-clear-title" className="text-lg font-semibold text-gray-900 mb-2">
              Clear enquiry?
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure this enquiry has been handled? This will remove it from the list and cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmId(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleClear(confirmId)}
                disabled={clearingId === confirmId}
                className="px-4 py-2 rounded-lg font-medium bg-lime-green text-white hover:opacity-90 disabled:opacity-60"
              >
                {clearingId === confirmId ? "Clearing…" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
