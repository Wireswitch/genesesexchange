"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

export default function SubmitForAssessmentButton({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/submit`, { method: "POST" });
      const data = await res.json();
      if (!res.ok && res.status !== 202) throw new Error(data.error || "Could not submit");
      if (res.status === 202) setError(data.error);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button onClick={submit} disabled={loading}>
        {loading ? "Running Capital Readiness screening…" : "Submit for Capital Readiness Assessment"}
      </Button>
      {error && <p className="text-sm text-amber-700 mt-2 max-w-sm">{error}</p>}
    </div>
  );
}
