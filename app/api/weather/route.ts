import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  if (!(await getCurrentUser())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lon = Number(searchParams.get("lon"));
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ error: "Valid coordinates are required." }, { status: 400 });
  }

  const key = process.env.OPENWEATHER_API_KEY;
  if (!key) return NextResponse.json({ error: "Weather API is not configured." }, { status: 500 });

  const url = new URL("https://api.openweathermap.org/data/2.5/weather");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lon));
  url.searchParams.set("appid", key);
  url.searchParams.set("units", "metric");

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) return NextResponse.json({ error: "Unable to retrieve weather." }, { status: 502 });

  const data = await response.json();
  return NextResponse.json({
    condition: data.weather?.[0]?.main ?? null,
    description: data.weather?.[0]?.description ?? null,
    icon: data.weather?.[0]?.icon ?? null,
    temperature: typeof data.main?.temp === "number" ? data.main.temp : null,
    location: data.name ?? null,
  });
}
