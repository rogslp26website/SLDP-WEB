"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Paperclip, Trash2 } from "lucide-react";

type Attachment = { id: string; storage_key: string; file_name: string; content_type: string | null };
type NoticeRow = {
  id: string;
  title: string;
  body: string;
  scope: string;
  created_at: string;
  school_ids: string[];
  attachments: Attachment[];
};
type SchoolRow = { id: string; name: string };

export default function DashboardNoticesClient({
  initialNotices,
  schools,
}: {
  initialNotices: NoticeRow[];
  schools: SchoolRow[];
}) {
  const router = useRouter();
  const [notices, setNotices] = useState(initialNotices);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [scope, setScope] = useState<"general" | "schools">("general");
  const [schoolIds, setSchoolIds] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!title.trim() || !body.trim()) {
      setError("Title and body required.");
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("title", title.trim());
      formData.set("body", body.trim());
      formData.set("scope", scope);
      formData.set("school_ids", JSON.stringify(scope === "schools" ? schoolIds : []));
      attachments.forEach((f) => formData.append("attachments", f));

      const res = await fetch("/api/admin/notices", {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed to add notice.");
        return;
      }
      setTitle("");
      setBody("");
      setSchoolIds([]);
      setAttachments([]);
      const listRes = await fetch("/api/admin/notices");
      const listData = await listRes.json().catch(() => ({}));
      if (Array.isArray(listData.notices)) setNotices(listData.notices);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/notices/${id}`, { method: "DELETE" });
      if (res.ok) setNotices((prev) => prev.filter((n) => n.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  function toggleSchool(id: string) {
    setSchoolIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function onAttachmentChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files) setAttachments(Array.from(files));
  }

  const scopeLabel =
    scope === "general"
      ? "All students and SALT coordinators"
      : "Specific schools (students and SALT coordinators at selected schools)";

  return (
    <div className="space-y-8">
      <form onSubmit={handleAdd} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 max-w-2xl">
        <h3 className="font-medium text-teal-blue">Add notice</h3>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Notice title"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Body *</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[160px]"
            rows={8}
            placeholder="Type your notice content here…"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Scope</label>
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value as "general" | "schools")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="general">All students and SALT coordinators</option>
            <option value="schools">Specific schools (students and SALT coordinators at those schools)</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">{scopeLabel}</p>
        </div>
        {scope === "schools" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Schools</label>
            <div className="flex flex-wrap gap-3">
              {schools.map((s) => (
                <label key={s.id} className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={schoolIds.includes(s.id)}
                    onChange={() => toggleSchool(s.id)}
                    className="rounded border-gray-300 text-teal-blue focus:ring-teal-blue"
                  />
                  {s.name}
                </label>
              ))}
            </div>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Attachments (optional)</label>
          <input
            type="file"
            multiple
            onChange={onAttachmentChange}
            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-medium file:bg-teal-blue/10 file:text-teal-blue file:cursor-pointer hover:file:bg-teal-blue/20"
          />
          {attachments.length > 0 && (
            <p className="mt-1 text-sm text-gray-500">
              <Paperclip className="inline w-4 h-4 mr-1" />
              {attachments.length} file(s): {attachments.map((f) => f.name).join(", ")}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 rounded-lg font-medium bg-lime-green text-white hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? "Adding…" : "Add notice"}
        </button>
      </form>

      <div>
        <h3 className="font-medium text-teal-blue mb-3">Notices ({notices.length})</h3>
        {notices.length === 0 ? (
          <p className="text-gray-500">No notices yet.</p>
        ) : (
          <ul className="space-y-3">
            {notices.map((n) => (
              <li key={n.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between gap-4 p-3">
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-gray-900">{n.title}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      {n.scope === "schools" && n.school_ids.length > 0
                        ? `${n.school_ids.length} school(s)`
                        : "All students and SALT coordinators"}
                    </span>
                    <span className="text-sm text-gray-400 ml-2">
                      {new Date(n.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setExpandedId(expandedId === n.id ? null : n.id)}
                      className="text-sm text-teal-blue hover:underline"
                    >
                      {expandedId === n.id ? "Hide" : "Show body"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(n.id)}
                      disabled={deletingId === n.id}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded disabled:opacity-60"
                      title="Remove notice"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                {expandedId === n.id && (
                  <div className="px-3 pb-3 pt-0 border-t border-gray-100">
                    <div className="text-sm text-gray-700 whitespace-pre-wrap mt-2">{n.body}</div>
                    {n.attachments.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {n.attachments.map((a) => (
                          <a
                            key={a.id}
                            href={a.storage_key ? `/api/admin/notices/attachment?key=${encodeURIComponent(a.storage_key)}` : "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-100 text-sm text-teal-blue hover:bg-gray-200"
                          >
                            <Paperclip size={14} />
                            {a.file_name}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
