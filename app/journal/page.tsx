import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ratingEmoji = {
  GREAT: "😄",
  GOOD: "🙂",
  AVERAGE: "😐",
  BAD: "😞",
} as const;

export default async function JournalPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const entries = await prisma.journalEntry.findMany({
    where: { userId: user.id },
    orderBy: { entryDate: "desc" },
  });

  const averageMood = entries.length
    ? Math.round(entries.reduce((sum, e) => sum + e.mood, 0) / entries.length)
    : null;

  const averageMoodEmoji =
    averageMood === null
      ? ""
      : averageMood < 40
        ? ratingEmoji.BAD
        : averageMood < 60
          ? ratingEmoji.AVERAGE
          : averageMood < 80
            ? ratingEmoji.GOOD
            : ratingEmoji.GREAT;

  return (
    <main className="page dashboard">
      <section className="hero-row">
        <div>
          <p className="eyebrow">YOUR PRIVATE SPACE</p>

          <h1>Good to see you, {user.name.split(" ")[0]}.</h1>

          <p className="muted">
            A record of ordinary days, important moments, and everything in
            between.
          </p>
        </div>

        <Link className="primary link-button" href="/journal/new">
          Write today's entry
        </Link>
      </section>

      <section className="stats-row">
        <div>
          <span>Entries</span>
          <strong>{entries.length}</strong>
        </div>

        <div>
          <span>Average mood</span>

          <strong>
            {averageMood !== null ? `${averageMoodEmoji} ${averageMood}` : "—"}
          </strong>
        </div>

        <div>
          <span>Great days</span>

          <strong>
            {entries.filter((e) => e.dayRating === "GREAT").length}
          </strong>
        </div>
      </section>

      <section>
        <div className="section-title">
          <h2>Recent entries</h2>
        </div>

        {entries.length === 0 ? (
          <div className="empty-state">
            <span>✍️</span>

            <h3>Your journal starts here.</h3>

            <p>
              Write your first entry and begin building a record of your days.
            </p>

            <Link className="primary link-button" href="/journal/new">
              Create first entry
            </Link>
          </div>
        ) : (
          <div className="entry-list">
            {entries.map((entry) => (
              <Link
                key={entry.id}
                href={`/journal/${entry.id}`}
                className="entry-card">
                <div className="entry-date">
                  <span>
                    {entry.entryDate.toLocaleDateString("en-ZA", {
                      day: "2-digit",
                    })}
                  </span>

                  {entry.entryDate.toLocaleDateString("en-ZA", {
                    month: "short",
                  })}

                  <br />

                  {entry.entryDate.toLocaleTimeString("en-ZA", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>

                <div className="entry-preview">
                  <div className="card-topline">
                    <h3>{entry.title || "Untitled day"}</h3>

                    <span>
                      {ratingEmoji[entry.dayRating]}{" "}
                      {entry.dayRating.toLowerCase()}
                    </span>
                  </div>

                  <p>{entry.content}</p>

                  <div className="meta">
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
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
