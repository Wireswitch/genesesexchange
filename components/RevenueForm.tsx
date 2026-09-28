"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const TYPES = ["ASSESSMENT_FEE", "STRUCTURING_FEE", "MANDATE_FEE", "SUCCESS_FEE", "MEMBERSHIP_FEE"];

export default function RevenueForm() {
  const router = useRouter();
  const [type, setType] = useState(TYPES[0]);
  const [amount, setAmount] = useState("");
  async function add() {
    if (!amount) return;
    await fetch("/api/admin/revenue", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type, amount }) });
    setAmount(""); router.refresh();
  }
  return (
    <div className="flex gap-2 items-end flex-wrap">
      <select value={type} onChange={(e) => setType(e.target.value)} className="border border-line rounded-sm px-2 py-1.5 text-sm">
        {TYPES.map((t) => <option key={t} value={t}>{t.replaceAll("_", " ")}</option>)}
      </select>
      <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount (USD)" className="border border-line rounded-sm px-2 py-1.5 text-sm w-36" />
      <button onClick={add} className="text-sm px-3 py-1.5 rounded-sm bg-navy text-white hover:bg-navy-light">Record</button>
    </div>
  );
}
