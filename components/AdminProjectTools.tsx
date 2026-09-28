"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = ["SCREENING", "ASSESSMENT_COMPLETE", "IN_STRUCTURING", "MATCHING", "IN_DATA_ROOM", "IN_TRANSACTION", "CLOSED", "DECLINED"];

export default function AdminProjectTools({ projectId, status }: { projectId: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function generateMatches() {
    setBusy("match"); setMsg(null);
    const res = await fetch("/api/admin/matches/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectId }) });
    const data = await res.json();
    setMsg(res.ok ? `${data.created} new match(es) queued for review.` : data.error);
    setBusy(null); router.refresh();
  }
  async function draft() {
    setBusy("draft"); setSummary(null);
    const res = await fetch(`/api/admin/projects/${projectId}`, { method: "POST" });
    const data = await res.json();
    setSummary(res.ok ? data.summary : data.error);
    setBusy(null);
  }
  async function setStatus(s: string) {
    await fetch(`/api/admin/projects/${projectId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: s }) });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <button onClick={generateMatches} disabled={!!busy} className="text-sm px-4 py-2 rounded-sm bg-navy text-white hover:bg-navy-light disabled:opacity-50">
          {busy === "match" ? "Matching…" : "Run capital matching"}
        </button>
        <button onClick={draft} disabled={!!busy} className="text-sm px-4 py-2 rounded-sm border border-navy text-navy hover:bg-navy/5 disabled:opacity-50">
          {busy === "draft" ? "Drafting…" : "Draft executive summary (AI)"}
        </button>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border border-line rounded-sm px-2 py-2 text-sm">
          {STATUSES.map((s) => <option key={s} value={s}>{s.replaceAll("_", " ")}</option>)}
        </select>
      </div>
      {msg && <p className="text-sm text-foreground/60">{msg}</p>}
      {summary && (
        <div className="border border-line rounded-sm p-4 bg-white">
          <div className="text-xs text-amber-700 mb-2">AI draft — requires analyst review and editing before any external use.</div>
          <p className="text-sm whitespace-pre-line leading-relaxed">{summary}</p>
        </div>
      )}
    </div>
  );
}
