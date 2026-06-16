import Link from "next/link";
import type { ResourceItem } from "@/lib/resources";
import { FileDown } from "lucide-react";

export default function ResourceCard({ item }: { item: ResourceItem }) {
  return (
    <article className="border border-gray-200 rounded-lg p-5 hover:border-teal-blue/50 transition bg-white shadow-sm">
      <h3 className="font-semibold text-teal-blue mb-2">{item.title}</h3>
      <p className="text-sm text-gray-600 mb-4">{item.description}</p>
      {item.fileUrl ? (
        <Link
          href={item.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-lime-green hover:underline"
        >
          <FileDown size={18} />
          Download {item.fileLabel || "file"}
        </Link>
      ) : (
        <span className="text-sm text-gray-400">File unavailable</span>
      )}
    </article>
  );
}
