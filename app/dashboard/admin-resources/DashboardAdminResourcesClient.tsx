"use client";

import { useState } from "react";

type ResourceRow = {
  id: string;
  title: string;
  description: string | null;
  storage_key: string;
  file_label: string | null;
  created_at: string;
};

export default function DashboardAdminResourcesClient({
  initialResources,
}: {
  initialResources: ResourceRow[];
}) {
  const [resources, setResources] = useState(initialResources);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploadError("");
    setUploading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    try {
      const res = await fetch("/api/admin/admin-resources", {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setUploadError(data.error || "Upload failed.");
        return;
      }
      setResources((prev) => [
        {
          id: data.id,
          title: formData.get("title") as string,
          description: (formData.get("description") as string) || null,
          storage_key: "",
          file_label: (formData.get("file_label") as string) || null,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
      form.reset();
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/admin-resources/${id}`, { method: "DELETE" });
      if (res.ok) {
        setResources((prev) => prev.filter((r) => r.id !== id));
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-teal-blue mb-4">Upload file</h2>
        <form onSubmit={handleUpload} className="space-y-4 max-w-md">
          {uploadError && (
            <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded">{uploadError}</p>
          )}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-lime-green focus:border-lime-green"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-lime-green focus:border-lime-green"
            />
          </div>
          <div>
            <label htmlFor="file_label" className="block text-sm font-medium text-gray-700 mb-1">
              File label (e.g. PDF)
            </label>
            <input
              id="file_label"
              name="file_label"
              type="text"
              placeholder="PDF"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-lime-green focus:border-lime-green"
            />
          </div>
          <div>
            <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
              File *
            </label>
            <input
              id="file"
              name="file"
              type="file"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <button
            type="submit"
            disabled={uploading}
            className="px-4 py-2 rounded-lg font-semibold bg-lime-green text-white hover:opacity-90 disabled:opacity-60"
          >
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-teal-blue mb-4">Admin files</h2>
        {resources.length === 0 ? (
          <p className="text-gray-500">No admin resources yet. Upload one above.</p>
        ) : (
          <ul className="space-y-3">
            {resources.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-4 py-3 border-b border-gray-200"
              >
                <div>
                  <span className="font-medium text-teal-blue">{r.title}</span>
                  {r.description && (
                    <p className="text-sm text-gray-600 truncate max-w-md">{r.description}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(r.id)}
                  disabled={deletingId === r.id}
                  className="shrink-0 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                >
                  {deletingId === r.id ? "Removing…" : "Remove"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
