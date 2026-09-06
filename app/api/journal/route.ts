import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateJournal, type DayRatingValue } from "@/lib/validation";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const error = validateJournal(body);
  if (error) return NextResponse.json({ error }, { status: 400 });

  const entry = await prisma.journalEntry.create({
    data: {
      title: String(body.title ?? "").trim() || null,
      content: String(body.content).trim(),
      dayRating: body.dayRating as DayRatingValue,
      mood: Number(body.mood),
      entryDate: new Date(),
      weatherCondition: body.weatherCondition ? String(body.weatherCondition) : null,
      temperature: typeof body.temperature === "number" ? body.temperature : null,
      weatherIcon: body.weatherIcon ? String(body.weatherIcon) : null,
      weatherLocation: body.weatherLocation ? String(body.weatherLocation) : null,
      userId: user.id,
    },
  });

  return NextResponse.json({ id: entry.id }, { status: 201 });
}
