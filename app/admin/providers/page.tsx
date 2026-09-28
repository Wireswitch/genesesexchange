import { prisma } from "@/lib/prisma";
import { Card, EmptyState, StatusPill } from "@/components/ui";

export default async function AdminProviders() {
  const providers = await prisma.capitalProvider.findMany({ include: { user: true }, orderBy: { createdAt: "desc" } });
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-navy mb-8">Capital providers</h1>
      {providers.length === 0 ? <EmptyState title="No providers yet" body="Providers appear once they save a mandate." /> : (
        <div className="space-y-3">
          {providers.map((p) => (
            <Card key={p.id} className="flex justify-between items-center">
              <div>
                <div className="font-medium text-navy">{p.institutionName} <span className="text-foreground/45 font-normal text-sm">· {p.institutionType}</span></div>
                <div className="text-sm text-foreground/55">{p.user.email} · ${p.minTicket.toLocaleString()}–${p.maxTicket.toLocaleString()}</div>
              </div>
              <div className="flex gap-2 items-center"><StatusPill status={p.user.kycStatus} /><span className="text-xs text-foreground/50">{p.membershipTier}</span></div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
