import Link from "next/link";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import { getCurrentUser } from "@/lib/auth";

export default async function JournalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link href="/journal" className="brand">
          Daybook<span>.</span>
        </Link>
        <nav>
          <Link href="/journal">Entries</Link>
          <Link href="/journal/new" className="nav-new">
            + New entry
          </Link>
          <LogoutButton />
        </nav>
      </header>
      {children}
    </div>
  );
}
