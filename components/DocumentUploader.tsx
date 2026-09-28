"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  "FINANCIAL_STATEMENTS",
  "BUSINESS_PLAN",
  "FEASIBILITY_STUDY",
  "FINANCIAL_MODEL",
  "LICENCE",
  "GOV_APPROVAL",
  "CONTRACT",
  "OFFTAKE_AGREEMENT",
  "CORPORATE",
  "OTHER",
];

export default function DocumentUploader({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload() {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("category", category);
      const res = await fetch(`/api/projects/${projectId}/documents`, { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }
      setFile(null);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <label className="block text-xs text-foreground/60 mb-1">Document type</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="border border-line rounded-sm px-2 py-1.5 text-sm">
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs text-foreground/60 mb-1">File</label>
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="text-sm" />
      </div>
      <button
        onClick={upload}
        disabled={!file || loading}
        className="text-sm font-medium px-4 py-2 rounded-sm bg-navy text-white hover:bg-navy-light disabled:opacity-50"
      >
        {loading ? "Uploading…" : "Upload"}
      </button>
      {error && <p className="text-sm text-red-600 w-full">{error}</p>}
    </div>
  );
}
