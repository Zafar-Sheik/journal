"use client";
import { useRouter } from "next/navigation";

export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter();
  return <button className="danger" onClick={async () => {
    if (!confirm("Delete this journal entry?")) return;
    const res = await fetch(`/api/journal/${id}`, { method: "DELETE" });
    if (res.ok) { router.push("/journal"); router.refresh(); }
  }}>Delete</button>;
}
