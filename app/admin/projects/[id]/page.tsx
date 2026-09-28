import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, StatusPill } from "@/components/ui";
import ReviewButtons from "@/components/ReviewButtons";
import AdminProjectTools from "@/components/AdminProjectTools";

const pretty = (v: string) => v.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

export default async function AdminProject({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await prisma.project.findUnique({
    where: { id },
    include: { owner: true, documents: true, assessment: true, matches: { include: { capitalProvider: true } }, auditLogs: { orderBy: { createdAt: "desc" }, take: 15 } },
  });
  if (!p) notFound();
  const a = p.assessment;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy">{p.companyName}</h1>
          <p className="text-sm text-foreground/55">{p.owner.name} · {p.owner.email} · {pretty(p.sector)} · {pretty(p.country)} · {p.currency} {p.fundingRequirement.toLocaleString()}</p>
        </div>
        <StatusPill status={p.status} />
      </div>

      <Card><div className="font-medium text-navy mb-2">Description</div><p className="text-sm text-foreground/70 whitespace-pre-line">{p.description}</p></Card>

      <Card>
        <div className="flex justify-between items-center mb-3">
          <div className="font-medium text-navy">AI Capital Readiness Assessment</div>
          {a && <StatusPill status={a.status} />}
        </div>
        {!a ? <p className="text-sm text-foreground/55">Not generated yet — the applicant has not submitted.</p> : (
          <>
            <div className="font-display text-3xl text-gold mb-2">{a.score}<span className="text-base text-foreground/40">/100</span></div>
            <p className="text-xs text-foreground/50 mb-3">Sponsor {a.sponsorScore} · Financial {a.financialScore} · Economics {a.projectEconomicsScore} · Security {a.securityScore} · Regulatory {a.regulatoryScore} · Governance {a.governanceScore}</p>
            <p className="text-sm text-foreground/75 whitespace-pre-line leading-relaxed mb-3">{a.narrative}</p>
            {a.missingDocuments.length > 0 && <p className="text-sm text-foreground/60 mb-3">Missing: {a.missingDocuments.map(pretty).join(", ")}</p>}
            {a.status === "PENDING_REVIEW" && <ReviewButtons url={`/api/admin/assessments/${a.id}/review`} releaseLabel="Approve & release to applicant" />}
          </>
        )}
      </Card>

      <Card>
        <div className="font-medium text-navy mb-3">Tools</div>
        <AdminProjectTools projectId={p.id} status={p.status} />
      </Card>

      <Card>
        <div className="font-medium text-navy mb-3">Matches ({p.matches.length})</div>
        {p.matches.length === 0 ? <p className="text-sm text-foreground/55">No matches yet.</p> : (
          <ul className="divide-y divide-line text-sm">
            {p.matches.map((m) => (
              <li key={m.id} className="py-2 flex justify-between"><span>{m.capitalProvider.institutionName}</span><span className="flex gap-3 items-center"><span className="text-foreground/50">{m.compatibilityScore}</span><StatusPill status={m.status} /></span></li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <div className="font-medium text-navy mb-3">Documents ({p.documents.length})</div>
        <ul className="text-sm divide-y divide-line">{p.documents.map((d) => <li key={d.id} className="py-2 flex justify-between"><a className="text-navy hover:underline" href={d.url} target="_blank">{d.fileName}</a><span className="text-foreground/50">{pretty(d.category)}</span></li>)}</ul>
      </Card>

      <Card>
        <div className="font-medium text-navy mb-3">Audit trail</div>
        <ul className="text-xs text-foreground/60 space-y-1">{p.auditLogs.map((l) => <li key={l.id}>{l.createdAt.toISOString().slice(0, 16).replace("T", " ")} — {l.action}</li>)}</ul>
      </Card>
    </div>
  );
}
