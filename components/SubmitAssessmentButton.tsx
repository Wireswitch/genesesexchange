"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SubmitAssessmentButton({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setMsg(null);
    const res = await fetch(`/api/projects/${projectId}/submit`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok && res.status !== 202) setMsg(data.error || "Submission failed");
    else if (res.status === 202) setMsg(data.error);
    setLoading(false);
    router.refresh();
  }

  return (
    <div>
      <button
        onClick={submit}
        disabled={loading}
        className="text-sm font-medium px-4 py-2.5 rounded-sm bg-navy text-white hover:bg-navy-light disabled:opacity-50"
      >
        {loading ? "Submitting and screening…" : "Submit for Capital Readiness Assessment"}
      </button>
      {msg && <p className="text-sm text-amber-700 mt-2">{msg}</p>}
    </div>
  );
}
