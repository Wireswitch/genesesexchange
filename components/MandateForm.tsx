"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card } from "@/components/ui";

const COUNTRIES = ["UGANDA", "KENYA", "TANZANIA", "RWANDA", "ZAMBIA", "GHANA", "OTHER"];
const SECTORS = ["ENERGY", "INFRASTRUCTURE", "REAL_ESTATE", "MINING", "OIL_GAS", "TRADE_COMMODITIES", "MANUFACTURING", "HEALTHCARE", "AGRICULTURE", "LOGISTICS", "OTHER"];
const INSTRUMENTS = ["SENIOR_DEBT", "MEZZANINE", "EQUITY", "PROJECT_FINANCE", "TRADE_FINANCE", "PRIVATE_CREDIT", "INFRASTRUCTURE_FINANCE", "BLENDED"];
const TYPES = ["Bank", "Private-credit fund", "Private-equity fund", "Family office", "DFI", "Infrastructure fund", "Real-estate fund", "Commodity financier", "Equipment financier", "Strategic investor"];
const pretty = (v: string) => v.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

interface Initial {
  institutionName: string; institutionType: string; minTicket: number | ""; maxTicket: number | "";
  preferredCountries: string[]; preferredSectors: string[]; instruments: string[];
  minTenorMonths: number | ""; maxTenorMonths: number | ""; currency: string;
  securityRequirements: string; mandateNotes: string;
}

function Chips({ options, value, onChange }: { options: string[]; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value.includes(o);
        return (
          <button type="button" key={o} onClick={() => onChange(on ? value.filter((x) => x !== o) : [...value, o])}
            className={`text-xs px-3 py-1.5 rounded-full border ${on ? "bg-navy text-white border-navy" : "border-line text-foreground/65"}`}>
            {pretty(o)}
          </button>
        );
      })}
    </div>
  );
}

export default function MandateForm({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [f, setF] = useState<Initial>(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const set = <K extends keyof Initial>(k: K, v: Initial[K]) => setF((s) => ({ ...s, [k]: v }));

  async function save() {
    setSaving(true); setMsg(null);
    const res = await fetch("/api/capital-providers", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...f, minTenorMonths: f.minTenorMonths === "" ? null : f.minTenorMonths, maxTenorMonths: f.maxTenorMonths === "" ? null : f.maxTenorMonths }),
    });
    setSaving(false);
    if (!res.ok) { setMsg("Please complete institution name, type and ticket range."); return; }
    setMsg("Mandate saved.");
    router.refresh();
  }

  return (
    <Card className="max-w-2xl space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm text-foreground/70 mb-1">Institution name</label>
          <input className="input" value={f.institutionName} onChange={(e) => set("institutionName", e.target.value)} /></div>
        <div><label className="block text-sm text-foreground/70 mb-1">Institution type</label>
          <select className="input" value={f.institutionType} onChange={(e) => set("institutionType", e.target.value)}>
            <option value="">Select…</option>{TYPES.map((t) => <option key={t}>{t}</option>)}</select></div>
        <div><label className="block text-sm text-foreground/70 mb-1">Minimum ticket</label>
          <input type="number" className="input" value={f.minTicket} onChange={(e) => set("minTicket", e.target.value === "" ? "" : Number(e.target.value))} /></div>
        <div><label className="block text-sm text-foreground/70 mb-1">Maximum ticket</label>
          <input type="number" className="input" value={f.maxTicket} onChange={(e) => set("maxTicket", e.target.value === "" ? "" : Number(e.target.value))} /></div>
        <div><label className="block text-sm text-foreground/70 mb-1">Min tenor (months)</label>
          <input type="number" className="input" value={f.minTenorMonths} onChange={(e) => set("minTenorMonths", e.target.value === "" ? "" : Number(e.target.value))} /></div>
        <div><label className="block text-sm text-foreground/70 mb-1">Max tenor (months)</label>
          <input type="number" className="input" value={f.maxTenorMonths} onChange={(e) => set("maxTenorMonths", e.target.value === "" ? "" : Number(e.target.value))} /></div>
      </div>
      <div><div className="text-sm text-foreground/70 mb-2">Preferred countries (none selected = any)</div><Chips options={COUNTRIES} value={f.preferredCountries} onChange={(v) => set("preferredCountries", v)} /></div>
      <div><div className="text-sm text-foreground/70 mb-2">Preferred sectors (none selected = any)</div><Chips options={SECTORS} value={f.preferredSectors} onChange={(v) => set("preferredSectors", v)} /></div>
      <div><div className="text-sm text-foreground/70 mb-2">Instruments (none selected = any)</div><Chips options={INSTRUMENTS} value={f.instruments} onChange={(v) => set("instruments", v)} /></div>
      <div><label className="block text-sm text-foreground/70 mb-1">Security requirements</label>
        <textarea rows={2} className="input" value={f.securityRequirements} onChange={(e) => set("securityRequirements", e.target.value)} /></div>
      <div><label className="block text-sm text-foreground/70 mb-1">Other criteria and restrictions</label>
        <textarea rows={3} className="input" value={f.mandateNotes} onChange={(e) => set("mandateNotes", e.target.value)} /></div>
      <div className="flex items-center gap-4"><Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save mandate"}</Button>{msg && <span className="text-sm text-foreground/60">{msg}</span>}</div>
    </Card>
  );
}
