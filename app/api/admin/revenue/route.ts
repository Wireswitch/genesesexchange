import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/guard";

export async function POST(req: Request) {
  const user = await requireStaff();
  if (!user) return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  const { type, amount, projectId, note } = await req.json();
  await prisma.revenueEvent.create({ data: { type, amount: Number(amount), projectId: projectId || null, note: note || null } });
  return NextResponse.json({ ok: true });
}
