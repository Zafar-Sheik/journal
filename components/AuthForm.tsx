"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());

    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) return setError(data.error ?? "Something went wrong.");
    router.push("/journal");
    router.refresh();
  }

  const registering = mode === "register";
  return (
    <form className="auth-card" onSubmit={submit}>
      <div>
        <p className="eyebrow">PRIVATE JOURNAL</p>
        <h1>{registering ? "Create your space" : "Welcome back"}</h1>
        <p className="muted">{registering ? "A quiet place to record your days." : "Sign in to continue your journal."}</p>
      </div>
      {registering && <label>Name<input name="name" autoComplete="name" required minLength={2} /></label>}
      <label>Email<input name="email" type="email" autoComplete="email" required /></label>
      <label>Password<input name="password" type="password" autoComplete={registering ? "new-password" : "current-password"} required minLength={8} /></label>
      {error && <p className="error">{error}</p>}
      <button className="primary" disabled={loading}>{loading ? "Please wait..." : registering ? "Create account" : "Sign in"}</button>
      <p className="muted center">
        {registering ? "Already have an account? " : "New here? "}
        <Link href={registering ? "/login" : "/register"}>{registering ? "Sign in" : "Create an account"}</Link>
      </p>
    </form>
  );
}
