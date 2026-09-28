import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/guard";
import { computeCompatibilityScore, generateMatchRationale, ProjectForScoring } from "@/lib/ai";

export const maxDuration = 60;

export async function POST(req: Request) {
  const user = await requireStaff();
  if (!user) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const { projectId } = await req.json();
  const project = await prisma.project.findUnique({ where: { id: projectId }, include: { documents: true } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const p: ProjectForScoring = {
    companyName: project.companyName, country: project.country, sector: project.sector,
    description: project.description, fundingRequirement: project.fundingRequirement,
    currency: project.currency, instrument: project.instrument, desiredTenorMonths: project.desiredTenorMonths,
    existingEquity: project.existingEquity, revenue: project.revenue, ebitda: project.ebitda,
    existingDebt: project.existingDebt, hasCollateral: project.hasCollateral,
    hasOfftakeContracts: project.hasOfftakeContracts, hasGovApprovals: project.hasGovApprovals,
    documentCategories: project.documents.map((d) => d.category),
  };

  const providers = await prisma.capitalProvider.findMany();
  const scored = providers
    .map((prov) => ({ prov, ...computeCompatibilityScore(p, prov as any) }))
    .filter((s) => s.score >= 50)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  let created = 0;
  for (const s of scored) {
    const existing = await prisma.match.findFirst({ where: { projectId, capitalProviderId: s.prov.id } });
    if (existing) continue;
    let rationale = "";
    try {
      rationale = await generateMatchRationale(p, s.prov as any, s.factors, s.score);
    } catch {
      rationale = "Automated rationale unavailable; see compatibility factors.";
    }
    await prisma.match.create({
      data: {
        projectId, capitalProviderId: s.prov.id, compatibilityScore: s.score,
        factors: s.factors as any, aiRationale: rationale, status: "PENDING_REVIEW",
      },
    });
    created++;
  }
  await prisma.project.update({ where: { id: projectId }, data: { status: "MATCHING" } });
  await prisma.auditLog.create({ data: { actorId: user.id, projectId, action: "MATCHES_GENERATED", detail: { created } } });
  return NextResponse.json({ created });
}
