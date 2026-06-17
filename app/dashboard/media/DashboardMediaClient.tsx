"use client";

import { useState } from "react";

type ImageItem = { id: string; path: string; alt: string; url?: string };

export default function DashboardMediaClient({ initialImages }: { initialImages: ImageItem[] }) {
  const [images, setImages] = useState(initialImages);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [deletingPath, setDeletingPath] = useState<string | null>(null);

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploadError("");
    setUploading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const files = formData.getAll("file") as File[];
    if (!files.length) {
      setUploadError("Select at least one image.");
      setUploading(false);
      return;
    }
    try {
      const reqData = new FormData();
      files.forEach((f) => reqData.append("file", f));
      const res = await fetch("/api/admin/gallery", { method: "POST", body: reqData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setUploadError(data.error || "Upload failed.");
        return;
      }
      form.reset();
      if (Array.isArray(data.images)) setImages(data.images);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(path: string) {
    setDeletingPath(path);
    try {
      const res = await fetch(`/api/admin/gallery?path=${encodeURIComponent(path)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setImages((prev) => prev.filter((i) => i.path !== path));
      }
    } finally {
      setDeletingPath(null);
    }
  }

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-lg font-medium text-teal-blue mb-3">Upload images</h3>
        <form onSubmit={handleUpload} className="max-w-md">
          <input
            type="file"
            name="file"
            accept=".jpg,.jpeg,.png"
            multiple
            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-medium file:bg-lime-green file:text-white file:cursor-pointer hover:file:opacity-90"
          />
          {uploadError && <p className="mt-2 text-sm text-red-600">{uploadError}</p>}
          <button
            type="submit"
            disabled={uploading}
            className="mt-3 px-4 py-2 rounded-lg font-medium bg-lime-green text-white hover:opacity-90 disabled:opacity-60"
          >
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </form>
      </section>
      <section>
        <h3 className="text-lg font-medium text-teal-blue mb-3">Gallery images ({images.length})</h3>
        {images.length === 0 ? (
          <p className="text-gray-500">No images in the gallery yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {images.map((img) => (
              <div
                key={img.path}
                className="relative group rounded-lg border border-gray-200 overflow-hidden bg-gray-100 aspect-square"
              >
                {img.url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={img.url}
                    alt={img.alt}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    {img.path}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => handleDelete(img.path)}
                    disabled={deletingPath === img.path}
                    className="px-3 py-1.5 rounded bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-60"
                  >
                    {deletingPath === img.path ? "Removing…" : "Remove"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
