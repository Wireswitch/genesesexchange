import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/guard";
import { draftExecutiveSummary } from "@/lib/ai";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireStaff();
  if (!user) return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  const { status } = await req.json();
  await prisma.project.update({ where: { id }, data: { status } });
  await prisma.auditLog.create({ data: { actorId: user.id, projectId: id, action: "STATUS_CHANGED", detail: { status } } });
  return NextResponse.json({ ok: true });
}

// Generates an AI draft executive summary for analyst review (not stored or sent externally).
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireStaff();
  if (!user) return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  const p = await prisma.project.findUnique({ where: { id }, include: { documents: true } });
  if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const summary = await draftExecutiveSummary({ ...p, documentCategories: p.documents.map((d) => d.category) } as any);
  return NextResponse.json({ summary });
}
