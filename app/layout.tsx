import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Daybook — Personal Journal",
  description: "A private personal journal for your days, moods and memories.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
