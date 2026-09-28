import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui";
import RevenueForm from "@/components/RevenueForm";

const TARGET = 1_000_000;
const pretty = (v: string) => v.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

export default async function AdminDashboard() {
  const [projects, providers, revenue, bySector, byCountry, byStatus, pendingAssessments, pendingMatches, capital] = await Promise.all([
    prisma.project.count(),
    prisma.capitalProvider.count(),
    prisma.revenueEvent.groupBy({ by: ["type"], _sum: { amount: true } }),
    prisma.project.groupBy({ by: ["sector"], _count: true }),
    prisma.project.groupBy({ by: ["country"], _count: true }),
    prisma.project.groupBy({ by: ["status"], _count: true }),
    prisma.assessment.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.match.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.project.aggregate({ _sum: { fundingRequirement: true } }),
  ]);
  const totalRevenue = revenue.reduce((s, r) => s + (r._sum.amount ?? 0), 0);
  const pct = Math.min(100, Math.round((totalRevenue / TARGET) * 100));

  const Stat = ({ l, v }: { l: string; v: string | number }) => (
    <Card><div className="text-xs text-foreground/50">{l}</div><div className="font-display text-3xl text-navy mt-1">{v}</div></Card>
  );
  const Group = ({ title, rows }: { title: string; rows: { k: string; n: number }[] }) => (
    <Card>
      <div className="font-medium text-navy mb-3">{title}</div>
      {rows.length === 0 ? <p className="text-sm text-foreground/50">No data yet.</p> : (
        <ul className="text-sm space-y-1">{rows.map((r) => <li key={r.k} className="flex justify-between"><span className="text-foreground/65">{pretty(r.k)}</span><span>{r.n}</span></li>)}</ul>
      )}
    </Card>
  );

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-semibold text-navy">Dashboard</h1>
      <div className="grid sm:grid-cols-4 gap-4">
        <Stat l="Projects" v={projects} />
        <Stat l="Capital providers" v={providers} />
        <Stat l="Capital requested (USD)" v={(capital._sum.fundingRequirement ?? 0).toLocaleString()} />
        <Stat l="Awaiting review" v={pendingAssessments + pendingMatches} />
      </div>
      <Card>
        <div className="flex justify-between items-baseline mb-2">
          <div className="font-medium text-navy">Revenue vs. $1M planning target</div>
          <div className="text-sm text-foreground/60">${totalRevenue.toLocaleString()} ({pct}%)</div>
        </div>
        <div className="h-2 bg-line rounded-full overflow-hidden mb-4"><div className="h-full bg-gold" style={{ width: `${pct}%` }} /></div>
        <ul className="text-sm grid sm:grid-cols-2 gap-1 mb-5">
          {revenue.map((r) => <li key={r.type} className="flex justify-between"><span className="text-foreground/65">{pretty(r.type)}</span><span>${(r._sum.amount ?? 0).toLocaleString()}</span></li>)}
        </ul>
        <RevenueForm />
        <p className="text-xs text-foreground/45 mt-3">The target is a business-planning assumption, not a guaranteed result.</p>
      </Card>
      <div className="grid sm:grid-cols-3 gap-4">
        <Group title="Pipeline by status" rows={byStatus.map((r) => ({ k: r.status, n: r._count }))} />
        <Group title="Projects by sector" rows={bySector.map((r) => ({ k: r.sector, n: r._count }))} />
        <Group title="Projects by country" rows={byCountry.map((r) => ({ k: r.country, n: r._count }))} />
      </div>
    </div>
  );
}
