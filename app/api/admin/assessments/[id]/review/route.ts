import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/guard";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireStaff();
  if (!user) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const { action, notes } = await req.json();
  const status = action === "release" ? "RELEASED" : action === "reject" ? "REJECTED" : null;
  if (!status) return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  const a = await prisma.assessment.update({
    where: { id },
    data: { status, reviewedById: user.id, reviewNotes: notes ?? null },
  });
  await prisma.auditLog.create({
    data: { actorId: user.id, projectId: a.projectId, action: `ASSESSMENT_${status}`, detail: { notes } },
  });
  return NextResponse.json({ ok: true });
}
