import { prisma } from "@/lib/prisma";
import { Card, EmptyState } from "@/components/ui";
import ReviewButtons from "@/components/ReviewButtons";

export default async function MatchQueue() {
  const matches = await prisma.match.findMany({
    where: { status: "PENDING_REVIEW" },
    include: { project: true, capitalProvider: true },
    orderBy: { compatibilityScore: "desc" },
  });
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-navy mb-1">Match review queue</h1>
      <p className="text-sm text-foreground/60 mb-8">No match reaches a capital provider until a transaction professional releases it here.</p>
      {matches.length === 0 ? <EmptyState title="Queue is clear" body="AI-generated matches awaiting review will appear here." /> : (
        <div className="space-y-4">
          {matches.map((m) => (
            <Card key={m.id}>
              <div className="flex justify-between">
                <div><div className="font-medium text-navy">{m.project.companyName} → {m.capitalProvider.institutionName}</div>
                <div className="text-sm text-foreground/55">Fit score {m.compatibilityScore}/100</div></div>
              </div>
              <p className="text-sm text-foreground/70 my-3">{m.aiRationale}</p>
              <ReviewButtons url={`/api/admin/matches/${m.id}/review`} releaseLabel="Release to provider" />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
