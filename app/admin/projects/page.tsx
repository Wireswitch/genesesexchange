import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, EmptyState, StatusPill } from "@/components/ui";

export default async function AdminProjects() {
  const projects = await prisma.project.findMany({ orderBy: { updatedAt: "desc" }, include: { assessment: true, owner: true } });
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-navy mb-8">Projects</h1>
      {projects.length === 0 ? <EmptyState title="No projects yet" body="Submitted applications will appear here." /> : (
        <div className="space-y-3">
          {projects.map((p) => (
            <Link key={p.id} href={`/admin/projects/${p.id}`}>
              <Card className="hover:border-navy transition-colors flex justify-between items-center">
                <div>
                  <div className="font-medium text-navy">{p.companyName}</div>
                  <div className="text-sm text-foreground/55">{p.owner.email} · {p.currency} {p.fundingRequirement.toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-3">
                  {p.assessment && <StatusPill status={p.assessment.status} />}
                  <StatusPill status={p.status} />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
