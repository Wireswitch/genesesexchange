import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/guard";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireStaff();
  if (!user) return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  const { action } = await req.json();
  const status = action === "release" ? "RELEASED" : action === "reject" ? "REJECTED" : null;
  if (!status) return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  const m = await prisma.match.update({ where: { id }, data: { status, reviewedById: user.id } });
  await prisma.auditLog.create({ data: { actorId: user.id, projectId: m.projectId, action: `MATCH_${status}`, detail: { matchId: id } } });
  return NextResponse.json({ ok: true });
}
