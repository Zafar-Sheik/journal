import { notFound } from "next/navigation";
import JournalForm from "@/components/JournalForm";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ id: string }> };
export default async function EditEntryPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) return null;
  const { id } = await params;
  const entry = await prisma.journalEntry.findFirst({ where: { id, userId: user.id } });
  if (!entry) notFound();
  return <main className="page narrow"><JournalForm initial={entry} /></main>;
}
