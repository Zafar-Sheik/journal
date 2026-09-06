"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type InitialEntry = {
  id: string;
  title: string | null;
  content: string;
  dayRating: "GREAT" | "GOOD" | "AVERAGE" | "BAD";
  mood: number;
  weatherCondition: string | null;
  temperature: number | null;
  weatherIcon: string | null;
  weatherLocation: string | null;
};

type Weather = {
  condition: string | null;
  description?: string | null;
  temperature: number | null;
  icon: string | null;
  location: string | null;
};

const ratings = [
  ["GREAT", "😄", "Great"],
  ["GOOD", "🙂", "Good"],
  ["AVERAGE", "😐", "Average"],
  ["BAD", "😞", "Bad"],
] as const;

export default function JournalForm({ initial }: { initial?: InitialEntry }) {
  const router = useRouter();
  const [rating, setRating] = useState<InitialEntry["dayRating"]>(initial?.dayRating ?? "GOOD");
  const [mood, setMood] = useState(initial?.mood ?? 50);
  const [weather, setWeather] = useState<Weather | null>(initial ? {
    condition: initial.weatherCondition,
    temperature: initial.temperature,
    icon: initial.weatherIcon,
    location: initial.weatherLocation,
  } : null);
  const [weatherStatus, setWeatherStatus] = useState(initial ? "" : "Getting today's weather...");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial) return;
    if (!navigator.geolocation) {
      setWeatherStatus("Location isn't supported by this browser. You can still save your entry.");
      return;
    }

    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const res = await fetch(`/api/weather?lat=${coords.latitude}&lon=${coords.longitude}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Weather unavailable");
        setWeather(data);
        setWeatherStatus("");
      } catch (err) {
        setWeatherStatus(err instanceof Error ? err.message : "Weather unavailable.");
      }
    }, () => setWeatherStatus("Location permission was not granted. You can still save your entry."), {
      enableHighAccuracy: false,
      timeout: 8000,
      maximumAge: 10 * 60 * 1000,
    });
  }, [initial]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(e.currentTarget);

    const payload = {
      title: form.get("title"),
      content: form.get("content"),
      dayRating: rating,
      mood,
      weatherCondition: weather?.condition ?? null,
      temperature: weather?.temperature ?? null,
      weatherIcon: weather?.icon ?? null,
      weatherLocation: weather?.location ?? null,
    };

    const res = await fetch(initial ? `/api/journal/${initial.id}` : "/api/journal", {
      method: initial ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) return setError(data.error ?? "Could not save entry.");

    router.push(initial ? `/journal/${initial.id}` : `/journal/${data.id}`);
    router.refresh();
  }

  return (
    <form className="entry-form" onSubmit={submit}>
      <section className="entry-heading">
        <div>
          <p className="eyebrow">{new Intl.DateTimeFormat("en-ZA", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date())}</p>
          <h1>{initial ? "Edit your entry" : "How was your day?"}</h1>
        </div>
        <div className="weather-chip">
          {weather?.icon && <img src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`} alt="" width="42" height="42" />}
          <div>
            {weather ? <><strong>{weather.location || "Current location"}</strong><span>{weather.temperature !== null ? `${Math.round(weather.temperature)}°C` : ""} {weather.condition ?? ""}</span></> : <span>{weatherStatus}</span>}
          </div>
        </div>
      </section>

      <section className="field-group">
        <span className="field-label">Rate the overall day</span>
        <div className="rating-grid">
          {ratings.map(([value, emoji, label]) => (
            <button type="button" key={value} className={`rating-button ${rating === value ? "selected" : ""}`} onClick={() => setRating(value)}>
              <span>{emoji}</span><strong>{label}</strong>
            </button>
          ))}
        </div>
      </section>

      <section className="field-group mood-box">
        <div className="mood-labels"><span>😢 Sad</span><strong>Mood {mood}/100</strong><span>Happy 😊</span></div>
        <input className="mood-slider" type="range" min="0" max="100" value={mood} onChange={(e) => setMood(Number(e.target.value))} />
      </section>

      <label>Title <span className="optional">optional</span><input name="title" maxLength={160} defaultValue={initial?.title ?? ""} placeholder="Give today a title" /></label>
      <label>What's on your mind?<textarea name="content" required maxLength={20000} defaultValue={initial?.content ?? ""} placeholder="Write freely. This space is yours." rows={14} /></label>

      {error && <p className="error">{error}</p>}
      <div className="form-actions">
        <button type="button" className="ghost" onClick={() => router.back()}>Cancel</button>
        <button className="primary" disabled={saving}>{saving ? "Saving..." : initial ? "Save changes" : "Save entry"}</button>
      </div>
    </form>
  );
}
