export const DAY_RATINGS = ["GREAT", "GOOD", "AVERAGE", "BAD"] as const;
export type DayRatingValue = (typeof DAY_RATINGS)[number];

export function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateJournal(input: Record<string, unknown>) {
  const content = String(input.content ?? "").trim();
  const title = String(input.title ?? "").trim();
  const dayRating = String(input.dayRating ?? "");
  const mood = Number(input.mood);

  if (!content || content.length > 20000) return "Journal content is required and must be under 20,000 characters.";
  if (title.length > 160) return "Title must be 160 characters or fewer.";
  if (!DAY_RATINGS.includes(dayRating as DayRatingValue)) return "Choose a valid day rating.";
  if (!Number.isInteger(mood) || mood < 0 || mood > 100) return "Mood must be between 0 and 100.";
  return null;
}
