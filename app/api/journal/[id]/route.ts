import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateJournal, type DayRatingValue } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Ctx) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const existing = await prisma.journalEntry.findFirst({ where: { id, userId: user.id } });
  if (!existing) return NextResponse.json({ error: "Entry not found." }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const error = validateJournal(body);
  if (error) return NextResponse.json({ error }, { status: 400 });

  await prisma.journalEntry.update({
    where: { id },
    data: {
      title: String(body.title ?? "").trim() || null,
      content: String(body.content).trim(),
      dayRating: body.dayRating as DayRatingValue,
      mood: Number(body.mood),
    },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const deleted = await prisma.journalEntry.deleteMany({ where: { id, userId: user.id } });
  if (!deleted.count) return NextResponse.json({ error: "Entry not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
