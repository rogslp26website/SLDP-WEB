"use client";

import { useState } from "react";

type PendingRequest = { id: string; requested_by: string; requested_by_email: string; created_at: string };

export default function DashboardInvitesClient({
  pendingRequests,
  canApprove,
}: {
  pendingRequests: PendingRequest[];
  canApprove: boolean;
}) {
  const [requests, setRequests] = useState(pendingRequests);
  const [link, setLink] = useState("");
  const [creating, setCreating] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);

  async function handleCreateLink() {
    setCreating(true);
    setLink("");
    try {
      const res = await fetch("/api/admin/invites", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.link) setLink(data.link);
    } finally {
      setCreating(false);
    }
  }

  async function handleApprove(id: string) {
    setActingId(id);
    try {
      const res = await fetch(`/api/admin/approvals/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });
      if (res.ok) setRequests((prev) => prev.filter((r) => r.id !== id));
    } finally {
      setActingId(null);
    }
  }

  async function handleReject(id: string) {
    setActingId(id);
    try {
      const res = await fetch(`/api/admin/approvals/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject" }),
      });
      if (res.ok) setRequests((prev) => prev.filter((r) => r.id !== id));
    } finally {
      setActingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <section>
        <h3 className="font-medium text-teal-blue mb-2">Create invite link</h3>
        <p className="text-sm text-gray-600 mb-2">Share this link with someone who should request admin access. They must sign in first, then submit a request. You or the designated approver can approve it.</p>
        <button
          type="button"
          onClick={handleCreateLink}
          disabled={creating}
          className="px-4 py-2 rounded-lg font-medium bg-lime-green text-white hover:opacity-90 disabled:opacity-60"
        >
          {creating ? "Creating…" : "Create invite link"}
        </button>
        {link && (
          <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-xs font-medium text-gray-600 mb-2">Invite link (copy and share)</p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={link}
                className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white font-mono"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(link);
                }}
                className="px-4 py-2 rounded-lg font-medium bg-teal-blue text-white hover:opacity-90 shrink-0"
              >
                Copy
              </button>
            </div>
          </div>
        )}
      </section>
      <section>
        <h3 className="font-medium text-teal-blue mb-2">Pending requests ({requests.length})</h3>
        {!canApprove && requests.length > 0 && (
          <p className="text-sm text-amber-700 mb-2">Only the designated approver can approve or reject requests.</p>
        )}
        {requests.length === 0 ? (
          <p className="text-gray-500">No pending requests.</p>
        ) : (
          <ul className="space-y-2">
            {requests.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-4 bg-white border border-gray-200 rounded-lg p-3">
                <div>
                  <span className="font-medium">{r.requested_by_email || "Unknown"}</span>
                  <span className="text-sm text-gray-500 ml-2">{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
                {canApprove && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleApprove(r.id)}
                      disabled={actingId === r.id}
                      className="px-3 py-1 rounded text-sm bg-lime-green text-white hover:opacity-90 disabled:opacity-60"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(r.id)}
                      disabled={actingId === r.id}
                      className="px-3 py-1 rounded text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                    >
                      Reject
                    </button>
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
