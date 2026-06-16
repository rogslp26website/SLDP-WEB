"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminJoinClient({ token }: { token: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Request failed.");
        return;
      }
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="max-w-md mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-teal-blue mb-4">Request submitted</h1>
        <p className="text-gray-600 mb-6">
          Your request for SALT Hub admin access has been submitted. You will be notified once it is approved.
        </p>
        <a href="/" className="text-lime-green font-medium hover:underline">Back to site</a>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-teal-blue mb-4">Request admin access</h1>
      <p className="text-gray-600 mb-6">
        You can request to become a SALT Hub administrator. Your request will be reviewed; only approved users will get Dashboard access.
      </p>
      <form onSubmit={handleSubmit}>
        {error && <p className="mb-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 rounded-lg font-semibold bg-lime-green text-white hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? "Submitting…" : "Submit request"}
        </button>
      </form>
    </div>
  );
}
