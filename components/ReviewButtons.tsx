"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewButtons({ url, releaseLabel = "Approve & release" }: { url: string; releaseLabel?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function act(action: "release" | "reject") {
    setBusy(true);
    await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <button disabled={busy} onClick={() => act("release")} className="text-sm px-3 py-1.5 rounded-sm bg-navy text-white hover:bg-navy-light disabled:opacity-50">{releaseLabel}</button>
      <button disabled={busy} onClick={() => act("reject")} className="text-sm px-3 py-1.5 rounded-sm border border-line text-foreground/70 hover:bg-red-50 disabled:opacity-50">Reject</button>
    </div>
  );
}
