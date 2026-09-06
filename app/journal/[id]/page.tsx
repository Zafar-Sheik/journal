import Link from "next/link";
import { notFound } from "next/navigation";
import DeleteButton from "@/components/DeleteButton";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const labels = {
  GREAT: "😄 Great",
  GOOD: "🙂 Good",
  AVERAGE: "😐 Average",
  BAD: "😞 Bad",
} as const;

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EntryPage({ params }: Props) {
  const user = await getCurrentUser();

  if (!user) return null;

  const { id } = await params;

  const entry = await prisma.journalEntry.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!entry) notFound();

  const formattedDate = entry.entryDate.toLocaleDateString("en-ZA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formattedTime = entry.entryDate.toLocaleTimeString("en-ZA", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <main className="page narrow">
      <article className="entry-detail">
        <div className="detail-head">
          <div>
            <p className="eyebrow">
              {formattedDate} · {formattedTime}
            </p>

            <h1>{entry.title || "Untitled day"}</h1>
          </div>

          <div className="detail-actions">
            <Link
              href={`/journal/${entry.id}/edit`}
              className="ghost link-button">
              Edit
            </Link>

            <DeleteButton id={entry.id} />
          </div>
        </div>

        <div className="detail-meta">
          <span>{labels[entry.dayRating]}</span>

          <span>Mood {entry.mood}/100</span>

          {entry.weatherCondition && (
            <span>
              {entry.weatherLocation || "Weather"} ·{" "}
              {entry.temperature !== null
                ? `${Math.round(entry.temperature)}°C`
                : ""}{" "}
              {entry.weatherCondition}
            </span>
          )}
        </div>

        <div className="journal-copy">
          {entry.content.split("\n").map((p, i) => (
            <p key={i}>{p || <>&nbsp;</>}</p>
          ))}
        </div>
      </article>
    </main>
  );
}
